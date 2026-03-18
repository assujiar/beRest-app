import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Modal } from "@components/ui/Modal";
import { CurrencyInput } from "@components/shared/CurrencyInput";
import { PhotoPicker } from "@components/shared/PhotoPicker";
import { EmptyState } from "@components/shared/EmptyState";
import { getExpensesToday, addExpense } from "@services/lapak.service";
import { useUIStore } from "@stores/ui.store";
import { formatRupiah } from "@utils/format";
import type { LapakExpense } from "@app-types/lapak.types";

export default function ExpensesScreen() {
  const { bizId } = useLocalSearchParams<{ bizId: string }>();
  const showToast = useUIStore((s) => s.showToast);
  const [expenses, setExpenses] = useState<LapakExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState(0);
  const [photo, setPhoto] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    if (bizId) loadData();
  }, [bizId]);

  async function loadData() {
    try {
      const data = await getExpensesToday(bizId!);
      setExpenses(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!desc.trim() || amount <= 0) return;
    setAddLoading(true);
    try {
      await addExpense(bizId!, {
        description: desc.trim(),
        amount,
        category: null,
        proof_photo: photo,
      });
      showToast("Pengeluaran dicatat!", "success");
      setDesc(""); setAmount(0); setPhoto(null);
      setShowAdd(false);
      loadData();
    } catch {
      showToast("Gagal mencatat", "error");
    } finally {
      setAddLoading(false);
    }
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border-color bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Text className="text-lg text-navy">←</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-dark-text ml-3">Pengeluaran</Text>
        </View>
        <TouchableOpacity onPress={() => setShowAdd(true)} className="bg-lapak rounded-lg px-3 py-2">
          <Text className="text-white text-xs font-bold">+ Catat</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-3">
        <Card>
          <Text className="text-xs text-grey-text">Total hari ini</Text>
          <Text className="text-xl font-bold text-red-500">{formatRupiah(total)}</Text>
        </Card>

        {!loading && expenses.length === 0 ? (
          <EmptyState illustration="💸" title="Belum ada pengeluaran hari ini" actionLabel="+ Catat Pengeluaran" onAction={() => setShowAdd(true)} />
        ) : (
          expenses.map((e) => (
            <Card key={e.id}>
              <View className="flex-row items-center">
                <View className="flex-1">
                  <Text className="text-sm font-bold text-dark-text">{e.description}</Text>
                </View>
                <Text className="text-base font-bold text-red-500">-{formatRupiah(e.amount)}</Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <Modal visible={showAdd} onClose={() => setShowAdd(false)} title="Catat Pengeluaran">
        <Input label="Keterangan" placeholder="contoh: Beli minyak goreng" value={desc} onChangeText={setDesc} />
        <View className="mt-3">
          <CurrencyInput label="Jumlah" value={amount} onChangeValue={setAmount} />
        </View>
        <View className="mt-3">
          <PhotoPicker label="Bukti (opsional)" value={photo} onChange={setPhoto} />
        </View>
        <View className="mt-4">
          <Button title="Simpan" onPress={handleAdd} loading={addLoading} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}
