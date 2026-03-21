import { useState, useCallback } from "react";
import { useAuthStore } from "@stores/auth.store";
import { checkLimit, getLimits } from "@services/subscription.service";
import type { SubscriptionTier } from "@app-types/shared.types";

export function useSubscription() {
  const profile = useAuthStore((s) => s.profile);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<string>();

  const tier: SubscriptionTier = profile?.subscription_tier ?? "free";
  const limits = getLimits(tier);

  const canUseFeature = useCallback(
    (feature: keyof typeof limits, currentCount?: number): boolean => {
      return checkLimit(tier, feature, currentCount);
    },
    [tier]
  );

  const requireUpgrade = useCallback(
    (feature: keyof typeof limits, featureLabel: string, currentCount?: number): boolean => {
      if (checkLimit(tier, feature, currentCount)) {
        return false; // allowed
      }
      setUpgradeFeature(featureLabel);
      setShowUpgrade(true);
      return true; // blocked
    },
    [tier]
  );

  return {
    tier,
    limits,
    canUseFeature,
    requireUpgrade,
    showUpgrade,
    setShowUpgrade,
    upgradeFeature,
  };
}
