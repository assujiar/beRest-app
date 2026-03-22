import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Modal } from "@components/ui/Modal";
import { CurrencyInput } from "@components/shared/CurrencyInput";
import { PhotoPicker } from "@components/shared/PhotoPicker";
import { UpgradeModal } from "@components/shared/UpgradeModal";
import { assignTenant, removeTenant } from "@services/sewa.service";
import { scanKTP } from "@services/gemini.service";
import { useSubscription } from "@hooks/shared/useSubscription";
import { supabase } from "@services/supabase";
import { useUIStore } from "@stores/ui.store";
import { formatRupiah, formatDate } from "@utils/format";
import { GRADIENTS, RADIUS, TYPO, SPACING } from "@utils/theme";
import type { PropertyUnit } from "@app-types/sewa.types";

function BackIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function UserIcon({ size = 20, color = "#00C49A" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 11a4 4 0 100-8 4 4 0 000 8z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function UnitDetailScreen() {
  const insets = useSafeAreaInsets();
  const { unitId, unitName } = useLocalSearchParams<{ propId: string; propName: string; unitId: string; unitName: string }>();
  const showToast = useUIStore((s) => s.showToast);
  const { tier, requireUpgrade, showUpgrade, setShowUpgrade, upgradeFeature } = useSubscription();
  const [unit, setUnit] = useState<PropertyUnit | null>(null);
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [tName, setTName] = useState("");
  const [tPhone, setTPhone] = useState("");
  const [tKtp, setTKtp] = useState<string | null>(null);
  const [tDeposit, setTDeposit] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [ktpScanLoading, setKtpScanLoading] = useState(false);

  useEffect(() => { if (unitId) loadUnit(); }, [unitId]);

  async function loadUnit() {
    const { data } = await supabase.from("property_units").select("*").eq("id", unitId!).single();
    if (data) setUnit(data as PropertyUnit);
  }

  async function handleAssignTenant() {
    if (!tName.trim()) return;
    setActionLoading(true);
    try {
      await assignTenant(unitId!, {
        tenant_name: tName.trim(), tenant_phone: tPhone.trim() || null,
        tenant_ktp_photo: tKtp, tenant_consumer_id: null,
        tenant_start_date: new Date().toISOString(), contract_end_date: null,
        deposit_amount: tDeposit,
      });
      showToast("Penghuni ditambahkan!", "success");
      setShowAddTenant(false); loadUnit();
    } catch { showToast("Gagal menambah penghuni", "error"); } finally { setActionLoading(false); }
  }

  function handleRemoveTenant() {
    Alert.alert("Tandai Keluar?", `${unit?.tenant_name} akan ditandai keluar dari ${unitName}.`, [
      { text: "Batal", style: "cancel" },
      { text: "Ya, Keluarkan", style: "destructive", onPress: async () => {
        try { await removeTenant(unitId!); showToast("Penghuni ditandai keluar", "success"); loadUnit(); }
        catch { showToast("Gagal", "error"); }
      }},
    ]);
  }

  async function handleScanKTP(uri: string) {
    if (requireUpgrade("canUseAI", "AI Scan KTP")) return;
    setKtpScanLoading(true);
    try {
      const result = await scanKTP(uri);
      if (result.name) setTName(result.name);
      if (result.nik) setTPhone(result.nik);
      showToast("KTP berhasil di-scan!", "success");
    } catch {
      showToast("Gagal scan KTP", "error");
    } finally {
      setKtpScanLoading(false);
    }
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
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.lg,
          borderBottomLeftRadius: RADIUS.xxl,
          borderBottomRightRadius: RADIUS.xxl,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={{ ...TYPO.h3, color: "#FFFFFF", marginLeft: SPACING.md }}>{unitName}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.lg, paddingTop: SPACING.md }}
      >
        {unit && (
          <>
            {/* Status & Rent Card */}
            <Card variant="glass">
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACING.sm }}>
                <Text style={{ ...TYPO.caption, color: "#64748B" }}>Status</Text>
                <Badge label={unit.status === "occupied" ? "Terisi" : unit.status === "vacant" ? "Kosong" : "Perbaikan"} variant={unit.status === "occupied" ? "success" : "warning"} />
              </View>
              <Text style={{ ...TYPO.caption, color: "#64748B" }}>Sewa/Bulan</Text>
              <Text style={{ ...TYPO.money, color: "#1E293B", fontSize: 26 }}>{formatRupiah(unit.monthly_rent)}</Text>
            </Card>

            {unit.status === "occupied" && unit.tenant_name ? (
              <Card variant="glass">
                <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: SPACING.sm }}>
                  PENGHUNI
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: SPACING.sm }}>
                  <View style={{
                    width: 36,
                    height: 36,
                    borderRadius: RADIUS.full,
                    backgroundColor: "rgba(0,196,154,0.1)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: SPACING.md,
                  }}>
                    <UserIcon size={20} color="#00C49A" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>{unit.tenant_name}</Text>
                    {unit.tenant_phone && <Text style={{ ...TYPO.caption, color: "#64748B" }}>{unit.tenant_phone}</Text>}
                  </View>
                </View>
                {unit.tenant_start_date && (
                  <Text style={{ ...TYPO.caption, color: "#64748B", marginTop: SPACING.xs }}>Masuk: {formatDate(unit.tenant_start_date)}</Text>
                )}
                {unit.deposit_amount > 0 && (
                  <Text style={{ ...TYPO.caption, color: "#64748B" }}>Deposit: {formatRupiah(unit.deposit_amount)}</Text>
                )}
                <View style={{ marginTop: SPACING.md }}>
                  <Button title="Tandai Keluar" variant="destructive" onPress={handleRemoveTenant} />
                </View>
              </Card>
            ) : (
              <Card variant="glass">
                <Text style={{ ...TYPO.body, color: "#64748B", textAlign: "center", marginBottom: SPACING.md }}>Belum ada penghuni</Text>
                <Button title="+ Tambah Penghuni" onPress={() => setShowAddTenant(true)} />
              </Card>
            )}
          </>
        )}
      </ScrollView>

      <Modal visible={showAddTenant} onClose={() => setShowAddTenant(false)} title="Tambah Penghuni">
        <Input label="Nama" placeholder="contoh: Budi Santoso" value={tName} onChangeText={setTName} />
        <View style={{ marginTop: SPACING.md }}>
          <Input label="No HP" placeholder="08123456789" value={tPhone} onChangeText={setTPhone} keyboardType="phone-pad" />
        </View>
        <View style={{ marginTop: SPACING.md }}>
          <CurrencyInput label="Deposit" value={tDeposit} onChangeValue={setTDeposit} />
        </View>
        <View style={{ marginTop: SPACING.md }}>
          <PhotoPicker label="Foto KTP (opsional)" value={tKtp} onChange={(uri) => {
            setTKtp(uri);
            if (uri) handleScanKTP(uri);
          }} />
          {ktpScanLoading && (
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: SPACING.sm }}>
              <ActivityIndicator size="small" color="#00C49A" />
              <Text style={{ ...TYPO.caption, color: "#00C49A", marginLeft: SPACING.sm }}>AI sedang baca KTP...</Text>
            </View>
          )}
        </View>
        <View style={{ marginTop: SPACING.lg }}>
          <Button title="Simpan" onPress={handleAssignTenant} loading={actionLoading} />
        </View>
      </Modal>

      <UpgradeModal visible={showUpgrade} onClose={() => setShowUpgrade(false)} currentTier={tier} featureName={upgradeFeature} />
    </View>
  );
}
