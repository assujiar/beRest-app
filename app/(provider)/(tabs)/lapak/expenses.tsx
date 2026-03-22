import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Modal } from "@components/ui/Modal";
import { CurrencyInput } from "@components/shared/CurrencyInput";
import { PhotoPicker } from "@components/shared/PhotoPicker";
import { EmptyState } from "@components/shared/EmptyState";
import { UpgradeModal } from "@components/shared/UpgradeModal";
import { getExpensesToday, addExpense } from "@services/lapak.service";
import { scanNota } from "@services/gemini.service";
import { useSubscription } from "@hooks/shared/useSubscription";
import { useUIStore } from "@stores/ui.store";
import { formatRupiah } from "@utils/format";
import type { LapakExpense } from "@app-types/lapak.types";

export default function ExpensesScreen() {
  const { bizId } = useLocalSearchParams<{ bizId: string }>();
  const showToast = useUIStore((s) => s.showToast);
  const { tier, requireUpgrade, showUpgrade, setShowUpgrade, upgradeFeature } = useSubscription();
  const [expenses, setExpenses] = useState<LapakExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState(0);
  const [photo, setPhoto] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [showScanPicker, setShowScanPicker] = useState(false);
  const [scanPhoto, setScanPhoto] = useState<string | null>(null);
  const [showScanResult, setShowScanResult] = useState(false);
  const [scanItems, setScanItems] = useState<{ name: string; quantity: number; price: number; total: number }[]>([]);
  const [scanTotal, setScanTotal] = useState(0);

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

  async function handleScanNota(uri: string) {
    if (requireUpgrade("canUseAI", "AI Scan Nota")) return;
    setScanPhoto(uri);
    setScanLoading(true);
    try {
      const result = await scanNota(uri);
      if (result.items.length === 0) {
        showToast("Nota tidak terbaca, coba foto ulang", "error");
        setScanLoading(false);
        return;
      }
      setScanItems(result.items);
      setScanTotal(result.grandTotal);
      setShowScanResult(true);
    } catch {
      showToast("Gagal scan nota", "error");
    } finally {
      setScanLoading(false);
    }
  }

  async function handleSaveFromScan() {
    setAddLoading(true);
    try {
      for (const item of scanItems) {
        await addExpense(bizId!, {
          description: `${item.name} ×${item.quantity}`,
          amount: item.total,
          category: null,
          proof_photo: scanPhoto,
        });
      }
      showToast(`${scanItems.length} item dicatat dari nota!`, "success");
      setScanItems([]);
      setScanTotal(0);
      setScanPhoto(null);
      setShowScanResult(false);
      loadData();
    } catch {
      showToast("Gagal menyimpan", "error");
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
        <View className="flex-row items-center gap-2">
          <TouchableOpacity onPress={() => {
            if (requireUpgrade("canUseAI", "AI Scan Nota")) return;
            setShowScanPicker(true);
          }} className="bg-navy rounded-lg px-3 py-2 flex-row items-center">
            <Text className="text-white text-xs font-bold">📸 Scan Nota</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowAdd(true)} className="bg-lapak rounded-lg px-3 py-2">
            <Text className="text-white text-xs font-bold">+ Catat</Text>
          </TouchableOpacity>
        </View>
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

      {/* Scan Nota: photo picker modal */}
      <Modal visible={showScanPicker} onClose={() => setShowScanPicker(false)} title="Scan Nota / Struk">
        <Text className="text-sm text-grey-text mb-3">
          Foto nota belanja, AI akan baca dan catat otomatis.
        </Text>
        {scanLoading ? (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color="#10B981" />
            <Text className="text-sm font-bold text-dark-text mt-3">AI sedang membaca nota...</Text>
            <Text className="text-xs text-grey-text mt-1">Tunggu sebentar</Text>
          </View>
        ) : (
          <PhotoPicker label="Foto Nota" value={scanPhoto} onChange={(uri) => { if (uri) handleScanNota(uri); }} />
        )}
      </Modal>

      {/* Scan result */}
      <Modal visible={showScanResult} onClose={() => setShowScanResult(false)} title="Hasil Scan Nota">
        <Text className="text-xs text-grey-text mb-3">
          AI menemukan {scanItems.length} item dari nota:
        </Text>
        {scanItems.map((item, i) => (
          <View key={i} className="flex-row items-center justify-between py-2 border-b border-border-color">
            <View className="flex-1">
              <Text className="text-sm text-dark-text">{item.name}</Text>
              <Text className="text-xs text-grey-text">×{item.quantity}</Text>
            </View>
            <Text className="text-sm font-bold text-red-500">{formatRupiah(item.total)}</Text>
          </View>
        ))}
        <View className="flex-row items-center justify-between py-3 mt-1">
          <Text className="text-sm font-bold text-dark-text">Total</Text>
          <Text className="text-lg font-bold text-red-500">{formatRupiah(scanTotal)}</Text>
        </View>
        <View className="mt-3">
          <Button title={`Simpan ${scanItems.length} Item`} onPress={handleSaveFromScan} loading={addLoading} />
        </View>
      </Modal>

      <UpgradeModal visible={showUpgrade} onClose={() => setShowUpgrade(false)} currentTier={tier} featureName={upgradeFeature} />
    </SafeAreaView>
  );
}
