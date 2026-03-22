import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
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
import { GRADIENTS, GLASS, RADIUS, TYPO, SPACING } from "@utils/theme";
import Svg, { Path } from "react-native-svg";
import type { LaundryOrder, LaundryStatus, LaundryPricing } from "@app-types/lapak.types";

function ArrowLeftIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function TagIcon({ size = 14, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 7h.01" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function ArrowRightIcon({ size = 12, color = "#50BFC3" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14M12 5l7 7-7 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

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
  const insets = useSafeAreaInsets();
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
            <Text style={{ ...TYPO.h3, color: "#FFFFFF", marginLeft: SPACING.md }}>Laundry</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
            <TouchableOpacity
              onPress={() => setShowPricing(true)}
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: RADIUS.md,
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.sm,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.25)",
                flexDirection: "row",
                alignItems: "center",
                gap: SPACING.xs,
              }}
            >
              <TagIcon size={14} color="#FFFFFF" />
              <Text style={{ ...TYPO.captionBold, color: "#FFFFFF" }}>Harga</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowCreate(true)}
              style={{
                backgroundColor: "rgba(255,255,255,0.25)",
                borderRadius: RADIUS.md,
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.sm,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.35)",
              }}
            >
              <Text style={{ ...TYPO.captionBold, color: "#FFFFFF" }}>+ Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.md, paddingTop: SPACING.md }}
      >
        {!loading && orders.length === 0 ? (
          <EmptyState
            illustration="👕"
            title="Belum ada order laundry"
            actionLabel="+ Order Baru"
            onAction={() => setShowCreate(true)}
          />
        ) : (
          orders.map((o) => (
            <Card key={o.id} variant="glass">
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACING.sm }}>
                <Text style={{ ...TYPO.caption, color: "#64748B", fontFamily: "monospace" }}>{o.order_code}</Text>
                <Badge label={STATUS_LABELS[o.status]} variant={STATUS_VARIANTS[o.status]} />
              </View>
              <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>{o.customer_name}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: SPACING.xs }}>
                <Text style={{ ...TYPO.money, color: "#50BFC3" }}>{formatRupiah(o.total)}</Text>
                <Text style={{ ...TYPO.caption, color: "#64748B" }}>{formatRelativeTime(o.created_at)}</Text>
              </View>
              {o.status !== "picked_up" && o.status !== "cancelled" && (
                <TouchableOpacity
                  onPress={() => handleNextStatus(o)}
                  style={{
                    backgroundColor: "rgba(80,191,195,0.08)",
                    borderRadius: RADIUS.md,
                    paddingHorizontal: SPACING.md,
                    paddingVertical: SPACING.sm,
                    marginTop: SPACING.sm,
                    alignSelf: "flex-start",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: SPACING.xs,
                  }}
                >
                  <ArrowRightIcon size={12} color="#50BFC3" />
                  <Text style={{ ...TYPO.captionBold, color: "#50BFC3" }}>
                    {STATUS_LABELS[STATUS_FLOW[STATUS_FLOW.indexOf(o.status) + 1] ?? "picked_up"]}
                  </Text>
                </TouchableOpacity>
              )}
            </Card>
          ))
        )}
      </ScrollView>

      <Modal visible={showCreate} onClose={() => setShowCreate(false)} title="Order Laundry Baru">
        <Input label="Nama Pelanggan" placeholder="contoh: Ibu Sari" value={custName} onChangeText={setCustName} />
        <View style={{ marginTop: SPACING.md }}>
          <Input label="No HP (opsional)" placeholder="08123456789" value={custPhone} onChangeText={setCustPhone} keyboardType="phone-pad" />
        </View>
        <View style={{ marginTop: SPACING.md }}>
          <CurrencyInput label="Total" value={total} onChangeValue={setTotal} />
        </View>
        <View style={{ marginTop: SPACING.lg }}>
          <Button title="Buat Order" onPress={handleCreate} loading={createLoading} />
        </View>
      </Modal>

      {/* Pricing Modal */}
      <Modal visible={showPricing} onClose={() => setShowPricing(false)} title="Daftar Harga Laundry">
        {pricing.length > 0 && (
          <View style={{ marginBottom: SPACING.lg }}>
            {pricing.map((p) => (
              <View
                key={p.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: SPACING.sm,
                  borderBottomWidth: 1,
                  borderBottomColor: GLASS.card.border,
                }}
              >
                <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>{p.name}</Text>
                <View>
                  {p.price_per_kg && (
                    <Text style={{ ...TYPO.caption, color: "#64748B", textAlign: "right" }}>
                      {formatRupiah(p.price_per_kg)}/kg
                    </Text>
                  )}
                  {p.price_per_piece && (
                    <Text style={{ ...TYPO.caption, color: "#64748B", textAlign: "right" }}>
                      {formatRupiah(p.price_per_piece)}/pcs
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
        <Text style={{ ...TYPO.caption, color: "#64748B", marginBottom: SPACING.sm }}>
          Tambah / Update Harga:
        </Text>
        <Input label="Jenis Cucian" placeholder="contoh: Reguler, Express, Bed Cover" value={pName} onChangeText={setPName} />
        <View style={{ marginTop: SPACING.md }}>
          <CurrencyInput label="Harga per Kg (opsional)" value={pKg} onChangeValue={setPKg} />
        </View>
        <View style={{ marginTop: SPACING.md }}>
          <CurrencyInput label="Harga per Potong (opsional)" value={pPiece} onChangeValue={setPPiece} />
        </View>
        <View style={{ marginTop: SPACING.lg }}>
          <Button title="Simpan Harga" onPress={handleSavePricing} loading={pricingLoading} />
        </View>
      </Modal>
    </View>
  );
}
