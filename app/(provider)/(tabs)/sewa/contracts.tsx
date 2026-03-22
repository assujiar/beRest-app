import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
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
import { UpgradeModal } from "@components/shared/UpgradeModal";
import { getContracts, createContract, updateContractStatus } from "@services/sewa.service";
import { generateContractText } from "@services/gemini.service";
import { useSubscription } from "@hooks/shared/useSubscription";
import { useAuthStore } from "@stores/auth.store";
import { useUIStore } from "@stores/ui.store";
import { formatDate } from "@utils/format";
import { GRADIENTS, RADIUS, TYPO, SPACING } from "@utils/theme";
import type { Contract, ContractStatus } from "@app-types/sewa.types";

const STATUS_MAP: Record<ContractStatus, { label: string; variant: "info" | "success" | "warning" | "error" }> = {
  draft: { label: "Draft", variant: "warning" }, active: { label: "Aktif", variant: "success" },
  expired: { label: "Berakhir", variant: "error" }, terminated: { label: "Dibatalkan", variant: "error" },
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

function AIIcon({ size = 14, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function ContractsScreen() {
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((s) => s.profile);
  const showToast = useUIStore((s) => s.showToast);
  const { tier, requireUpgrade, showUpgrade, setShowUpgrade, upgradeFeature } = useSubscription();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [propName, setPropName] = useState("");
  const [unitName, setUnitName] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [monthlyRent, setMonthlyRent] = useState(0);
  const [duration, setDuration] = useState("12 bulan");
  const [deposit, setDeposit] = useState(0);
  const [createLoading, setCreateLoading] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => { if (profile?.id) loadData(); }, [profile?.id]);

  async function loadData() {
    try { setContracts(await getContracts(profile!.id)); } catch { /* silent */ } finally { setLoading(false); }
  }

  async function handleCreate() {
    if (!title.trim() || !profile?.id) return;
    setCreateLoading(true);
    try {
      await createContract(profile.id, { unit_id: null, contact_id: null, consumer_id: null, type: "sewa", title: title.trim(), content_json: null, start_date: new Date().toISOString(), end_date: null });
      showToast("Kontrak dibuat!", "success"); setTitle(""); setShowCreate(false); loadData();
    } catch { showToast("Gagal membuat kontrak", "error"); } finally { setCreateLoading(false); }
  }

  async function handleActivate(id: string) {
    try { await updateContractStatus(id, "active"); showToast("Kontrak diaktifkan", "success"); loadData(); }
    catch { showToast("Gagal", "error"); }
  }

  function handleOpenGenerate() {
    if (requireUpgrade("canUseAI", "AI Buat Kontrak")) return;
    setShowGenerate(true);
  }

  async function handleGenerate() {
    if (!propName.trim() || !tenantName.trim() || monthlyRent <= 0) {
      showToast("Lengkapi data properti, penyewa, dan harga sewa", "error");
      return;
    }
    setGenerateLoading(true);
    try {
      const text = await generateContractText({
        propertyName: propName.trim(),
        unitName: unitName.trim() || "-",
        tenantName: tenantName.trim(),
        monthlyRent,
        startDate: new Date().toLocaleDateString("id-ID"),
        duration,
        deposit,
      });
      setGeneratedText(text);
      setShowGenerate(false);
      setShowPreview(true);
    } catch {
      showToast("Gagal generate kontrak", "error");
    } finally {
      setGenerateLoading(false);
    }
  }

  async function handleSaveGenerated() {
    if (!profile?.id) return;
    setCreateLoading(true);
    try {
      await createContract(profile.id, {
        unit_id: null, contact_id: null, consumer_id: null, type: "sewa",
        title: `Kontrak ${tenantName.trim()} - ${propName.trim()}`,
        content_json: { text: generatedText },
        start_date: new Date().toISOString(), end_date: null,
      });
      showToast("Kontrak disimpan!", "success");
      setGeneratedText("");
      setShowPreview(false);
      setPropName(""); setUnitName(""); setTenantName(""); setMonthlyRent(0); setDeposit(0);
      loadData();
    } catch {
      showToast("Gagal menyimpan", "error");
    } finally {
      setCreateLoading(false);
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
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <BackIcon />
            </TouchableOpacity>
            <Text style={{ ...TYPO.h3, color: "#FFFFFF", marginLeft: SPACING.md }}>Kontrak</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
            <TouchableOpacity
              onPress={handleOpenGenerate}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.3)",
                borderRadius: RADIUS.md,
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.sm,
                gap: SPACING.xs,
              }}
            >
              <AIIcon size={14} color="#FFFFFF" />
              <Text style={{ ...TYPO.captionBold, color: "#FFFFFF" }}>AI Buat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowCreate(true)}
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
              <Text style={{ ...TYPO.captionBold, color: "#FFFFFF" }}>Buat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.lg, paddingTop: SPACING.md }}
      >
        {!loading && contracts.length === 0 ? (
          <EmptyState illustration="📄" title="Belum ada kontrak" actionLabel="+ Buat Kontrak" onAction={() => setShowCreate(true)} />
        ) : (
          contracts.map((c) => {
            const s = STATUS_MAP[c.status];
            return (
              <Card key={c.id} variant="glass">
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACING.xs }}>
                  <Text style={{ ...TYPO.bodyBold, color: "#1E293B", flex: 1 }} numberOfLines={1}>{c.title}</Text>
                  <Badge label={s.label} variant={s.variant} />
                </View>
                {c.start_date && <Text style={{ ...TYPO.caption, color: "#64748B" }}>Mulai: {formatDate(c.start_date)}</Text>}
                {c.status === "draft" && (
                  <TouchableOpacity
                    onPress={() => handleActivate(c.id)}
                    style={{
                      backgroundColor: "rgba(0,196,154,0.1)",
                      borderRadius: RADIUS.md,
                      paddingHorizontal: SPACING.md,
                      paddingVertical: SPACING.sm,
                      marginTop: SPACING.sm,
                      alignSelf: "flex-start",
                    }}
                  >
                    <Text style={{ ...TYPO.captionBold, color: "#00C49A" }}>Aktifkan</Text>
                  </TouchableOpacity>
                )}
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Create Contract Modal */}
      <Modal visible={showCreate} onClose={() => setShowCreate(false)} title="Buat Kontrak">
        <Input label="Judul Kontrak" placeholder="contoh: Kontrak Sewa Kamar 1A" value={title} onChangeText={setTitle} />
        <View style={{ marginTop: SPACING.lg }}>
          <Button title="Buat" onPress={handleCreate} loading={createLoading} />
        </View>
      </Modal>

      {/* AI Generate Contract Modal */}
      <Modal visible={showGenerate} onClose={() => setShowGenerate(false)} title="AI Buat Kontrak">
        <Text style={{ ...TYPO.caption, color: "#64748B", marginBottom: SPACING.md }}>
          Isi data, AI akan buatkan surat perjanjian sewa otomatis.
        </Text>
        <Input label="Nama Properti" placeholder="contoh: Kos Bu Ani" value={propName} onChangeText={setPropName} />
        <View style={{ marginTop: SPACING.md }}>
          <Input label="Nama Unit (opsional)" placeholder="contoh: Kamar 1A" value={unitName} onChangeText={setUnitName} />
        </View>
        <View style={{ marginTop: SPACING.md }}>
          <Input label="Nama Penyewa" placeholder="contoh: Budi Santoso" value={tenantName} onChangeText={setTenantName} />
        </View>
        <View style={{ marginTop: SPACING.md }}>
          <CurrencyInput label="Harga Sewa / Bulan" value={monthlyRent} onChangeValue={setMonthlyRent} />
        </View>
        <View style={{ marginTop: SPACING.md }}>
          <Input label="Durasi" placeholder="contoh: 12 bulan" value={duration} onChangeText={setDuration} />
        </View>
        <View style={{ marginTop: SPACING.md }}>
          <CurrencyInput label="Deposit" value={deposit} onChangeValue={setDeposit} />
        </View>
        <View style={{ marginTop: SPACING.lg }}>
          {generateLoading ? (
            <View style={{ alignItems: "center", paddingVertical: SPACING.lg }}>
              <ActivityIndicator size="large" color="#00C49A" />
              <Text style={{ ...TYPO.body, color: "#64748B", marginTop: SPACING.sm }}>AI sedang buat kontrak...</Text>
            </View>
          ) : (
            <Button title="Generate Kontrak" onPress={handleGenerate} />
          )}
        </View>
      </Modal>

      {/* Contract Preview Modal */}
      <Modal visible={showPreview} onClose={() => setShowPreview(false)} title="Preview Kontrak">
        <ScrollView style={{ maxHeight: 320 }}>
          <Text style={{ ...TYPO.body, color: "#1E293B", lineHeight: 24 }}>{generatedText}</Text>
        </ScrollView>
        <View style={{ marginTop: SPACING.lg, flexDirection: "row", gap: SPACING.sm }}>
          <View style={{ flex: 1 }}>
            <Button title="Buat Ulang" variant="secondary" onPress={() => { setShowPreview(false); setShowGenerate(true); }} />
          </View>
          <View style={{ flex: 1 }}>
            <Button title="Simpan" onPress={handleSaveGenerated} loading={createLoading} />
          </View>
        </View>
      </Modal>

      <UpgradeModal visible={showUpgrade} onClose={() => setShowUpgrade(false)} currentTier={tier} featureName={upgradeFeature} />
    </View>
  );
}
