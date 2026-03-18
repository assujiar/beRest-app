import { supabase } from "./supabase";
import type { Contact } from "@app-types/shared.types";

const TABLE = "contacts";

export async function getContacts(userId: string): Promise<Contact[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("name");

  if (error) throw error;
  return (data ?? []) as Contact[];
}

export async function getContact(id: string): Promise<Contact | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Contact;
}

export async function createContact(
  userId: string,
  contact: Omit<Contact, "id" | "user_id" | "created_at">
): Promise<Contact> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...contact, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data as Contact;
}

export async function updateContact(
  id: string,
  updates: Partial<Omit<Contact, "id" | "user_id" | "created_at">>
): Promise<Contact> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Contact;
}

export async function deleteContact(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

export async function searchContacts(
  userId: string,
  query: string
): Promise<Contact[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
    .order("name")
    .limit(20);

  if (error) throw error;
  return (data ?? []) as Contact[];
}
