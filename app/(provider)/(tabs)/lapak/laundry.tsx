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
import { createLaundryOrder, getLaundryOrders, updateLaundryStatus, getLaundryPricing, upsertLaundryPricing } from "@services/lapak-advanced.service";
import { useUIStore } from "@stores/ui.store";
import { formatRupiah, formatRelativeTime } from "@utils/format";
import type { LaundryOrder, LaundryStatus, LaundryPricing } from "@app-types/lapak.types";

const STATUS_FLOW: LaundryStatus[] = ["received", "washing", "drying", "ironing", "ready", "picked_up"];
const STATUS_LABELS: Record<LaundryStatus, string> = {
  received: "Diterima", washing: "Dicuci", drying: "Dikeringkan",
  ironing: "Disetrika", ready: "Siap Ambil", picked_up: "Diambil", cancelled: "Dibatalkan",
};
const STATUS_VARIANTS: Record<LaundryStatus, "info" | "warning" | "success" | "neutral" | "error"> = {
  received: "info", washing: "warning", drying: "warning",
  ironing: "warning", ready: "success", picked_up: "neutral", cancelled: "error",
};

export default function LaundryScreen() {
  const { bizId } = useLocalSearchParams<{ bizId: string; bizName: string }>();
  const showToast = useUIStore((s) => s.showToast);
  const [orders, setOrders] = useState<LaundryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [total, setTotal] = useState(0);
  const [createLoading, setCreateLoading] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [pricing, setPricing] = useState<LaundryPricing[]>([]);
  const [pName, setPName] = useState("");
  const [pKg, setPKg] = useState(0);
  const [pPiece, setPPiece] = useState(0);
  const [pricingLoading, setPricingLoading] = useState(false);

  useEffect(() => { if (bizId) loadData(); }, [bizId]);

  async function loadData() {
    try {
      const [o, p] = await Promise.all([getLaundryOrders(bizId!), getLaundryPricing(bizId!)]);
      setOrders(o);
      setPricing(p);
    } catch {} finally { setLoading(false); }
  }

  async function handleSavePricing() {
    if (!pName.trim() || (pKg <= 0 && pPiece <= 0)) return;
    setPricingLoading(true);
    try {
      await upsertLaundryPricing(bizId!, { name: pName.trim(), price_per_kg: pKg > 0 ? pKg : null, price_per_piece: pPiece > 0 ? pPiece : null });
      showToast("Harga disimpan!", "success");
      setPName(""); setPKg(0); setPPiece(0);
      loadData();
    } catch { showToast("Gagal menyimpan", "error"); } finally { setPricingLoading(false); }
  }

  async function handleCreate() {
    if (!custName.trim() || total <= 0) return;
    setCreateLoading(true);
    try {
      await createLaundryOrder(bizId!, { customer_name: custName.trim(), customer_phone: custPhone.trim() || null, consumer_id: null, items: [], total_weight: null, total, notes: null, estimated_done: null });
      showToast("Order laundry dibuat!", "success");
      setCustName(""); setCustPhone(""); setTotal(0); setShowCreate(false); loadData();
    } catch { showToast("Gagal membuat order", "error"); } finally { setCreateLoading(false); }
  }

  async function handleNextStatus(order: LaundryOrder) {
    const idx = STATUS_FLOW.indexOf(order.status);
    if (idx < 0 || idx >= STATUS_FLOW.length - 1) return;
    const next = STATUS_FLOW[idx + 1];
    try { await updateLaundryStatus(order.id, next); showToast(`Status: ${STATUS_LABELS[next]}`, "success"); loadData(); }
    catch { showToast("Gagal update status", "error"); }
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border-color bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}><Text className="text-lg text-navy">←</Text></TouchableOpacity>
          <Text className="text-lg font-bold text-dark-text ml-3">Laundry</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity onPress={() => setShowPricing(true)} className="bg-navy rounded-lg px-3 py-2">
            <Text className="text-white text-xs font-bold">💰 Harga</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowCreate(true)} className="bg-lapak rounded-lg px-3 py-2">
            <Text className="text-white text-xs font-bold">+ Order</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView className="flex-1 px-4 pt-3">
        {!loading && orders.length === 0 ? (
          <EmptyState illustration="👕" title="Belum ada order laundry" actionLabel="+ Order Baru" onAction={() => setShowCreate(true)} />
        ) : (
          orders.map((o) => (
            <Card key={o.id}>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs text-grey-text font-mono">{o.order_code}</Text>
                <Badge label={STATUS_LABELS[o.status]} variant={STATUS_VARIANTS[o.status]} />
              </View>
              <Text className="text-base font-bold text-dark-text">{o.customer_name}</Text>
              <View className="flex-row items-center justify-between mt-1">
                <Text className="text-sm font-bold text-lapak">{formatRupiah(o.total)}</Text>
                <Text className="text-xs text-grey-text">{formatRelativeTime(o.created_at)}</Text>
              </View>
              {o.status !== "picked_up" && o.status !== "cancelled" && (
                <TouchableOpacity onPress={() => handleNextStatus(o)} className="bg-lapak/10 rounded-lg px-3 py-2 mt-2 self-start">
                  <Text className="text-xs font-bold text-lapak">
                    → {STATUS_LABELS[STATUS_FLOW[STATUS_FLOW.indexOf(o.status) + 1] ?? "picked_up"]}
                  </Text>
                </TouchableOpacity>
              )}
            </Card>
          ))
        )}
      </ScrollView>
      <Modal visible={showCreate} onClose={() => setShowCreate(false)} title="Order Laundry Baru">
        <Input label="Nama Pelanggan" placeholder="contoh: Ibu Sari" value={custName} onChangeText={setCustName} />
        <View className="mt-3"><Input label="No HP (opsional)" placeholder="08123456789" value={custPhone} onChangeText={setCustPhone} keyboardType="phone-pad" /></View>
        <View className="mt-3"><CurrencyInput label="Total" value={total} onChangeValue={setTotal} /></View>
        <View className="mt-4"><Button title="Buat Order" onPress={handleCreate} loading={createLoading} /></View>
      </Modal>

      {/* Pricing Modal */}
      <Modal visible={showPricing} onClose={() => setShowPricing(false)} title="Daftar Harga Laundry">
        {pricing.length > 0 && (
          <View className="mb-4">
            {pricing.map((p) => (
              <View key={p.id} className="flex-row items-center justify-between py-2 border-b border-border-color">
                <Text className="text-sm font-bold text-dark-text">{p.name}</Text>
                <View>
                  {p.price_per_kg && <Text className="text-xs text-grey-text text-right">{formatRupiah(p.price_per_kg)}/kg</Text>}
                  {p.price_per_piece && <Text className="text-xs text-grey-text text-right">{formatRupiah(p.price_per_piece)}/pcs</Text>}
                </View>
              </View>
            ))}
          </View>
        )}
        <Text className="text-xs text-grey-text mb-2">Tambah / Update Harga:</Text>
        <Input label="Jenis Cucian" placeholder="contoh: Reguler, Express, Bed Cover" value={pName} onChangeText={setPName} />
        <View className="mt-3"><CurrencyInput label="Harga per Kg (opsional)" value={pKg} onChangeValue={setPKg} /></View>
        <View className="mt-3"><CurrencyInput label="Harga per Potong (opsional)" value={pPiece} onChangeValue={setPPiece} /></View>
        <View className="mt-4"><Button title="Simpan Harga" onPress={handleSavePricing} loading={pricingLoading} /></View>
      </Modal>
    </SafeAreaView>
  );
}
