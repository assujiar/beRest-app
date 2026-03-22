import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Card } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Modal } from "@components/ui/Modal";
import { SearchBar } from "@components/shared/SearchBar";
import { EmptyState } from "@components/shared/EmptyState";
import { getCustomers, searchCustomers, upsertCustomer } from "@services/lapak-advanced.service";
import { useUIStore } from "@stores/ui.store";
import { formatRupiah } from "@utils/format";
import { GRADIENTS, RADIUS, TYPO, SPACING } from "@utils/theme";
import Svg, { Path } from "react-native-svg";
import type { CustomerRecord } from "@app-types/lapak.types";

function ArrowLeftIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function CustomersScreen() {
  const insets = useSafeAreaInsets();
  const { bizId } = useLocalSearchParams<{ bizId: string }>();
  const showToast = useUIStore((s) => s.showToast);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { if (bizId) loadData(); }, [bizId]);

  async function loadData() {
    try { setCustomers(await getCustomers(bizId!)); } catch {} finally { setLoading(false); }
  }

  async function handleSearch(q: string) {
    setSearch(q);
    if (q.length >= 2) {
      try { setCustomers(await searchCustomers(bizId!, q)); } catch {}
    } else { loadData(); }
  }

  async function handleAdd() {
    if (!newName.trim()) return;
    setActionLoading(true);
    try {
      await upsertCustomer(bizId!, { name: newName.trim(), phone: newPhone.trim() || null, tags: [], notes: null });
      showToast("Pelanggan ditambahkan!", "success"); setNewName(""); setNewPhone(""); setShowAdd(false); loadData();
    } catch { showToast("Gagal", "error"); } finally { setActionLoading(false); }
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
            <Text style={{ ...TYPO.h3, color: "#FFFFFF", marginLeft: SPACING.md }}>Pelanggan</Text>
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
            <Text style={{ ...TYPO.captionBold, color: "#FFFFFF" }}>+ Tambah</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={{ paddingHorizontal: SPACING.md, paddingTop: SPACING.md }}>
        <SearchBar value={search} onChangeText={handleSearch} placeholder="Cari pelanggan..." />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.md, paddingTop: SPACING.md }}
      >
        {!loading && customers.length === 0 ? (
          <EmptyState
            illustration="👤"
            title="Belum ada pelanggan"
            actionLabel="+ Tambah Pelanggan"
            onAction={() => setShowAdd(true)}
          />
        ) : (
          customers.map((c) => (
            <Card key={c.id} variant="glass">
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <LinearGradient
                  colors={[...GRADIENTS.lapakLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: RADIUS.full,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: SPACING.md,
                  }}
                >
                  <Text style={{ ...TYPO.bodyBold, color: "#50BFC3" }}>
                    {c.name.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>{c.name}</Text>
                  {c.phone && (
                    <Text style={{ ...TYPO.caption, color: "#64748B" }}>{c.phone}</Text>
                  )}
                  <Text style={{ ...TYPO.caption, color: "#64748B" }}>
                    {c.total_orders} order • {formatRupiah(c.total_spent)}
                  </Text>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <Modal visible={showAdd} onClose={() => setShowAdd(false)} title="Tambah Pelanggan">
        <Input label="Nama" placeholder="contoh: Pak Andi" value={newName} onChangeText={setNewName} />
        <View style={{ marginTop: SPACING.md }}>
          <Input label="No HP (opsional)" placeholder="08123456789" value={newPhone} onChangeText={setNewPhone} keyboardType="phone-pad" />
        </View>
        <View style={{ marginTop: SPACING.lg }}>
          <Button title="Tambah" onPress={handleAdd} loading={actionLoading} />
        </View>
      </Modal>
    </View>
  );
}
