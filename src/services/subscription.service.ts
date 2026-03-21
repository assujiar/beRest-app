import { supabase } from "./supabase";
import type { SubscriptionTier, BillingCycle } from "@app-types/shared.types";

interface SubscriptionLimits {
  maxModules: number;
  maxMembers: number;
  maxUnits: number;
  maxProducts: number;
  maxGuests: number;
  canExportPDF: boolean;
  canUseAI: boolean;
  canUseAdvancedAnalytics: boolean;
}

const TIER_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    maxModules: 1, maxMembers: 30, maxUnits: 5, maxProducts: 20, maxGuests: 100,
    canExportPDF: false, canUseAI: false, canUseAdvancedAnalytics: false,
  },
  starter: {
    maxModules: 3, maxMembers: 100, maxUnits: 20, maxProducts: 100, maxGuests: 500,
    canExportPDF: true, canUseAI: true, canUseAdvancedAnalytics: false,
  },
  pro: {
    maxModules: 4, maxMembers: 999, maxUnits: 999, maxProducts: 999, maxGuests: 9999,
    canExportPDF: true, canUseAI: true, canUseAdvancedAnalytics: true,
  },
};

// Monthly prices in Rupiah
const MONTHLY_PRICES: Record<SubscriptionTier, number> = {
  free: 0,
  starter: 29000,
  pro: 79000,
};

// Annual prices in Rupiah (hemat 2 bulan = 10 bulan harga)
const ANNUAL_PRICES: Record<SubscriptionTier, number> = {
  free: 0,
  starter: 290000,  // 29.000 x 10 (hemat Rp 58.000)
  pro: 790000,      // 79.000 x 10 (hemat Rp 158.000)
};

export function getLimits(tier: SubscriptionTier): SubscriptionLimits {
  return TIER_LIMITS[tier];
}

export function checkLimit(tier: SubscriptionTier, feature: keyof SubscriptionLimits, currentCount?: number): boolean {
  const limits = TIER_LIMITS[tier];
  const limit = limits[feature];
  if (typeof limit === "boolean") return limit;
  if (typeof limit === "number" && currentCount !== undefined) return currentCount < limit;
  return true;
}

export function getTierLabel(tier: SubscriptionTier): string {
  const labels: Record<SubscriptionTier, string> = { free: "Gratis", starter: "Starter", pro: "Pro" };
  return labels[tier];
}

export function getTierPrice(tier: SubscriptionTier, cycle: BillingCycle = "monthly"): number {
  return cycle === "annual" ? ANNUAL_PRICES[tier] : MONTHLY_PRICES[tier];
}

export function getMonthlyEquivalent(tier: SubscriptionTier, cycle: BillingCycle): number {
  if (cycle === "annual") {
    return Math.round(ANNUAL_PRICES[tier] / 12);
  }
  return MONTHLY_PRICES[tier];
}

export function getAnnualSavings(tier: SubscriptionTier): number {
  return (MONTHLY_PRICES[tier] * 12) - ANNUAL_PRICES[tier];
}

export async function checkSubscription(userId: string): Promise<{
  tier: SubscriptionTier;
  billingCycle: BillingCycle | null;
  isActive: boolean;
  expiresAt: string | null;
}> {
  const { data } = await supabase
    .from("profiles")
    .select("subscription_tier, billing_cycle, subscription_expires_at")
    .eq("id", userId)
    .single();

  if (!data) return { tier: "free", billingCycle: null, isActive: true, expiresAt: null };

  const tier = data.subscription_tier as SubscriptionTier;
  if (tier === "free") return { tier, billingCycle: null, isActive: true, expiresAt: null };

  const billingCycle = (data.billing_cycle as BillingCycle) ?? "monthly";
  const expiresAt = data.subscription_expires_at;
  const isActive = expiresAt ? new Date(expiresAt) > new Date() : false;

  return { tier: isActive ? tier : "free", billingCycle: isActive ? billingCycle : null, isActive, expiresAt };
}
