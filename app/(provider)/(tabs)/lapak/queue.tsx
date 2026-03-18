import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Modal } from "@components/ui/Modal";
import { EmptyState } from "@components/shared/EmptyState";
import { createQueueEntry, getQueueToday, updateQueueStatus, getCurrentServing } from "@services/lapak-advanced.service";
import { useUIStore } from "@stores/ui.store";
import { formatRelativeTime } from "@utils/format";
import type { QueueEntry, QueueStatus } from "@app-types/lapak.types";

const STATUS_MAP: Record<QueueStatus, { label: string; variant: "info" | "warning" | "success" | "neutral" }> = {
  waiting: { label: "Menunggu", variant: "info" }, serving: { label: "Dilayani", variant: "warning" },
  completed: { label: "Selesai", variant: "success" }, cancelled: { label: "Batal", variant: "neutral" },
};

export default function QueueScreen() {
  const { bizId } = useLocalSearchParams<{ bizId: string; bizName: string }>();
  const showToast = useUIStore((s) => s.showToast);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [serving, setServing] = useState<QueueEntry | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [custName, setCustName] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { if (bizId) loadData(); }, [bizId]);

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
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border-color bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}><Text className="text-lg text-navy">←</Text></TouchableOpacity>
          <Text className="text-lg font-bold text-dark-text ml-3">Antrian</Text>
        </View>
        <TouchableOpacity onPress={() => setShowAdd(true)} className="bg-lapak rounded-lg px-3 py-2">
          <Text className="text-white text-xs font-bold">+ Antrian</Text>
        </TouchableOpacity>
      </View>
      <ScrollView className="flex-1 px-4 pt-3">
        {/* Now serving */}
        {serving && (
          <Card>
            <Text className="text-xs text-grey-text">Sedang Dilayani</Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-3xl font-bold text-lapak mr-3">#{serving.queue_number}</Text>
              <Text className="text-base font-bold text-dark-text flex-1">{serving.customer_name}</Text>
              <TouchableOpacity onPress={() => handleComplete(serving.id)} className="bg-green-500 rounded-lg px-3 py-2">
                <Text className="text-white text-xs font-bold">Selesai</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Call next */}
        {waitingCount > 0 && !serving && (
          <Button title={`Panggil Berikutnya (${waitingCount} menunggu)`} onPress={handleCallNext} />
        )}

        {/* Queue list */}
        <Text className="text-sm font-bold text-grey-text mt-4 mb-2">ANTRIAN HARI INI</Text>
        {!loading && queue.length === 0 ? (
          <EmptyState illustration="📋" title="Belum ada antrian" actionLabel="+ Tambah Antrian" onAction={() => setShowAdd(true)} />
        ) : (
          queue.map((q) => {
            const s = STATUS_MAP[q.status];
            return (
              <Card key={q.id}>
                <View className="flex-row items-center">
                  <Text className="text-2xl font-bold text-dark-text mr-3 w-10">#{q.queue_number}</Text>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-dark-text">{q.customer_name}</Text>
                    <Text className="text-xs text-grey-text">{formatRelativeTime(q.created_at)}</Text>
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
        <View className="mt-4"><Button title="Tambah" onPress={handleAdd} loading={actionLoading} /></View>
      </Modal>
    </SafeAreaView>
  );
}
