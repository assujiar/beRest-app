import { useState, useEffect, useCallback } from "react";
import {
  getOrganizations,
  getOrganization,
  getMembers,
  getAnnouncements,
  getFinancialSummary,
  getDuesByPeriod,
  getFundraisings,
} from "@services/warga.service";
import type {
  Organization,
  OrgMember,
  Announcement,
  OrgDues,
  Fundraising,
} from "@app-types/warga.types";

/**
 * Hook for Warga module: organizations list.
 */
export function useWarga(userId: string | null) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrgs = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getOrganizations(userId);
      setOrganizations(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  return { organizations, loading, refresh: fetchOrgs };
}

/**
 * Hook for a single organization: members, dues, announcements, finance.
 */
export function useWargaDetail(orgId: string | null) {
  const [org, setOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dues, setDues] = useState<OrgDues[]>([]);
  const [fundraisings, setFundraisings] = useState<Fundraising[]>([]);
  const [financialSummary, setFinancialSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM
      const [orgData, memberData, announcementData, duesData, fundData, finData] =
        await Promise.all([
          getOrganization(orgId),
          getMembers(orgId),
          getAnnouncements(orgId),
          getDuesByPeriod(orgId, currentPeriod),
          getFundraisings(orgId),
          getFinancialSummary(orgId),
        ]);
      setOrg(orgData);
      setMembers(memberData);
      setAnnouncements(announcementData);
      setDues(duesData);
      setFundraisings(fundData);
      setFinancialSummary(finData);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    org,
    members,
    announcements,
    dues,
    fundraisings,
    financialSummary,
    loading,
    refresh: fetchAll,
  };
}
