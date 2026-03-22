import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Rect, Circle } from "react-native-svg";
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
import { GRADIENTS, GLASS, RADIUS, TYPO, SPACING } from "@utils/theme";
import type { PropertyUnit, UnitStatus } from "@app-types/sewa.types";

const STATUS_MAP: Record<UnitStatus, { label: string; variant: "success" | "error" | "warning" | "neutral" }> = {
  occupied: { label: "Terisi", variant: "success" },
  vacant: { label: "Kosong", variant: "warning" },
  maintenance: { label: "Perbaikan", variant: "neutral" },
};

function BackIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PlusIcon({ size = 14, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5V19M5 12H19" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

function BillingIcon({ size = 18, color = "#00C49A" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={4} width={18} height={16} rx={2} stroke={color} strokeWidth={1.8} />
      <Path d="M7 9H17M7 13H13" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx={17} cy={17} r={4} fill={color} opacity={0.15} />
      <Path d="M17 15.5V18.5M15.5 17H18.5" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
    </Svg>
  );
}

function WrenchIcon({ size = 18, color = "#00C49A" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94L6.73 20.2a2 2 0 01-2.83 0l-.1-.1a2 2 0 010-2.83l6.73-6.73A6 6 0 0114.7 6.3z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function ContractIcon({ size = 18, color = "#00C49A" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M14 2v6h6M8 13h8M8 17h5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function MegaphoneIcon({ size = 18, color = "#00C49A" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export default function PropDetailScreen() {
  const insets = useSafeAreaInsets();
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
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Gradient Header */}
      <LinearGradient
        colors={GRADIENTS.sewa}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + SPACING.sm,
          paddingBottom: SPACING.xl,
          paddingHorizontal: SPACING.lg,
          borderBottomLeftRadius: RADIUS.xxl,
          borderBottomRightRadius: RADIUS.xxl,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <BackIcon />
            </TouchableOpacity>
            <Text style={{ ...TYPO.h3, color: "#FFFFFF", marginLeft: SPACING.md, flex: 1 }} numberOfLines={1}>{propName}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowAdd(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: RADIUS.md,
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              gap: SPACING.xs,
            }}
          >
            <PlusIcon size={14} />
            <Text style={{ ...TYPO.captionBold, color: "#FFFFFF" }}>Unit</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.lg, paddingTop: SPACING.md }}
      >
        {/* Summary Card */}
        <Card variant="glass">
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ ...TYPO.caption, color: "#64748B" }}>Terisi</Text>
              <Text style={{ ...TYPO.money, color: "#00C49A", fontSize: 22 }}>{summary.occupied}/{summary.total}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ ...TYPO.caption, color: "#64748B" }}>Pendapatan/bln</Text>
              <Text style={{ ...TYPO.money, color: "#1E293B", fontSize: 22 }}>{formatRupiah(summary.totalRent)}</Text>
            </View>
          </View>
        </Card>

        {/* Quick actions */}
        <View style={{ flexDirection: "row", marginBottom: SPACING.sm }}>
          <View style={{ flex: 1, marginRight: SPACING.xs }}>
            <TouchableOpacity
              onPress={() => navigateTo("billing")}
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
                ...GLASS.shadow.sm,
              }}
            >
              <BillingIcon size={18} color="#00C49A" />
              <Text style={{ ...TYPO.captionBold, color: "#1E293B" }}>Tagihan</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, marginLeft: SPACING.xs }}>
            <TouchableOpacity
              onPress={() => navigateTo("maintenance")}
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
                ...GLASS.shadow.sm,
              }}
            >
              <WrenchIcon size={18} color="#00C49A" />
              <Text style={{ ...TYPO.captionBold, color: "#1E293B" }}>Maintenance</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flexDirection: "row", marginBottom: SPACING.lg }}>
          <View style={{ flex: 1, marginRight: SPACING.xs }}>
            <TouchableOpacity
              onPress={() => navigateTo("contracts")}
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
                ...GLASS.shadow.sm,
              }}
            >
              <ContractIcon size={18} color="#00C49A" />
              <Text style={{ ...TYPO.captionBold, color: "#1E293B" }}>Kontrak</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, marginLeft: SPACING.xs }}>
            <TouchableOpacity
              onPress={() => navigateTo("vacant")}
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
                ...GLASS.shadow.sm,
              }}
            >
              <MegaphoneIcon size={18} color="#00C49A" />
              <Text style={{ ...TYPO.captionBold, color: "#1E293B" }}>Unit Kosong</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Units list */}
        <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: SPACING.sm }}>
          DAFTAR UNIT
        </Text>
        {!loading && units.length === 0 ? (
          <EmptyState illustration="🏠" title="Belum ada unit" actionLabel="+ Tambah Unit" onAction={() => setShowAdd(true)} />
        ) : (
          units.map((u) => {
            const s = STATUS_MAP[u.status];
            return (
              <TouchableOpacity key={u.id} onPress={() => router.push({ pathname: "/(provider)/(tabs)/sewa/unit-detail", params: { propId, propName, unitId: u.id, unitName: u.unit_name } })} activeOpacity={0.7}>
                <Card variant="glass">
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>{u.unit_name}</Text>
                      <Text style={{ ...TYPO.caption, color: "#64748B", marginTop: 2 }}>{formatRupiah(u.monthly_rent)}/bln{u.tenant_name ? ` \u2022 ${u.tenant_name}` : ""}</Text>
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
        <View style={{ marginTop: SPACING.md }}>
          <CurrencyInput label="Harga Sewa/Bulan" value={unitRent} onChangeValue={setUnitRent} />
        </View>
        <View style={{ marginTop: SPACING.lg }}>
          <Button title="Tambah" onPress={handleAddUnit} loading={addLoading} />
        </View>
      </Modal>
    </View>
  );
}
