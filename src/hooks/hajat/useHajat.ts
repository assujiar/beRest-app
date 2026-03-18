import { useState, useEffect, useCallback } from "react";
import {
  getEvents,
  getEvent,
  getGuests,
  getRsvpSummary,
  getGifts,
  getGiftSummary,
} from "@services/hajat.service";
import type {
  HajatEvent,
  EventGuest,
  GiftRecord,
} from "@app-types/hajat.types";

/**
 * Hook for Hajat module: events list.
 */
export function useHajat(userId: string | null) {
  const [events, setEvents] = useState<HajatEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getEvents(userId);
      setEvents(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, refresh: fetchEvents };
}

/**
 * Hook for a single event: guests, RSVP summary.
 */
export function useHajatDetail(eventId: string | null) {
  const [event, setEvent] = useState<HajatEvent | null>(null);
  const [guests, setGuests] = useState<EventGuest[]>([]);
  const [rsvpSummary, setRsvpSummary] = useState<{
    total: number;
    attending: number;
    notAttending: number;
    pending: number;
    totalPax: number;
    checkedIn: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const [eventData, guestData, summary] = await Promise.all([
        getEvent(eventId),
        getGuests(eventId),
        getRsvpSummary(eventId),
      ]);
      setEvent(eventData);
      setGuests(guestData);
      setRsvpSummary(summary);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { event, guests, rsvpSummary, loading, refresh: fetchAll };
}

/**
 * Hook for gift/amplop tracking.
 */
export function useHajatGifts(userId: string | null) {
  const [gifts, setGifts] = useState<GiftRecord[]>([]);
  const [summary, setSummary] = useState<{
    totalGiven: number;
    totalReceived: number;
    balance: number;
    givenCount: number;
    receivedCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [giftData, summaryData] = await Promise.all([
        getGifts(userId),
        getGiftSummary(userId),
      ]);
      setGifts(giftData);
      setSummary(summaryData);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { gifts, summary, loading, refresh: fetch };
}
