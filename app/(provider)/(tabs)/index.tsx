import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@components/ui/Card";
import { RoleSwitcher } from "@components/shared/RoleSwitcher";
import { useModulesStore } from "@stores/modules.store";
import { useAuthStore } from "@stores/auth.store";
import { MODULE_COLORS, MODULE_LABELS } from "@utils/colors";
import { formatRupiah } from "@utils/format";
import type { ModuleKey } from "@app-types/shared.types";

interface ModuleSummary {
  key: ModuleKey;
  icon: string;
  stats: { label: string; value: string }[];
}

const MODULE_ICONS: Record<ModuleKey, string> = {
  lapak: "🏪",
  sewa: "🏠",
  warga: "👥",
  hajat: "🎉",
};

const MODULE_EMPTY_STATS: Record<ModuleKey, { label: string; value: string }[]> = {
  lapak: [
    { label: "Omzet hari ini", value: formatRupiah(0) },
    { label: "Order aktif", value: "0" },
  ],
  sewa: [
    { label: "Unit terisi", value: "0/0" },
    { label: "Tagihan pending", value: "0" },
  ],
  warga: [
    { label: "Anggota", value: "0" },
    { label: "Iuran terkumpul", value: formatRupiah(0) },
  ],
  hajat: [
    { label: "Acara aktif", value: "0" },
    { label: "Tamu konfirmasi", value: "0" },
  ],
};

export default function ProviderHomeScreen() {
  const activeModules = useModulesStore((s) => s.activeModules);
  const profile = useAuthStore((s) => s.profile);
  const name = profile?.full_name ?? "Pengelola";

  const summaries: ModuleSummary[] = activeModules.map((key) => ({
    key,
    icon: MODULE_ICONS[key],
    stats: MODULE_EMPTY_STATS[key],
  }));

  return (
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-sm text-grey-text">Halo,</Text>
            <Text className="text-xl font-bold text-dark-text">{name}</Text>
          </View>
          <RoleSwitcher />
        </View>

        {/* Module summary cards */}
        {summaries.map((mod) => (
          <Card key={mod.key}>
            <View className="flex-row items-center mb-3">
              <Text className="text-xl mr-2">{mod.icon}</Text>
              <Text
                className="text-base font-bold"
                style={{ color: MODULE_COLORS[mod.key] }}
              >
                {MODULE_LABELS[mod.key]}
              </Text>
            </View>
            <View className="flex-row">
              {mod.stats.map((stat) => (
                <View key={stat.label} className="flex-1">
                  <Text className="text-xs text-grey-text">{stat.label}</Text>
                  <Text className="text-lg font-bold text-dark-text mt-0.5">
                    {stat.value}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        ))}

        {/* Empty state when no modules */}
        {activeModules.length === 0 && (
          <View className="items-center py-12">
            <Text className="text-5xl mb-4">📋</Text>
            <Text className="text-base font-bold text-dark-text text-center">
              Belum ada module aktif
            </Text>
            <Text className="text-sm text-grey-text text-center mt-2">
              Aktifkan module di Profil untuk mulai mengelola
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
