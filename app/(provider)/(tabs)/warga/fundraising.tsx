import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Modal } from "@components/ui/Modal";
import { CurrencyInput } from "@components/shared/CurrencyInput";
import { EmptyState } from "@components/shared/EmptyState";
import {
  getFundraisings,
  createFundraising,
  addDonation,
} from "@services/warga.service";
import { useUIStore } from "@stores/ui.store";
import { formatRupiah } from "@utils/format";
import type { Fundraising, FundraisingStatus } from "@app-types/warga.types";

const STATUS_MAP: Record<FundraisingStatus, { label: string; variant: "success" | "info" | "neutral" }> = {
  active: { label: "Berjalan", variant: "info" },
  completed: { label: "Tercapai", variant: "success" },
  cancelled: { label: "Dibatalkan", variant: "neutral" },
};

export default function FundraisingScreen() {
  const { orgId } = useLocalSearchParams<{ orgId: string }>();
  const showToast = useUIStore((s) => s.showToast);
  const [items, setItems] = useState<Fundraising[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showDonate, setShowDonate] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newTarget, setNewTarget] = useState(0);
  const [donorName, setDonorName] = useState("");
  const [donateAmount, setDonateAmount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (orgId) loadData();
  }, [orgId]);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getFundraisings(orgId!);
      setItems(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newTitle.trim() || newTarget <= 0) return;
    setActionLoading(true);
    try {
      await createFundraising(orgId!, {
        title: newTitle.trim(),
        description: null,
        target_amount: newTarget,
        deadline: null,
      });
      showToast("Penggalangan dana dibuat!", "success");
      setNewTitle("");
      setNewTarget(0);
      setShowCreate(false);
      loadData();
    } catch {
      showToast("Gagal membuat penggalangan", "error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDonate() {
    if (donateAmount <= 0 || !showDonate) return;
    setActionLoading(true);
    try {
      await addDonation(
        showDonate,
        donateAmount,
        donorName.trim() || "Hamba Allah",
        orgId!
      );
      showToast("Donasi dicatat!", "success");
      setDonorName("");
      setDonateAmount(0);
      setShowDonate(null);
      loadData();
    } catch {
      showToast("Gagal mencatat donasi", "error");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border-color bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Text className="text-lg text-navy">←</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-dark-text ml-3">
            Penggalangan Dana
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowCreate(true)}
          className="bg-warga rounded-lg px-3 py-2"
        >
          <Text className="text-white text-xs font-bold">+ Buat</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-3">
        {!loading && items.length === 0 ? (
          <EmptyState
            illustration="🎯"
            title="Belum ada penggalangan"
            description="Buat target pengumpulan dana"
            actionLabel="+ Buat Penggalangan"
            onAction={() => setShowCreate(true)}
          />
        ) : (
          items.map((fund) => {
            const progress =
              fund.target_amount > 0
                ? Math.min(100, (fund.collected_amount / fund.target_amount) * 100)
                : 0;
            const s = STATUS_MAP[fund.status];

            return (
              <Card key={fund.id}>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-base font-bold text-dark-text flex-1">
                    {fund.title}
                  </Text>
                  <Badge label={s.label} variant={s.variant} />
                </View>

                {/* Progress bar */}
                <View className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <View
                    className="h-full bg-warga rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </View>

                <View className="flex-row justify-between mb-3">
                  <Text className="text-sm font-bold text-warga">
                    {formatRupiah(fund.collected_amount)}
                  </Text>
                  <Text className="text-sm text-grey-text">
                    dari {formatRupiah(fund.target_amount)}
                  </Text>
                </View>

                {fund.status === "active" && (
                  <Button
                    title="+ Catat Donasi"
                    variant="secondary"
                    onPress={() => setShowDonate(fund.id)}
                  />
                )}
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Create modal */}
      <Modal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        title="Buat Penggalangan Dana"
      >
        <Input
          label="Judul"
          placeholder="contoh: Renovasi Mesjid"
          value={newTitle}
          onChangeText={setNewTitle}
        />
        <View className="mt-3">
          <CurrencyInput
            label="Target Dana"
            value={newTarget}
            onChangeValue={setNewTarget}
          />
        </View>
        <View className="mt-4">
          <Button title="Buat" onPress={handleCreate} loading={actionLoading} />
        </View>
      </Modal>

      {/* Donate modal */}
      <Modal
        visible={!!showDonate}
        onClose={() => setShowDonate(null)}
        title="Catat Donasi"
      >
        <Input
          label="Nama Donatur"
          placeholder="kosongkan untuk 'Hamba Allah'"
          value={donorName}
          onChangeText={setDonorName}
        />
        <View className="mt-3">
          <CurrencyInput
            label="Jumlah"
            value={donateAmount}
            onChangeValue={setDonateAmount}
          />
        </View>
        <View className="mt-4">
          <Button title="Simpan" onPress={handleDonate} loading={actionLoading} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}
