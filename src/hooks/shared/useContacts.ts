import { useState, useEffect, useCallback } from "react";
import {
  getContacts,
  searchContacts,
  createContact,
  updateContact,
  deleteContact,
} from "@services/contact.service";
import type { Contact } from "@app-types/shared.types";

/**
 * Hook for managing contacts: list, search, CRUD.
 */
export function useContacts(userId: string | null) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getContacts(userId);
      setContacts(data);
    } catch (e) {
      setError("Gagal memuat kontak");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const search = useCallback(
    async (query: string) => {
      if (!userId || !query.trim()) {
        await fetchContacts();
        return;
      }
      setLoading(true);
      try {
        const data = await searchContacts(userId, query);
        setContacts(data);
      } catch {
        // keep existing list on search error
      } finally {
        setLoading(false);
      }
    },
    [userId, fetchContacts]
  );

  const addContact = useCallback(
    async (contact: Omit<Contact, "id" | "user_id" | "created_at">) => {
      if (!userId) throw new Error("User not authenticated");
      const newContact = await createContact(userId, contact);
      setContacts((prev) => [newContact, ...prev]);
      return newContact;
    },
    [userId]
  );

  const editContact = useCallback(
    async (
      id: string,
      updates: Partial<Omit<Contact, "id" | "user_id" | "created_at">>
    ) => {
      const updated = await updateContact(id, updates);
      setContacts((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    },
    []
  );

  const removeContact = useCallback(async (id: string) => {
    await deleteContact(id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return {
    contacts,
    loading,
    error,
    refresh: fetchContacts,
    search,
    addContact,
    editContact,
    removeContact,
  };
}
