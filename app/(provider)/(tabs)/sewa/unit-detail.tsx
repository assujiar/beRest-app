import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
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
import type { PropertyUnit } from "@app-types/sewa.types";

export default function UnitDetailScreen() {
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
      if (result.nik) setTPhone(result.nik); // Store NIK in phone field temporarily or show in UI
      showToast("KTP berhasil di-scan!", "success");
    } catch {
      showToast("Gagal scan KTP", "error");
    } finally {
      setKtpScanLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-border-color bg-white">
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}><Text className="text-lg text-navy">←</Text></TouchableOpacity>
        <Text className="text-lg font-bold text-dark-text ml-3">{unitName}</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-3">
        {unit && (
          <>
            <Card>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs text-grey-text">Status</Text>
                <Badge label={unit.status === "occupied" ? "Terisi" : unit.status === "vacant" ? "Kosong" : "Perbaikan"} variant={unit.status === "occupied" ? "success" : "warning"} />
              </View>
              <Text className="text-xs text-grey-text">Sewa/Bulan</Text>
              <Text className="text-2xl font-bold text-dark-text">{formatRupiah(unit.monthly_rent)}</Text>
            </Card>

            {unit.status === "occupied" && unit.tenant_name ? (
              <Card>
                <Text className="text-sm font-bold text-grey-text mb-2">PENGHUNI</Text>
                <Text className="text-base font-bold text-dark-text">{unit.tenant_name}</Text>
                {unit.tenant_phone && <Text className="text-xs text-grey-text">{unit.tenant_phone}</Text>}
                {unit.tenant_start_date && <Text className="text-xs text-grey-text mt-1">Masuk: {formatDate(unit.tenant_start_date)}</Text>}
                {unit.deposit_amount > 0 && <Text className="text-xs text-grey-text">Deposit: {formatRupiah(unit.deposit_amount)}</Text>}
                <View className="mt-3">
                  <Button title="Tandai Keluar" variant="destructive" onPress={handleRemoveTenant} />
                </View>
              </Card>
            ) : (
              <Card>
                <Text className="text-sm text-grey-text text-center mb-3">Belum ada penghuni</Text>
                <Button title="+ Tambah Penghuni" onPress={() => setShowAddTenant(true)} />
              </Card>
            )}
          </>
        )}
      </ScrollView>

      <Modal visible={showAddTenant} onClose={() => setShowAddTenant(false)} title="Tambah Penghuni">
        <Input label="Nama" placeholder="contoh: Budi Santoso" value={tName} onChangeText={setTName} />
        <View className="mt-3"><Input label="No HP" placeholder="08123456789" value={tPhone} onChangeText={setTPhone} keyboardType="phone-pad" /></View>
        <View className="mt-3"><CurrencyInput label="Deposit" value={tDeposit} onChangeValue={setTDeposit} /></View>
        <View className="mt-3">
          <PhotoPicker label="Foto KTP (opsional)" value={tKtp} onChange={(uri) => {
            setTKtp(uri);
            if (uri) handleScanKTP(uri);
          }} />
          {ktpScanLoading && (
            <View className="flex-row items-center mt-2">
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text className="text-xs text-sewa ml-2">AI sedang baca KTP...</Text>
            </View>
          )}
        </View>
        <View className="mt-4"><Button title="Simpan" onPress={handleAssignTenant} loading={actionLoading} /></View>
      </Modal>

      <UpgradeModal visible={showUpgrade} onClose={() => setShowUpgrade(false)} currentTier={tier} featureName={upgradeFeature} />
    </SafeAreaView>
  );
}
