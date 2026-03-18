import { supabase } from "./supabase";
import type {
  ConsumerConnection,
  ConnectionStatus,
} from "@app-types/shared.types";

/** Grace periods in days per module before auto-archive */
const GRACE_PERIODS: Record<string, number> = {
  sewa: 7,       // 7 days after tenant moves out
  rental: 3,     // 3 days after rental returned
  hajat: 7,      // 7 days after event ends
  laundry: 90,   // 90 days inactive prompt
};

/** Archive a connection (soft delete) */
export async function archiveConnection(
  connectionId: string,
  archivedBy: "consumer" | "provider" | "system",
  reason?: string
): Promise<void> {
  const { error } = await supabase
    .from("consumer_connections")
    .update({
      status: "archived" as ConnectionStatus,
      archived_at: new Date().toISOString(),
      archived_by: archivedBy,
      archive_reason: reason ?? null,
    })
    .eq("id", connectionId);

  if (error) throw error;
}

/** Set auto-archive date for a connection */
export async function setAutoArchiveDate(
  connectionId: string,
  graceKey: string
): Promise<void> {
  const days = GRACE_PERIODS[graceKey] ?? 7;
  const archiveDate = new Date();
  archiveDate.setDate(archiveDate.getDate() + days);

  const { error } = await supabase
    .from("consumer_connections")
    .update({
      auto_archive_at: archiveDate.toISOString(),
    })
    .eq("id", connectionId);

  if (error) throw error;
}

/** Restore an archived connection */
export async function restoreConnection(
  connectionId: string
): Promise<void> {
  const { error } = await supabase
    .from("consumer_connections")
    .update({
      status: "active" as ConnectionStatus,
      archived_at: null,
      archived_by: null,
      archive_reason: null,
      auto_archive_at: null,
    })
    .eq("id", connectionId);

  if (error) throw error;
}

/** Get connections due for auto-archive (used by Edge Function cron) */
export async function getConnectionsDueForArchive(): Promise<
  ConsumerConnection[]
> {
  const { data, error } = await supabase
    .from("consumer_connections")
    .select("*")
    .eq("status", "active")
    .not("auto_archive_at", "is", null)
    .lte("auto_archive_at", new Date().toISOString());

  if (error) throw error;
  return (data ?? []) as ConsumerConnection[];
}

/** Process all due auto-archives (called by cron) */
export async function processAutoArchives(): Promise<number> {
  const due = await getConnectionsDueForArchive();

  for (const conn of due) {
    await archiveConnection(conn.id, "system", "Auto-arsip: masa tenggang habis");
  }

  return due.length;
}
