import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
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
import { GRADIENTS, GLASS, RADIUS, TYPO, SPACING } from "@utils/theme";
import type { RentBilling, RentPaymentStatus, PropertyUnit } from "@app-types/sewa.types";

const MODULE_COLOR = "#00C49A";

const STATUS_MAP: Record<RentPaymentStatus, { label: string; variant: "success" | "error" | "warning" | "neutral" }> = {
  paid: { label: "Lunas", variant: "success" }, unpaid: { label: "Belum Bayar", variant: "error" },
  partial: { label: "Sebagian", variant: "warning" }, overdue: { label: "Terlambat", variant: "error" },
};

function BackIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 19L8 12L15 5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function WrenchIcon({ size = 16, color = "#00C49A" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M14.7 6.3C14.5168 6.48694 14.4142 6.73825 14.4142 7C14.4142 7.26175 14.5168 7.51306 14.7 7.7L16.3 9.3C16.4869 9.48321 16.7383 9.5858 17 9.5858C17.2617 9.5858 17.5131 9.48321 17.7 9.3L21.47 5.53C21.9728 6.6412 22.1251 7.87924 21.9065 9.07916C21.688 10.2791 21.1087 11.3838 20.2462 12.2462C19.3838 13.1087 18.2791 13.688 17.0792 13.9065C15.8792 14.1251 14.6412 13.9728 13.53 13.47L6.62 20.38C6.22218 20.7778 5.68261 21.0013 5.12 21.0013C4.55739 21.0013 4.01783 20.7778 3.62 20.38C3.22218 19.9822 2.99868 19.4426 2.99868 18.88C2.99868 18.3174 3.22218 17.7778 3.62 17.38L10.53 10.47C10.0272 9.35882 9.87493 8.12076 10.0935 6.92084C10.312 5.72092 10.8913 4.61623 11.7538 3.75378C12.6162 2.89134 13.7209 2.31199 14.9208 2.09346C16.1208 1.87493 17.3588 2.02722 18.47 2.53L14.71 6.29L14.7 6.3Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function HomeIcon({ size = 20, color = "#00C49A" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 22V12H15V22" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function ConsumerSewaScreen() {
  const insets = useSafeAreaInsets();
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
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Gradient Header */}
      <LinearGradient
        colors={GRADIENTS.sewa}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + SPACING.sm, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.md }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.md }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <BackIcon size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ ...TYPO.h3, color: "#FFFFFF" }}>{unit?.unit_name ?? "Unit Sewa"}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={{ flex: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.md }}>
        {unit && (
          <Card variant="elevated">
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{
                width: 48,
                height: 48,
                borderRadius: RADIUS.full,
                backgroundColor: "rgba(0,196,154,0.1)",
                alignItems: "center",
                justifyContent: "center",
                marginRight: SPACING.md,
              }}>
                <HomeIcon size={24} color={MODULE_COLOR} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8 }}>Sewa per Bulan</Text>
                <Text style={{ ...TYPO.money, color: "#1E293B" }}>{formatRupiah(unit.monthly_rent)}</Text>
              </View>
            </View>
          </Card>
        )}

        <TouchableOpacity
          onPress={() => setShowMaintenance(true)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: SPACING.sm,
            backgroundColor: GLASS.card.background,
            borderWidth: 1,
            borderColor: GLASS.card.border,
            borderRadius: RADIUS.xl,
            paddingVertical: SPACING.md,
            marginBottom: SPACING.md,
            ...GLASS.shadow.sm,
          }}
        >
          <WrenchIcon size={16} color={MODULE_COLOR} />
          <Text style={{ ...TYPO.bodyBold, color: MODULE_COLOR }}>Laporkan Kerusakan</Text>
        </TouchableOpacity>

        <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, marginTop: SPACING.md, marginBottom: SPACING.sm }}>TAGIHAN</Text>
        {billings.map((b) => {
          const s = STATUS_MAP[b.status];
          return (
            <Card key={b.id} variant="glass">
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ ...TYPO.caption, color: "#64748B" }}>{b.period}</Text>
                  <Text style={{ ...TYPO.h3, color: "#1E293B", marginTop: 2 }}>{formatRupiah(b.amount)}</Text>
                  {b.paid_date && <Text style={{ ...TYPO.caption, color: "#64748B", marginTop: 2 }}>Dibayar {formatDate(b.paid_date)}</Text>}
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Badge label={s.label} variant={s.variant} />
                  {b.status === "unpaid" && (
                    <TouchableOpacity onPress={() => setShowUpload(b.id)} style={{ marginTop: SPACING.sm }}>
                      <Text style={{ ...TYPO.captionBold, color: MODULE_COLOR }}>Upload Bukti</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Card>
          );
        })}
        {billings.length === 0 && (
          <Card variant="glass">
            <Text style={{ ...TYPO.body, color: "#64748B", textAlign: "center" }}>Belum ada tagihan</Text>
          </Card>
        )}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      {/* Upload proof modal */}
      <Modal visible={!!showUpload} onClose={() => { setShowUpload(null); setProofPhoto(null); }} title="Upload Bukti Bayar">
        <PhotoPicker label="Foto Bukti Transfer" value={proofPhoto} onChange={setProofPhoto} />
        <View style={{ marginTop: SPACING.lg }}>
          <Button title="Kirim Bukti" onPress={handleUploadProof} loading={actionLoading} disabled={!proofPhoto} />
        </View>
      </Modal>

      {/* Maintenance request modal */}
      <Modal visible={showMaintenance} onClose={() => setShowMaintenance(false)} title="Laporkan Kerusakan">
        <Input label="Judul" placeholder="contoh: AC bocor" value={mTitle} onChangeText={setMTitle} />
        <View style={{ marginTop: SPACING.md }}>
          <Input label="Deskripsi" placeholder="Jelaskan kerusakannya..." value={mDesc} onChangeText={setMDesc} multiline numberOfLines={3} style={{ height: 80, textAlignVertical: "top", paddingTop: 12 }} />
        </View>
        <View style={{ marginTop: SPACING.md }}>
          <PhotoPicker label="Foto (opsional)" value={mPhoto} onChange={setMPhoto} />
        </View>
        <View style={{ marginTop: SPACING.lg }}>
          <Button title="Kirim Laporan" onPress={handleMaintenanceRequest} loading={actionLoading} />
        </View>
      </Modal>
    </View>
  );
}
