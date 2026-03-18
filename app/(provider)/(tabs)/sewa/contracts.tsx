import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Modal } from "@components/ui/Modal";
import { EmptyState } from "@components/shared/EmptyState";
import { getContracts, createContract, updateContractStatus } from "@services/sewa.service";
import { useAuthStore } from "@stores/auth.store";
import { useUIStore } from "@stores/ui.store";
import { formatDate } from "@utils/format";
import type { Contract, ContractStatus } from "@app-types/sewa.types";

const STATUS_MAP: Record<ContractStatus, { label: string; variant: "info" | "success" | "warning" | "error" }> = {
  draft: { label: "Draft", variant: "warning" }, active: { label: "Aktif", variant: "success" },
  expired: { label: "Berakhir", variant: "error" }, terminated: { label: "Dibatalkan", variant: "error" },
};

export default function ContractsScreen() {
  const profile = useAuthStore((s) => s.profile);
  const showToast = useUIStore((s) => s.showToast);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => { if (profile?.id) loadData(); }, [profile?.id]);

  async function loadData() {
    try { setContracts(await getContracts(profile!.id)); } catch { /* silent */ } finally { setLoading(false); }
  }

  async function handleCreate() {
    if (!title.trim() || !profile?.id) return;
    setCreateLoading(true);
    try {
      await createContract(profile.id, { unit_id: null, contact_id: null, consumer_id: null, type: "sewa", title: title.trim(), content_json: null, start_date: new Date().toISOString(), end_date: null });
      showToast("Kontrak dibuat!", "success"); setTitle(""); setShowCreate(false); loadData();
    } catch { showToast("Gagal membuat kontrak", "error"); } finally { setCreateLoading(false); }
  }

  async function handleActivate(id: string) {
    try { await updateContractStatus(id, "active"); showToast("Kontrak diaktifkan", "success"); loadData(); }
    catch { showToast("Gagal", "error"); }
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border-color bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}><Text className="text-lg text-navy">←</Text></TouchableOpacity>
          <Text className="text-lg font-bold text-dark-text ml-3">Kontrak</Text>
        </View>
        <TouchableOpacity onPress={() => setShowCreate(true)} className="bg-sewa rounded-lg px-3 py-2">
          <Text className="text-white text-xs font-bold">+ Buat</Text>
        </TouchableOpacity>
      </View>
      <ScrollView className="flex-1 px-4 pt-3">
        {!loading && contracts.length === 0 ? (
          <EmptyState illustration="📄" title="Belum ada kontrak" actionLabel="+ Buat Kontrak" onAction={() => setShowCreate(true)} />
        ) : (
          contracts.map((c) => {
            const s = STATUS_MAP[c.status];
            return (
              <Card key={c.id}>
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-base font-bold text-dark-text flex-1" numberOfLines={1}>{c.title}</Text>
                  <Badge label={s.label} variant={s.variant} />
                </View>
                {c.start_date && <Text className="text-xs text-grey-text">Mulai: {formatDate(c.start_date)}</Text>}
                {c.status === "draft" && (
                  <TouchableOpacity onPress={() => handleActivate(c.id)} className="bg-sewa/10 rounded-lg px-3 py-1.5 mt-2 self-start">
                    <Text className="text-xs font-bold text-sewa">Aktifkan</Text>
                  </TouchableOpacity>
                )}
              </Card>
            );
          })
        )}
      </ScrollView>
      <Modal visible={showCreate} onClose={() => setShowCreate(false)} title="Buat Kontrak">
        <Input label="Judul Kontrak" placeholder="contoh: Kontrak Sewa Kamar 1A" value={title} onChangeText={setTitle} />
        <View className="mt-4"><Button title="Buat" onPress={handleCreate} loading={createLoading} /></View>
      </Modal>
    </SafeAreaView>
  );
}
