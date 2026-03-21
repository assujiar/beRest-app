import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Modal } from "@components/ui/Modal";
import { Button } from "@components/ui/Button";
import { Card } from "@components/ui/Card";
import {
  getTierLabel,
  getTierPrice,
  getMonthlyEquivalent,
  getAnnualSavings,
} from "@services/subscription.service";
import { formatRupiah } from "@utils/format";
import type { SubscriptionTier, BillingCycle } from "@app-types/shared.types";

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  currentTier: SubscriptionTier;
  featureName?: string;
}

const TIER_FEATURES: Record<SubscriptionTier, string[]> = {
  free: ["1 modul aktif", "30 anggota/penghuni", "5 unit", "20 produk"],
  starter: [
    "3 modul aktif",
    "100 anggota/penghuni",
    "20 unit",
    "100 produk",
    "Export PDF",
    "AI scan nota",
  ],
  pro: [
    "Semua modul",
    "Unlimited anggota",
    "Unlimited unit",
    "Unlimited produk",
    "Export PDF & CSV",
    "AI scan nota",
    "Analitik lanjutan",
  ],
};

export function UpgradeModal({
  visible,
  onClose,
  currentTier,
  featureName,
}: UpgradeModalProps) {
  const [cycle, setCycle] = useState<BillingCycle>("annual");
  const tiers: SubscriptionTier[] = ["free", "starter", "pro"];
  const upgradeTiers = tiers.filter(
    (t) => tiers.indexOf(t) > tiers.indexOf(currentTier)
  );

  return (
    <Modal visible={visible} onClose={onClose} title="Upgrade Apick">
      {featureName && (
        <Text className="text-sm text-grey-text mb-3">
          Fitur &quot;{featureName}&quot; membutuhkan paket lebih tinggi.
        </Text>
      )}

      {/* Billing cycle toggle */}
      <View className="flex-row bg-white rounded-xl border border-border-color p-1 mb-4">
        <TouchableOpacity
          onPress={() => setCycle("monthly")}
          className={`flex-1 py-2.5 rounded-lg items-center ${
            cycle === "monthly" ? "bg-navy" : ""
          }`}
        >
          <Text
            className={`text-sm font-bold ${
              cycle === "monthly" ? "text-white" : "text-grey-text"
            }`}
          >
            Bulanan
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setCycle("annual")}
          className={`flex-1 py-2.5 rounded-lg items-center ${
            cycle === "annual" ? "bg-navy" : ""
          }`}
        >
          <Text
            className={`text-sm font-bold ${
              cycle === "annual" ? "text-white" : "text-grey-text"
            }`}
          >
            Tahunan
          </Text>
          <Text
            className={`text-[10px] ${
              cycle === "annual" ? "text-orange" : "text-green-600"
            }`}
          >
            Hemat 2 bulan
          </Text>
        </TouchableOpacity>
      </View>

      {upgradeTiers.map((tier) => {
        const price = getTierPrice(tier, cycle);
        const savings = getAnnualSavings(tier);
        const monthlyEq = getMonthlyEquivalent(tier, cycle);

        return (
          <Card key={tier}>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-bold text-dark-text">
                {getTierLabel(tier)}
              </Text>
              <View className="items-end">
                <Text className="text-lg font-bold text-orange">
                  {price === 0
                    ? "Gratis"
                    : cycle === "annual"
                      ? `${formatRupiah(price)}/thn`
                      : `${formatRupiah(price)}/bln`}
                </Text>
                {cycle === "annual" && price > 0 && (
                  <Text className="text-xs text-grey-text">
                    = {formatRupiah(monthlyEq)}/bln
                  </Text>
                )}
              </View>
            </View>

            {cycle === "annual" && savings > 0 && (
              <View className="bg-green-50 rounded-lg px-3 py-1.5 mb-2 self-start">
                <Text className="text-xs text-green-700 font-bold">
                  Hemat {formatRupiah(savings)}/tahun
                </Text>
              </View>
            )}

            {TIER_FEATURES[tier].map((feat) => (
              <View key={feat} className="flex-row items-center mb-1">
                <Text className="text-green-600 mr-2">✓</Text>
                <Text className="text-sm text-dark-text">{feat}</Text>
              </View>
            ))}
            <View className="mt-3">
              <Button
                title={`Pilih ${getTierLabel(tier)}`}
                variant={tier === "pro" ? "primary" : "secondary"}
                onPress={() => {
                  // Future: payment integration
                  onClose();
                }}
              />
            </View>
          </Card>
        );
      })}
    </Modal>
  );
}
