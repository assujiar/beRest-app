import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Modal } from "@components/ui/Modal";
import { CurrencyInput } from "@components/shared/CurrencyInput";
import { EmptyState } from "@components/shared/EmptyState";
import { createRentalItem, getRentalItems, createRentalTransaction, getRentalTransactions, returnRental } from "@services/rental.service";
import { useAuthStore } from "@stores/auth.store";
import { useUIStore } from "@stores/ui.store";
import { formatRupiah, formatDate } from "@utils/format";
import { GRADIENTS, GLASS, RADIUS, TYPO, SPACING } from "@utils/theme";
import type { RentalItem, RentalTransaction, RentalStatus } from "@app-types/sewa.types";

const STATUS_MAP: Record<RentalStatus, { label: string; variant: "info" | "success" | "error" }> = {
  active: { label: "Dipinjam", variant: "info" }, returned: { label: "Dikembalikan", variant: "success" }, overdue: { label: "Terlambat", variant: "error" },
};

function BackIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

type Tab = "items" | "active" | "history";

export default function RentalScreen() {
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((s) => s.profile);
  const showToast = useUIStore((s) => s.showToast);
  const [tab, setTab] = useState<Tab>("items");
  const [items, setItems] = useState<RentalItem[]>([]);
  const [activeTx, setActiveTx] = useState<RentalTransaction[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showBorrow, setShowBorrow] = useState<RentalItem | null>(null);
  const [iName, setIName] = useState(""); const [iRate, setIRate] = useState(0); const [iStock, setIStock] = useState(1);
  const [bName, setBName] = useState(""); const [bPhone, setBPhone] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { if (profile?.id) loadData(); }, [profile?.id, tab]);

  async function loadData() {
    if (!profile?.id) return;
    try {
      if (tab === "items") setItems(await getRentalItems(profile.id));
      if (tab === "active") setActiveTx(await getRentalTransactions(profile.id, true));
      if (tab === "history") setActiveTx(await getRentalTransactions(profile.id, false));
    } catch {}
  }

  async function handleAddItem() {
    if (!iName.trim() || iRate <= 0 || !profile?.id) return;
    setActionLoading(true);
    try {
      await createRentalItem(profile.id, { name: iName.trim(), description: null, photo_url: null, daily_rate: iRate, deposit_amount: 0, total_stock: iStock });
      showToast("Barang ditambahkan!", "success"); setIName(""); setIRate(0); setIStock(1); setShowAddItem(false); loadData();
    } catch { showToast("Gagal", "error"); } finally { setActionLoading(false); }
  }

  async function handleBorrow() {
    if (!bName.trim() || !showBorrow || !profile?.id) return;
    setActionLoading(true);
    try {
      await createRentalTransaction(showBorrow.id, profile.id, { borrower_name: bName.trim(), borrower_phone: bPhone.trim() || null, consumer_id: null, quantity: 1, daily_rate: showBorrow.daily_rate, deposit_collected: showBorrow.deposit_amount, start_date: new Date().toISOString(), expected_return: null, notes: null });
      showToast("Pinjaman dicatat!", "success"); setBName(""); setBPhone(""); setShowBorrow(null); loadData();
    } catch { showToast("Gagal", "error"); } finally { setActionLoading(false); }
  }

  async function handleReturn(tx: RentalTransaction) {
    Alert.alert("Tandai Dikembalikan?", `${tx.borrower_name} mengembalikan barang.`, [
      { text: "Batal", style: "cancel" },
      { text: "Ya", onPress: async () => {
        try { await returnRental(tx.id, null); showToast("Barang dikembalikan!", "success"); loadData(); }
        catch { showToast("Gagal", "error"); }
      }},
    ]);
  }

  const tabs: { key: Tab; label: string }[] = [{ key: "items", label: "Barang" }, { key: "active", label: "Aktif" }, { key: "history", label: "Riwayat" }];

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Gradient Header */}
      <LinearGradient
        colors={GRADIENTS.sewa}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + SPACING.sm,
          paddingBottom: 0,
          paddingHorizontal: SPACING.lg,
          borderBottomLeftRadius: RADIUS.xxl,
          borderBottomRightRadius: RADIUS.xxl,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: SPACING.md }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={{ ...TYPO.h3, color: "#FFFFFF", marginLeft: SPACING.md }}>Rental</Text>
        </View>

        {/* Tab Bar inside gradient */}
        <View style={{ flexDirection: "row", marginBottom: -1 }}>
          {tabs.map((t) => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: SPACING.md,
                borderBottomWidth: 2,
                borderBottomColor: tab === t.key ? "#FFFFFF" : "transparent",
              }}
            >
              <Text style={{ ...TYPO.captionBold, color: tab === t.key ? "#FFFFFF" : "rgba(255,255,255,0.6)" }}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.lg, paddingTop: SPACING.md }}
      >
        {tab === "items" && (
          <>
            <TouchableOpacity
              onPress={() => setShowAddItem(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: SPACING.sm,
                backgroundColor: GLASS.card.background,
                borderWidth: 1,
                borderColor: GLASS.card.border,
                borderRadius: RADIUS.lg,
                paddingVertical: SPACING.md,
                marginBottom: SPACING.md,
                borderStyle: "dashed",
                ...GLASS.shadow.sm,
              }}
            >
              <Text style={{ ...TYPO.captionBold, color: "#00C49A" }}>+ Tambah Barang</Text>
            </TouchableOpacity>
            {items.map((item) => (
              <Card key={item.id} variant="glass">
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>{item.name}</Text>
                    <Text style={{ ...TYPO.caption, color: "#64748B" }}>{formatRupiah(item.daily_rate)}/hari {"\u2022"} Stok: {item.available_stock}/{item.total_stock}</Text>
                  </View>
                  {item.available_stock > 0 && (
                    <TouchableOpacity
                      onPress={() => setShowBorrow(item)}
                      style={{
                        backgroundColor: "#00C49A",
                        borderRadius: RADIUS.md,
                        paddingHorizontal: SPACING.md,
                        paddingVertical: SPACING.sm,
                      }}
                    >
                      <Text style={{ ...TYPO.captionBold, color: "#FFFFFF" }}>Pinjamkan</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            ))}
            {items.length === 0 && <EmptyState illustration="📦" title="Belum ada barang rental" />}
          </>
        )}

        {(tab === "active" || tab === "history") && activeTx.map((tx) => {
          const s = STATUS_MAP[tx.status]; const txData = tx as RentalTransaction & { rental_items?: { name: string } };
          return (
            <Card key={tx.id} variant="glass">
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACING.xs }}>
                <Text style={{ ...TYPO.caption, color: "#94A3B8", fontFamily: "monospace" }}>{tx.rental_code}</Text>
                <Badge label={s.label} variant={s.variant} />
              </View>
              <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>{tx.borrower_name}</Text>
              <Text style={{ ...TYPO.caption, color: "#64748B" }}>{txData.rental_items?.name} {"\u2022"} {formatDate(tx.start_date)}</Text>
              {tx.total_cost != null && (
                <Text style={{ ...TYPO.bodyBold, color: "#00C49A", marginTop: SPACING.xs }}>{formatRupiah(tx.total_cost)}</Text>
              )}
              {tx.status === "active" && (
                <TouchableOpacity
                  onPress={() => handleReturn(tx)}
                  style={{
                    backgroundColor: "rgba(34,197,94,0.08)",
                    borderRadius: RADIUS.md,
                    paddingHorizontal: SPACING.md,
                    paddingVertical: SPACING.sm,
                    marginTop: SPACING.sm,
                    alignSelf: "flex-start",
                  }}
                >
                  <Text style={{ ...TYPO.captionBold, color: "#16A34A" }}>Dikembalikan</Text>
                </TouchableOpacity>
              )}
            </Card>
          );
        })}
      </ScrollView>

      <Modal visible={showAddItem} onClose={() => setShowAddItem(false)} title="Tambah Barang Rental">
        <Input label="Nama Barang" placeholder="contoh: Tenda Camping" value={iName} onChangeText={setIName} />
        <View style={{ marginTop: SPACING.md }}>
          <CurrencyInput label="Harga Sewa/Hari" value={iRate} onChangeValue={setIRate} />
        </View>
        <View style={{ marginTop: SPACING.md }}>
          <Input label="Jumlah Stok" placeholder="1" value={String(iStock)} onChangeText={(t) => setIStock(parseInt(t) || 1)} keyboardType="numeric" />
        </View>
        <View style={{ marginTop: SPACING.lg }}>
          <Button title="Tambah" onPress={handleAddItem} loading={actionLoading} />
        </View>
      </Modal>

      <Modal visible={!!showBorrow} onClose={() => setShowBorrow(null)} title="Pinjamkan Barang">
        <Input label="Nama Peminjam" placeholder="contoh: Pak Andi" value={bName} onChangeText={setBName} />
        <View style={{ marginTop: SPACING.md }}>
          <Input label="No HP (opsional)" placeholder="08123456789" value={bPhone} onChangeText={setBPhone} keyboardType="phone-pad" />
        </View>
        <View style={{ marginTop: SPACING.lg }}>
          <Button title="Catat Pinjaman" onPress={handleBorrow} loading={actionLoading} />
        </View>
      </Modal>
    </View>
  );
}
