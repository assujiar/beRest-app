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
import { getUnits, addUnit, getPropertySummary } from "@services/sewa.service";
import { useUIStore } from "@stores/ui.store";
import { formatRupiah } from "@utils/format";
import type { PropertyUnit, UnitStatus } from "@app-types/sewa.types";

const STATUS_MAP: Record<UnitStatus, { label: string; variant: "success" | "error" | "warning" | "neutral" }> = {
  occupied: { label: "Terisi", variant: "success" },
  vacant: { label: "Kosong", variant: "warning" },
  maintenance: { label: "Perbaikan", variant: "neutral" },
};

export default function PropDetailScreen() {
  const { propId, propName } = useLocalSearchParams<{ propId: string; propName: string }>();
  const showToast = useUIStore((s) => s.showToast);
  const [units, setUnits] = useState<PropertyUnit[]>([]);
  const [summary, setSummary] = useState({ total: 0, occupied: 0, vacant: 0, totalRent: 0 });
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [unitName, setUnitName] = useState("");
  const [unitRent, setUnitRent] = useState(0);
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => { if (propId) loadData(); }, [propId]);

  async function loadData() {
    try {
      const [u, s] = await Promise.all([getUnits(propId!), getPropertySummary(propId!)]);
      setUnits(u); setSummary(s);
    } catch { /* silent */ } finally { setLoading(false); }
  }

  async function handleAddUnit() {
    if (!unitName.trim() || unitRent <= 0) return;
    setAddLoading(true);
    try {
      await addUnit(propId!, { unit_name: unitName.trim(), monthly_rent: unitRent });
      showToast("Unit ditambahkan!", "success");
      setUnitName(""); setUnitRent(0); setShowAdd(false); loadData();
    } catch { showToast("Gagal menambah unit", "error"); } finally { setAddLoading(false); }
  }

  function navigateTo(route: string) {
    router.push({ pathname: `/(provider)/(tabs)/sewa/${route}`, params: { propId, propName } });
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border-color bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}><Text className="text-lg text-navy">←</Text></TouchableOpacity>
          <Text className="text-lg font-bold text-dark-text ml-3">{propName}</Text>
        </View>
        <TouchableOpacity onPress={() => setShowAdd(true)} className="bg-sewa rounded-lg px-3 py-2">
          <Text className="text-white text-xs font-bold">+ Unit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-3">
        {/* Summary */}
        <Card>
          <View className="flex-row">
            <View className="flex-1"><Text className="text-xs text-grey-text">Terisi</Text><Text className="text-xl font-bold text-sewa">{summary.occupied}/{summary.total}</Text></View>
            <View className="flex-1"><Text className="text-xs text-grey-text">Pendapatan/bln</Text><Text className="text-xl font-bold text-dark-text">{formatRupiah(summary.totalRent)}</Text></View>
          </View>
        </Card>

        {/* Quick actions */}
        <View className="flex-row mb-3">
          <View className="flex-1 mr-1"><Button title="💰 Tagihan" variant="secondary" onPress={() => navigateTo("billing")} /></View>
          <View className="flex-1 mx-1"><Button title="🔧 Maintenance" variant="secondary" onPress={() => navigateTo("maintenance")} /></View>
        </View>
        <View className="flex-row mb-3">
          <View className="flex-1 mr-1"><Button title="📄 Kontrak" variant="secondary" onPress={() => navigateTo("contracts")} /></View>
          <View className="flex-1 mx-1"><Button title="📢 Unit Kosong" variant="secondary" onPress={() => navigateTo("vacant")} /></View>
        </View>

        {/* Units list */}
        <Text className="text-sm font-bold text-grey-text mb-2">DAFTAR UNIT</Text>
        {!loading && units.length === 0 ? (
          <EmptyState illustration="🏠" title="Belum ada unit" actionLabel="+ Tambah Unit" onAction={() => setShowAdd(true)} />
        ) : (
          units.map((u) => {
            const s = STATUS_MAP[u.status];
            return (
              <TouchableOpacity key={u.id} onPress={() => router.push({ pathname: "/(provider)/(tabs)/sewa/unit-detail", params: { propId, propName, unitId: u.id, unitName: u.unit_name } })} activeOpacity={0.7}>
                <Card>
                  <View className="flex-row items-center">
                    <View className="flex-1">
                      <Text className="text-base font-bold text-dark-text">{u.unit_name}</Text>
                      <Text className="text-xs text-grey-text">{formatRupiah(u.monthly_rent)}/bln{u.tenant_name ? ` • ${u.tenant_name}` : ""}</Text>
                    </View>
                    <Badge label={s.label} variant={s.variant} />
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <Modal visible={showAdd} onClose={() => setShowAdd(false)} title="Tambah Unit">
        <Input label="Nama Unit" placeholder="contoh: Kamar 1A" value={unitName} onChangeText={setUnitName} />
        <View className="mt-3"><CurrencyInput label="Harga Sewa/Bulan" value={unitRent} onChangeValue={setUnitRent} /></View>
        <View className="mt-4"><Button title="Tambah" onPress={handleAddUnit} loading={addLoading} /></View>
      </Modal>
    </SafeAreaView>
  );
}
