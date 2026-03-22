import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Circle } from "react-native-svg";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { EmptyState } from "@components/shared/EmptyState";
import { getMaintenanceRequests, updateMaintenanceStatus } from "@services/sewa.service";
import { useUIStore } from "@stores/ui.store";
import { formatRelativeTime } from "@utils/format";
import { GRADIENTS, RADIUS, TYPO, SPACING } from "@utils/theme";
import type { MaintenanceRequest, MaintenanceStatus, MaintenancePriority } from "@app-types/sewa.types";

const STATUS_MAP: Record<MaintenanceStatus, { label: string; variant: "info" | "warning" | "success" | "error" }> = {
  pending: { label: "Menunggu", variant: "warning" }, in_progress: { label: "Dikerjakan", variant: "info" },
  completed: { label: "Selesai", variant: "success" }, rejected: { label: "Ditolak", variant: "error" },
};

const PRIORITY_COLORS: Record<MaintenancePriority, string> = { low: "#22C55E", medium: "#EAB308", high: "#EF4444" };

function BackIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PriorityDot({ priority }: { priority: MaintenancePriority }) {
  const color = PRIORITY_COLORS[priority];
  return (
    <Svg width={10} height={10} viewBox="0 0 10 10">
      <Circle cx={5} cy={5} r={5} fill={color} />
    </Svg>
  );
}

export default function MaintenanceScreen() {
  const insets = useSafeAreaInsets();
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
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Gradient Header */}
      <LinearGradient
        colors={GRADIENTS.sewa}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + SPACING.sm,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.lg,
          borderBottomLeftRadius: RADIUS.xxl,
          borderBottomRightRadius: RADIUS.xxl,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={{ ...TYPO.h3, color: "#FFFFFF", marginLeft: SPACING.md }}>Maintenance</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.lg, paddingTop: SPACING.md }}
      >
        {!loading && requests.length === 0 ? (
          <EmptyState illustration="🔧" title="Tidak ada permintaan" description="Permintaan perbaikan dari penghuni akan muncul di sini" />
        ) : (
          requests.map((r) => {
            const s = STATUS_MAP[r.status];
            return (
              <Card key={r.id} variant="glass">
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACING.xs }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm, flex: 1 }}>
                    <PriorityDot priority={r.priority} />
                    <Text style={{ ...TYPO.bodyBold, color: "#1E293B", flex: 1 }} numberOfLines={1}>{r.title}</Text>
                  </View>
                  <Badge label={s.label} variant={s.variant} />
                </View>
                <Text style={{ ...TYPO.caption, color: "#64748B" }}>{r.description}</Text>
                <Text style={{ ...TYPO.caption, color: "#94A3B8", marginTop: SPACING.xs }}>{formatRelativeTime(r.created_at)}</Text>
                {r.status === "pending" && (
                  <View style={{ flexDirection: "row", marginTop: SPACING.sm, gap: SPACING.sm }}>
                    <TouchableOpacity
                      onPress={() => handleUpdateStatus(r.id, "in_progress")}
                      style={{
                        backgroundColor: "rgba(0,196,154,0.1)",
                        borderRadius: RADIUS.md,
                        paddingHorizontal: SPACING.md,
                        paddingVertical: SPACING.sm,
                      }}
                    >
                      <Text style={{ ...TYPO.captionBold, color: "#00C49A" }}>Kerjakan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleUpdateStatus(r.id, "rejected")}
                      style={{
                        backgroundColor: "rgba(239,68,68,0.08)",
                        borderRadius: RADIUS.md,
                        paddingHorizontal: SPACING.md,
                        paddingVertical: SPACING.sm,
                      }}
                    >
                      <Text style={{ ...TYPO.captionBold, color: "#EF4444" }}>Tolak</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {r.status === "in_progress" && (
                  <TouchableOpacity
                    onPress={() => handleUpdateStatus(r.id, "completed")}
                    style={{
                      backgroundColor: "rgba(34,197,94,0.08)",
                      borderRadius: RADIUS.md,
                      paddingHorizontal: SPACING.md,
                      paddingVertical: SPACING.sm,
                      marginTop: SPACING.sm,
                      alignSelf: "flex-start",
                    }}
                  >
                    <Text style={{ ...TYPO.captionBold, color: "#16A34A" }}>Tandai Selesai</Text>
                  </TouchableOpacity>
                )}
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
