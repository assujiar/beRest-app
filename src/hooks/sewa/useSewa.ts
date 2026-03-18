import { useState, useEffect, useCallback } from "react";
import {
  getProperties,
  getProperty,
  getUnits,
  getBillingByPeriod,
  getPropertySummary,
  getMaintenanceRequests,
} from "@services/sewa.service";
import type {
  Property,
  PropertyUnit,
  RentBilling,
  MaintenanceRequest,
} from "@app-types/sewa.types";

/**
 * Hook for Sewa module: properties list.
 */
export function useSewa(userId: string | null) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProperties = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getProperties(userId);
      setProperties(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return { properties, loading, refresh: fetchProperties };
}

/**
 * Hook for a single property: units, billings, maintenance, summary.
 */
export function useSewaDetail(propertyId: string | null) {
  const [property, setProperty] = useState<Property | null>(null);
  const [units, setUnits] = useState<PropertyUnit[]>([]);
  const [billings, setBillings] = useState<RentBilling[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<
    MaintenanceRequest[]
  >([]);
  const [summary, setSummary] = useState<{
    total: number;
    occupied: number;
    vacant: number;
    totalRent: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    try {
      const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM
      const [prop, unitData, billingData, maintenanceData, summaryData] =
        await Promise.all([
          getProperty(propertyId),
          getUnits(propertyId),
          getBillingByPeriod(propertyId, currentPeriod),
          getMaintenanceRequests(propertyId),
          getPropertySummary(propertyId),
        ]);
      setProperty(prop);
      setUnits(unitData);
      setBillings(billingData);
      setMaintenanceRequests(maintenanceData);
      setSummary(summaryData);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    property,
    units,
    billings,
    maintenanceRequests,
    summary,
    loading,
    refresh: fetchAll,
  };
}
