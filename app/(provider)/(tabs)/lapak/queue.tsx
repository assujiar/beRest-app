import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Modal } from "@components/ui/Modal";
import { EmptyState } from "@components/shared/EmptyState";
import { createQueueEntry, getQueueToday, updateQueueStatus, getCurrentServing } from "@services/lapak-advanced.service";
import { useUIStore } from "@stores/ui.store";
import { formatRelativeTime } from "@utils/format";
import { GRADIENTS, RADIUS, TYPO, SPACING } from "@utils/theme";
import Svg, { Path } from "react-native-svg";
import type { QueueEntry, QueueStatus } from "@app-types/lapak.types";

function ArrowLeftIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CheckIcon({ size = 14, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const STATUS_MAP: Record<QueueStatus, { label: string; variant: "info" | "warning" | "success" | "neutral" }> = {
  waiting: { label: "Menunggu", variant: "info" }, serving: { label: "Dilayani", variant: "warning" },
  completed: { label: "Selesai", variant: "success" }, cancelled: { label: "Batal", variant: "neutral" },
};

export default function QueueScreen() {
  const insets = useSafeAreaInsets();
  const { bizId } = useLocalSearchParams<{ bizId: string; bizName: string }>();
  const showToast = useUIStore((s) => s.showToast);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [serving, setServing] = useState<QueueEntry | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [custName, setCustName] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useFocusEffect(useCallback(() => { if (bizId) loadData(); }, [bizId]));

  async function loadData() {
    try {
      const [q, s] = await Promise.all([getQueueToday(bizId!), getCurrentServing(bizId!)]);
      setQueue(q); setServing(s);
    } catch {} finally { setLoading(false); }
  }

  async function handleAdd() {
    if (!custName.trim()) return;
    setActionLoading(true);
    try {
      await createQueueEntry(bizId!, { customer_name: custName.trim(), customer_phone: null, consumer_id: null, service_name: null, notes: null, estimated_time: null });
      showToast("Antrian ditambahkan!", "success"); setCustName(""); setShowAdd(false); loadData();
    } catch { showToast("Gagal", "error"); } finally { setActionLoading(false); }
  }

  async function handleCallNext() {
    const next = queue.find((q) => q.status === "waiting");
    if (!next) return;
    try { await updateQueueStatus(next.id, "serving"); showToast(`Memanggil: ${next.customer_name}`, "success"); loadData(); }
    catch { showToast("Gagal", "error"); }
  }

  async function handleComplete(id: string) {
    try { await updateQueueStatus(id, "completed"); showToast("Selesai!", "success"); loadData(); }
    catch { showToast("Gagal", "error"); }
  }

  const waitingCount = queue.filter((q) => q.status === "waiting").length;

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Gradient Header */}
      <LinearGradient
        colors={[...GRADIENTS.lapak]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + SPACING.sm,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.md,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
              <ArrowLeftIcon size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={{ ...TYPO.h3, color: "#FFFFFF", marginLeft: SPACING.md }}>Antrian</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowAdd(true)}
            style={{
              backgroundColor: "rgba(255,255,255,0.25)",
              borderRadius: RADIUS.md,
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.35)",
            }}
          >
            <Text style={{ ...TYPO.captionBold, color: "#FFFFFF" }}>+ Antrian</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.md, paddingTop: SPACING.md }}
      >
        {/* Now serving */}
        {serving && (
          <Card variant="glass">
            <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8 }}>
              Sedang Dilayani
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: SPACING.xs }}>
              <Text style={{ ...TYPO.h1, color: "#50BFC3", marginRight: SPACING.md }}>
                #{serving.queue_number}
              </Text>
              <Text style={{ ...TYPO.bodyBold, color: "#1E293B", flex: 1 }}>
                {serving.customer_name}
              </Text>
              <TouchableOpacity
                onPress={() => handleComplete(serving.id)}
                style={{
                  backgroundColor: "#22C55E",
                  borderRadius: RADIUS.md,
                  paddingHorizontal: SPACING.md,
                  paddingVertical: SPACING.sm,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: SPACING.xs,
                }}
              >
                <CheckIcon size={14} color="#FFFFFF" />
                <Text style={{ ...TYPO.captionBold, color: "#FFFFFF" }}>Selesai</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Call next */}
        {waitingCount > 0 && !serving && (
          <View style={{ marginBottom: SPACING.md }}>
            <Button title={`Panggil Berikutnya (${waitingCount} menunggu)`} onPress={handleCallNext} />
          </View>
        )}

        {/* Queue list */}
        <Text
          style={{
            ...TYPO.small,
            color: "#94A3B8",
            textTransform: "uppercase",
            letterSpacing: 0.8,
            marginTop: SPACING.lg,
            marginBottom: SPACING.sm,
          }}
        >
          ANTRIAN HARI INI
        </Text>
        {!loading && queue.length === 0 ? (
          <EmptyState
            illustration="📋"
            title="Belum ada antrian"
            actionLabel="+ Tambah Antrian"
            onAction={() => setShowAdd(true)}
          />
        ) : (
          queue.map((q) => {
            const s = STATUS_MAP[q.status];
            return (
              <Card key={q.id} variant="glass">
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={{
                      ...TYPO.h2,
                      color: "#1E293B",
                      marginRight: SPACING.md,
                      width: 40,
                    }}
                  >
                    #{q.queue_number}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>{q.customer_name}</Text>
                    <Text style={{ ...TYPO.caption, color: "#64748B" }}>
                      {formatRelativeTime(q.created_at)}
                    </Text>
                  </View>
                  <Badge label={s.label} variant={s.variant} />
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>

      <Modal visible={showAdd} onClose={() => setShowAdd(false)} title="Tambah Antrian">
        <Input label="Nama Pelanggan" placeholder="contoh: Pak Andi" value={custName} onChangeText={setCustName} />
        <View style={{ marginTop: SPACING.lg }}>
          <Button title="Tambah" onPress={handleAdd} loading={actionLoading} />
        </View>
      </Modal>
    </View>
  );
}
