import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Modal } from "@components/ui/Modal";
import { PhotoPicker } from "@components/shared/PhotoPicker";
import { getTenantBillings, updateBillingStatus, createMaintenanceRequest } from "@services/sewa.service";
import { supabase } from "@services/supabase";
import { useAuthStore } from "@stores/auth.store";
import { useUIStore } from "@stores/ui.store";
import { formatRupiah, formatDate } from "@utils/format";
import type { RentBilling, RentPaymentStatus, PropertyUnit } from "@app-types/sewa.types";

const STATUS_MAP: Record<RentPaymentStatus, { label: string; variant: "success" | "error" | "warning" | "neutral" }> = {
  paid: { label: "Lunas", variant: "success" }, unpaid: { label: "Belum Bayar", variant: "error" },
  partial: { label: "Sebagian", variant: "warning" }, overdue: { label: "Terlambat", variant: "error" },
};

export default function ConsumerSewaScreen() {
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const profile = useAuthStore((s) => s.profile);
  const showToast = useUIStore((s) => s.showToast);
  const [unit, setUnit] = useState<PropertyUnit | null>(null);
  const [billings, setBillings] = useState<RentBilling[]>([]);
  const [showUpload, setShowUpload] = useState<string | null>(null);
  const [proofPhoto, setProofPhoto] = useState<string | null>(null);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [mTitle, setMTitle] = useState("");
  const [mDesc, setMDesc] = useState("");
  const [mPhoto, setMPhoto] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { if (profile?.id) loadData(); }, [profile?.id]);

  async function loadData() {
    try {
      const billingData = await getTenantBillings(profile!.id);
      setBillings(billingData);
      if (unitId) {
        const { data } = await supabase.from("property_units").select("*").eq("id", unitId).single();
        if (data) setUnit(data as PropertyUnit);
      }
    } catch { /* silent */ }
  }

  async function handleUploadProof() {
    if (!proofPhoto || !showUpload) return;
    setActionLoading(true);
    try {
      await updateBillingStatus(showUpload, "paid", proofPhoto);
      showToast("Bukti bayar terkirim!", "success"); setShowUpload(null); setProofPhoto(null); loadData();
    } catch { showToast("Gagal upload", "error"); } finally { setActionLoading(false); }
  }

  async function handleMaintenanceRequest() {
    if (!mTitle.trim() || !mDesc.trim() || !unit) return;
    setActionLoading(true);
    try {
      await createMaintenanceRequest({
        property_id: unit.property_id, unit_id: unit.id,
        requested_by: "tenant", consumer_id: profile?.id ?? null,
        title: mTitle.trim(), description: mDesc.trim(), priority: "medium",
        photos: mPhoto ? [mPhoto] : [],
      });
      showToast("Permintaan dikirim!", "success"); setShowMaintenance(false);
      setMTitle(""); setMDesc(""); setMPhoto(null);
    } catch { showToast("Gagal kirim permintaan", "error"); } finally { setActionLoading(false); }
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-border-color bg-white">
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}><Text className="text-lg text-navy">←</Text></TouchableOpacity>
        <Text className="text-lg font-bold text-dark-text ml-3">{unit?.unit_name ?? "Unit Sewa"}</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-3">
        {unit && (
          <Card>
            <Text className="text-xs text-grey-text">Sewa per Bulan</Text>
            <Text className="text-2xl font-bold text-dark-text">{formatRupiah(unit.monthly_rent)}</Text>
          </Card>
        )}

        <Button title="🔧 Laporkan Kerusakan" variant="secondary" onPress={() => setShowMaintenance(true)} />

        <Text className="text-sm font-bold text-grey-text mt-4 mb-2">TAGIHAN</Text>
        {billings.map((b) => {
          const s = STATUS_MAP[b.status];
          return (
            <Card key={b.id}>
              <View className="flex-row items-center">
                <View className="flex-1">
                  <Text className="text-sm text-grey-text">{b.period}</Text>
                  <Text className="text-lg font-bold text-dark-text">{formatRupiah(b.amount)}</Text>
                  {b.paid_date && <Text className="text-xs text-grey-text">Dibayar {formatDate(b.paid_date)}</Text>}
                </View>
                <View className="items-end">
                  <Badge label={s.label} variant={s.variant} />
                  {b.status === "unpaid" && (
                    <TouchableOpacity onPress={() => setShowUpload(b.id)} className="mt-2">
                      <Text className="text-xs text-sewa font-bold">Upload Bukti</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Card>
          );
        })}
        {billings.length === 0 && <Card><Text className="text-sm text-grey-text text-center">Belum ada tagihan</Text></Card>}
      </ScrollView>

      {/* Upload proof modal */}
      <Modal visible={!!showUpload} onClose={() => { setShowUpload(null); setProofPhoto(null); }} title="Upload Bukti Bayar">
        <PhotoPicker label="Foto Bukti Transfer" value={proofPhoto} onChange={setProofPhoto} />
        <View className="mt-4"><Button title="Kirim Bukti" onPress={handleUploadProof} loading={actionLoading} disabled={!proofPhoto} /></View>
      </Modal>

      {/* Maintenance request modal */}
      <Modal visible={showMaintenance} onClose={() => setShowMaintenance(false)} title="Laporkan Kerusakan">
        <Input label="Judul" placeholder="contoh: AC bocor" value={mTitle} onChangeText={setMTitle} />
        <View className="mt-3"><Input label="Deskripsi" placeholder="Jelaskan kerusakannya..." value={mDesc} onChangeText={setMDesc} multiline numberOfLines={3} style={{ height: 80, textAlignVertical: "top", paddingTop: 12 }} /></View>
        <View className="mt-3"><PhotoPicker label="Foto (opsional)" value={mPhoto} onChange={setMPhoto} /></View>
        <View className="mt-4"><Button title="Kirim Laporan" onPress={handleMaintenanceRequest} loading={actionLoading} /></View>
      </Modal>
    </SafeAreaView>
  );
}
