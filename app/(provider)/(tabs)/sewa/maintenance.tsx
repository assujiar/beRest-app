import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { EmptyState } from "@components/shared/EmptyState";
import { getMaintenanceRequests, updateMaintenanceStatus } from "@services/sewa.service";
import { useUIStore } from "@stores/ui.store";
import { formatRelativeTime } from "@utils/format";
import type { MaintenanceRequest, MaintenanceStatus, MaintenancePriority } from "@app-types/sewa.types";

const STATUS_MAP: Record<MaintenanceStatus, { label: string; variant: "info" | "warning" | "success" | "error" }> = {
  pending: { label: "Menunggu", variant: "warning" }, in_progress: { label: "Dikerjakan", variant: "info" },
  completed: { label: "Selesai", variant: "success" }, rejected: { label: "Ditolak", variant: "error" },
};
const PRIORITY_MAP: Record<MaintenancePriority, string> = { low: "🟢", medium: "🟡", high: "🔴" };

export default function MaintenanceScreen() {
  const { propId } = useLocalSearchParams<{ propId: string }>();
  const showToast = useUIStore((s) => s.showToast);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (propId) loadData(); }, [propId]);

  async function loadData() {
    try { setRequests(await getMaintenanceRequests(propId!)); } catch { /* silent */ } finally { setLoading(false); }
  }

  async function handleUpdateStatus(id: string, status: MaintenanceStatus) {
    try { await updateMaintenanceStatus(id, status); showToast("Status diupdate", "success"); loadData(); }
    catch { showToast("Gagal update", "error"); }
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-border-color bg-white">
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}><Text className="text-lg text-navy">←</Text></TouchableOpacity>
        <Text className="text-lg font-bold text-dark-text ml-3">Maintenance</Text>
      </View>
      <ScrollView className="flex-1 px-4 pt-3">
        {!loading && requests.length === 0 ? (
          <EmptyState illustration="🔧" title="Tidak ada permintaan" description="Permintaan perbaikan dari penghuni akan muncul di sini" />
        ) : (
          requests.map((r) => {
            const s = STATUS_MAP[r.status];
            return (
              <Card key={r.id}>
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-sm">{PRIORITY_MAP[r.priority]} {r.title}</Text>
                  <Badge label={s.label} variant={s.variant} />
                </View>
                <Text className="text-xs text-grey-text">{r.description}</Text>
                <Text className="text-xs text-grey-text mt-1">{formatRelativeTime(r.created_at)}</Text>
                {r.status === "pending" && (
                  <View className="flex-row mt-2">
                    <TouchableOpacity onPress={() => handleUpdateStatus(r.id, "in_progress")} className="bg-sewa/10 rounded-lg px-3 py-1.5 mr-2">
                      <Text className="text-xs font-bold text-sewa">Kerjakan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleUpdateStatus(r.id, "rejected")} className="bg-red-50 rounded-lg px-3 py-1.5">
                      <Text className="text-xs font-bold text-red-500">Tolak</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {r.status === "in_progress" && (
                  <TouchableOpacity onPress={() => handleUpdateStatus(r.id, "completed")} className="bg-green-50 rounded-lg px-3 py-1.5 mt-2 self-start">
                    <Text className="text-xs font-bold text-green-600">Tandai Selesai</Text>
                  </TouchableOpacity>
                )}
              </Card>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
