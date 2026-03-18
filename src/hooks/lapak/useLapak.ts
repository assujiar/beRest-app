import { useState, useEffect, useCallback } from "react";
import {
  getBusinesses,
  getBusiness,
  getProducts,
  getSalesToday,
  getDailySummary,
  getWeeklySummary,
} from "@services/lapak.service";
import type { Business, Product, SalesEntry, DailySummary } from "@app-types/lapak.types";

/**
 * Hook for Lapak module: businesses, products, daily sales.
 */
export function useLapak(userId: string | null) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBusinesses = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getBusinesses(userId);
      setBusinesses(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  return { businesses, loading, refresh: fetchBusinesses };
}

/**
 * Hook for a single business detail: products, today's sales, daily summary.
 */
export function useLapakDetail(businessId: string | null) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [salesToday, setSalesToday] = useState<SalesEntry[]>([]);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const [biz, prods, sales, summary] = await Promise.all([
        getBusiness(businessId),
        getProducts(businessId),
        getSalesToday(businessId),
        getDailySummary(businessId, today),
      ]);
      setBusiness(biz);
      setProducts(prods);
      setSalesToday(sales);
      setDailySummary(summary);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    business,
    products,
    salesToday,
    dailySummary,
    loading,
    refresh: fetchAll,
  };
}

/**
 * Hook for weekly sales summary.
 */
export function useLapakWeekly(businessId: string | null) {
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const data = await getWeeklySummary(businessId);
      setSummaries(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { summaries, loading, refresh: fetch };
}
