import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Modal } from "@components/ui/Modal";
import { CurrencyInput } from "@components/shared/CurrencyInput";
import { EmptyState } from "@components/shared/EmptyState";
import { getTransactions, addTransaction } from "@services/warga.service";
import { useUIStore } from "@stores/ui.store";
import { formatRupiah, formatDate } from "@utils/format";
import type { OrgTransaction } from "@app-types/warga.types";

export default function InfaqScreen() {
  const { orgId } = useLocalSearchParams<{ orgId: string }>();
  const showToast = useUIStore((s) => s.showToast);
  const [donations, setDonations] = useState<OrgTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [amount, setAmount] = useState(0);
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    if (orgId) loadData();
  }, [orgId]);

  async function loadData() {
    setLoading(true);
    try {
      const all = await getTransactions(orgId!);
      setDonations(all.filter((t) => t.category === "infaq"));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (amount <= 0) return;
    setAddLoading(true);
    try {
      await addTransaction(orgId!, {
        type: "income",
        category: "infaq",
        description: `Infaq: ${donorName.trim() || "Hamba Allah"}`,
        amount,
        transaction_date: new Date().toISOString(),
        proof_photo: null,
        donor_name: donorName.trim() || "Hamba Allah",
      });
      showToast("Infaq dicatat!", "success");
      setDonorName("");
      setAmount(0);
      setShowAdd(false);
      loadData();
    } catch {
      showToast("Gagal mencatat infaq", "error");
    } finally {
      setAddLoading(false);
    }
  }

  const total = donations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border-color bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Text className="text-lg text-navy">←</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-dark-text ml-3">
            Infaq / Donasi
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowAdd(true)}
          className="bg-warga rounded-lg px-3 py-2"
        >
          <Text className="text-white text-xs font-bold">+ Catat</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-3">
        <Card>
          <Text className="text-xs text-grey-text">Total Infaq</Text>
          <Text className="text-2xl font-bold text-warga">
            {formatRupiah(total)}
          </Text>
          <Text className="text-xs text-grey-text mt-1">
            {donations.length} donatur
          </Text>
        </Card>

        {!loading && donations.length === 0 ? (
          <EmptyState
            illustration="🤲"
            title="Belum ada infaq"
            description="Catat infaq dan donasi yang masuk"
            actionLabel="+ Catat Infaq"
            onAction={() => setShowAdd(true)}
          />
        ) : (
          donations.map((d) => (
            <Card key={d.id}>
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-warga/10 items-center justify-center mr-3">
                  <Text className="text-sm">🤲</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-dark-text">
                    {d.donor_name ?? "Hamba Allah"}
                  </Text>
                  <Text className="text-xs text-grey-text">
                    {formatDate(d.transaction_date)}
                  </Text>
                </View>
                <Text className="text-base font-bold text-warga">
                  +{formatRupiah(d.amount)}
                </Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        title="Catat Infaq"
      >
        <Input
          label="Nama Donatur"
          placeholder="kosongkan untuk 'Hamba Allah'"
          value={donorName}
          onChangeText={setDonorName}
        />
        <View className="mt-3">
          <CurrencyInput label="Jumlah" value={amount} onChangeValue={setAmount} />
        </View>
        <View className="mt-4">
          <Button title="Simpan" onPress={handleAdd} loading={addLoading} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}
