import { supabase } from "./supabase";
import type {
  ConsumerConnection,
  ConnectionStatus,
  ModuleKey,
  ConnectionType,
} from "@app-types/shared.types";

const TABLE = "consumer_connections";

/** Get all active connections for a consumer */
export async function getConsumerConnections(
  consumerId: string,
  status: ConnectionStatus = "active"
): Promise<ConsumerConnection[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("consumer_id", consumerId)
    .eq("status", status)
    .order("connected_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ConsumerConnection[];
}

/** Get all consumers connected to a provider */
export async function getProviderConsumers(
  providerId: string,
  module?: ModuleKey
): Promise<ConsumerConnection[]> {
  let query = supabase
    .from(TABLE)
    .select("*")
    .eq("provider_id", providerId)
    .eq("status", "active");

  if (module) {
    query = query.eq("module", module);
  }

  const { data, error } = await query.order("connected_at", {
    ascending: false,
  });
  if (error) throw error;
  return (data ?? []) as ConsumerConnection[];
}

/** Connect consumer to provider via connection code */
export async function connectByCode(
  consumerId: string,
  code: string
): Promise<ConsumerConnection> {
  // Lookup the code to find provider + module
  const { data: codeData, error: lookupError } = await supabase
    .from("connection_codes")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .single();

  if (lookupError || !codeData) {
    throw new Error("Kode koneksi tidak valid atau sudah kadaluarsa");
  }

  const connection: Partial<ConsumerConnection> = {
    consumer_id: consumerId,
    provider_id: codeData.provider_id,
    module: codeData.module,
    connection_type: codeData.connection_type,
    reference_id: codeData.reference_id,
    connection_code: code.toUpperCase(),
    status: "active",
    connected_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(TABLE)
    .insert(connection)
    .select()
    .single();

  if (error) throw error;
  return data as ConsumerConnection;
}

/** Generate a connection code for a provider entity */
export async function generateConnectionCode(
  providerId: string,
  module: ModuleKey,
  connectionType: ConnectionType,
  referenceId?: string
): Promise<string> {
  const prefix = module.substring(0, 3).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const code = `${prefix}-${random}`;

  const { error } = await supabase.from("connection_codes").insert({
    code,
    provider_id: providerId,
    module,
    connection_type: connectionType,
    reference_id: referenceId ?? null,
    is_active: true,
  });

  if (error) throw error;
  return code;
}

/** Disconnect (archive) a connection */
export async function disconnectConnection(
  connectionId: string,
  archivedBy: "consumer" | "provider",
  reason?: string
): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({
      status: "archived" as ConnectionStatus,
      archived_at: new Date().toISOString(),
      archived_by: archivedBy,
      archive_reason: reason ?? null,
    })
    .eq("id", connectionId);

  if (error) throw error;
}

/** Get archived connections for consumer */
export async function getArchivedConnections(
  consumerId: string
): Promise<ConsumerConnection[]> {
  return getConsumerConnections(consumerId, "archived");
}
