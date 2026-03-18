import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { useAuthStore } from "@stores/auth.store";
import { useModulesStore } from "@stores/modules.store";
import {
  getLapakAnalytics,
  getSewaAnalytics,
  getWargaAnalytics,
  getHajatAnalytics,
} from "@services/analytics.service";
import type { AnalyticsSummary, AnalyticsMetric } from "@services/analytics.service";
import { MODULE_COLORS } from "@utils/colors";
import type { ModuleKey } from "@app-types/shared.types";

const FETCH_MAP: Record<ModuleKey, (userId: string) => Promise<AnalyticsSummary>> = {
  lapak: getLapakAnalytics,
  sewa: getSewaAnalytics,
  warga: getWargaAnalytics,
  hajat: getHajatAnalytics,
};

const MODULE_ICONS: Record<ModuleKey, string> = {
  lapak: "🏪",
  sewa: "🏠",
  warga: "👥",
  hajat: "🎉",
};

function TrendBadge({ metric }: { metric: AnalyticsMetric }) {
  if (!metric.trend || metric.trend === "flat") return null;
  const isUp = metric.trend === "up";
  return (
    <Badge
      label={`${isUp ? "↑" : "↓"} ${metric.trendPercent ?? 0}%`}
      variant={isUp ? "success" : "error"}
    />
  );
}

export default function AnalyticsScreen() {
  const session = useAuthStore((s) => s.session);
  const activeModules = useModulesStore((s) => s.activeModules);
  const [summaries, setSummaries] = useState<AnalyticsSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user.id || activeModules.length === 0) {
      setLoading(false);
      return;
    }

    async function fetchAll() {
      setLoading(true);
      try {
        const results = await Promise.all(
          activeModules.map((mod) => FETCH_MAP[mod](session!.user.id))
        );
        setSummaries(results);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [session?.user.id, activeModules]);

  return (
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-border-color bg-white">
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text className="text-lg text-navy">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-dark-text ml-3">
          Analitik
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-3">
        {loading ? (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color="#1B3A5C" />
            <Text className="text-sm text-grey-text mt-3">
              Memuat analitik...
            </Text>
          </View>
        ) : summaries.length === 0 ? (
          <View className="items-center py-16">
            <Text className="text-4xl mb-3">📊</Text>
            <Text className="text-base font-bold text-grey-text">
              Belum ada data
            </Text>
            <Text className="text-sm text-grey-text mt-1 text-center">
              Aktifkan modul dan mulai catat transaksi
            </Text>
          </View>
        ) : (
          summaries.map((summary) => (
            <View key={summary.module} className="mb-4">
              {/* Module header */}
              <View className="flex-row items-center mb-2">
                <Text className="text-xl mr-2">
                  {MODULE_ICONS[summary.module]}
                </Text>
                <Text
                  className="text-base font-bold"
                  style={{ color: MODULE_COLORS[summary.module] }}
                >
                  {summary.label}
                </Text>
              </View>

              {summary.metrics.length === 0 ? (
                <Card>
                  <Text className="text-sm text-grey-text text-center">
                    Belum ada data untuk modul ini
                  </Text>
                </Card>
              ) : (
                <Card>
                  {summary.metrics.map((metric, idx) => (
                    <View
                      key={metric.key}
                      className={`flex-row items-center justify-between ${
                        idx < summary.metrics.length - 1
                          ? "pb-3 mb-3 border-b border-border-color"
                          : ""
                      }`}
                    >
                      <Text className="text-sm text-grey-text flex-1">
                        {metric.label}
                      </Text>
                      <View className="flex-row items-center">
                        <Text className="text-base font-bold text-dark-text mr-2">
                          {metric.formatted}
                        </Text>
                        <TrendBadge metric={metric} />
                      </View>
                    </View>
                  ))}
                </Card>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
