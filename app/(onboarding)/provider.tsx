import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@components/ui/Button";
import { UpgradeModal } from "@components/shared/UpgradeModal";
import { useModulesStore } from "@stores/modules.store";
import { useRoleStore } from "@stores/role.store";
import { useAuthStore } from "@stores/auth.store";
import { useSubscription } from "@hooks/shared/useSubscription";
import { upsertProfile } from "@services/auth.service";
import { MODULE_COLORS, MODULE_LABELS } from "@utils/colors";
import type { ModuleKey } from "@app-types/shared.types";

const MODULE_OPTIONS: {
  key: ModuleKey;
  icon: string;
  description: string;
}[] = [
  {
    key: "lapak",
    icon: "🏪",
    description: "Jualan, laundry, les, jasa",
  },
  {
    key: "sewa",
    icon: "🏠",
    description: "Kos, kontrakan, rental barang",
  },
  {
    key: "warga",
    icon: "👥",
    description: "RT/RW, mesjid, pengajian, klub",
  },
  {
    key: "hajat",
    icon: "🎉",
    description: "Undangan, kondangan, amplop",
  },
];

export default function ProviderOnboardingScreen() {
  const [selected, setSelected] = useState<ModuleKey[]>([]);
  const [saving, setSaving] = useState(false);
  const setActiveModules = useModulesStore((s) => s.setActiveModules);
  const setRole = useRoleStore((s) => s.setRole);
  const setActiveView = useRoleStore((s) => s.setActiveView);
  const session = useAuthStore((s) => s.session);
  const setProfile = useAuthStore((s) => s.setProfile);
  const { tier, limits, showUpgrade, setShowUpgrade } = useSubscription();

  function toggleModule(key: ModuleKey) {
    setSelected((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      }
      // Check module limit
      if (prev.length >= limits.maxModules) {
        setShowUpgrade(true);
        return prev;
      }
      return [...prev, key];
    });
  }

  async function handleContinue() {
    setSaving(true);

    // Persist to Supabase
    if (session?.user.id) {
      const { data } = await upsertProfile(session.user.id, {
        role: "provider",
        active_modules: selected,
      });
      if (data) setProfile(data);
    }

    setActiveModules(selected);
    setRole("provider");
    setActiveView("provider");
    setSaving(false);
    router.replace("/(provider)/(tabs)");
  }

  async function handleSkipToConsumer() {
    setSaving(true);

    if (session?.user.id) {
      const { data } = await upsertProfile(session.user.id, {
        role: "consumer",
      });
      if (data) setProfile(data);
    }

    setRole("consumer");
    setActiveView("consumer");
    setSaving(false);
    router.replace("/(consumer)/(tabs)");
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg">
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingTop: 24 }}>
        <Text className="text-2xl font-bold text-dark-text">
          Halo! Mau apik-in apa?
        </Text>
        <Text className="text-sm text-grey-text mt-2 mb-2">
          Pilih minimal 1 modul. Kamu bisa tambah lagi nanti.
        </Text>
        {tier === "free" && (
          <Text className="text-xs text-orange mb-4">
            Paket Gratis: maksimal 1 modul. Upgrade untuk lebih.
          </Text>
        )}
        {tier === "starter" && (
          <Text className="text-xs text-sewa mb-4">
            Paket Starter: maksimal 2 modul.
          </Text>
        )}

        {MODULE_OPTIONS.map((mod) => {
          const isSelected = selected.includes(mod.key);
          return (
            <TouchableOpacity
              key={mod.key}
              onPress={() => toggleModule(mod.key)}
              className={`
                flex-row items-center p-4 rounded-xl mb-3 border-2
                ${isSelected ? "bg-white" : "bg-white border-transparent"}
              `}
              style={
                isSelected
                  ? { borderColor: MODULE_COLORS[mod.key] }
                  : { borderColor: "#E2E8F0" }
              }
              activeOpacity={0.7}
            >
              <Text className="text-3xl mr-4">{mod.icon}</Text>
              <View className="flex-1">
                <Text className="text-base font-bold text-dark-text">
                  {MODULE_LABELS[mod.key]}
                </Text>
                <Text className="text-sm text-grey-text">
                  {mod.description}
                </Text>
              </View>
              <View
                className={`
                  w-6 h-6 rounded-full border-2 items-center justify-center
                  ${isSelected ? "" : "border-border-color"}
                `}
                style={
                  isSelected
                    ? { backgroundColor: MODULE_COLORS[mod.key], borderColor: MODULE_COLORS[mod.key] }
                    : {}
                }
              >
                {isSelected && (
                  <Text className="text-white text-xs font-bold">✓</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom - thumb zone */}
      <View className="px-6 pb-8 pt-4">
        <Button
          title="Lanjut"
          onPress={handleContinue}
          disabled={selected.length === 0}
          loading={saving}
        />
        <TouchableOpacity
          onPress={handleSkipToConsumer}
          className="mt-4 items-center py-2"
        >
          <Text className="text-sm text-grey-text">
            Saya cuma pengguna, bukan pengelola
          </Text>
        </TouchableOpacity>
      </View>

      <UpgradeModal
        visible={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        currentTier={tier}
        featureName="Tambah modul"
      />
    </SafeAreaView>
  );
}
