import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
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
import type { Contract, ContractStatus } from "@app-types/sewa.types";

const STATUS_MAP: Record<ContractStatus, { label: string; variant: "info" | "success" | "warning" | "error" }> = {
  draft: { label: "Draft", variant: "warning" }, active: { label: "Aktif", variant: "success" },
  expired: { label: "Berakhir", variant: "error" }, terminated: { label: "Dibatalkan", variant: "error" },
};

export default function ContractsScreen() {
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
        content_json: JSON.stringify({ text: generatedText }),
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
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border-color bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}><Text className="text-lg text-navy">←</Text></TouchableOpacity>
          <Text className="text-lg font-bold text-dark-text ml-3">Kontrak</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity onPress={handleOpenGenerate} className="bg-navy rounded-lg px-3 py-2">
            <Text className="text-white text-xs font-bold">🤖 AI Buat</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowCreate(true)} className="bg-sewa rounded-lg px-3 py-2">
            <Text className="text-white text-xs font-bold">+ Buat</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView className="flex-1 px-4 pt-3">
        {!loading && contracts.length === 0 ? (
          <EmptyState illustration="📄" title="Belum ada kontrak" actionLabel="+ Buat Kontrak" onAction={() => setShowCreate(true)} />
        ) : (
          contracts.map((c) => {
            const s = STATUS_MAP[c.status];
            return (
              <Card key={c.id}>
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-base font-bold text-dark-text flex-1" numberOfLines={1}>{c.title}</Text>
                  <Badge label={s.label} variant={s.variant} />
                </View>
                {c.start_date && <Text className="text-xs text-grey-text">Mulai: {formatDate(c.start_date)}</Text>}
                {c.status === "draft" && (
                  <TouchableOpacity onPress={() => handleActivate(c.id)} className="bg-sewa/10 rounded-lg px-3 py-1.5 mt-2 self-start">
                    <Text className="text-xs font-bold text-sewa">Aktifkan</Text>
                  </TouchableOpacity>
                )}
              </Card>
            );
          })
        )}
      </ScrollView>
      <Modal visible={showCreate} onClose={() => setShowCreate(false)} title="Buat Kontrak">
        <Input label="Judul Kontrak" placeholder="contoh: Kontrak Sewa Kamar 1A" value={title} onChangeText={setTitle} />
        <View className="mt-4"><Button title="Buat" onPress={handleCreate} loading={createLoading} /></View>
      </Modal>

      {/* AI Generate Contract */}
      <Modal visible={showGenerate} onClose={() => setShowGenerate(false)} title="AI Buat Kontrak">
        <Text className="text-xs text-grey-text mb-3">
          Isi data, AI akan buatkan surat perjanjian sewa otomatis.
        </Text>
        <Input label="Nama Properti" placeholder="contoh: Kos Bu Ani" value={propName} onChangeText={setPropName} />
        <View className="mt-3"><Input label="Nama Unit (opsional)" placeholder="contoh: Kamar 1A" value={unitName} onChangeText={setUnitName} /></View>
        <View className="mt-3"><Input label="Nama Penyewa" placeholder="contoh: Budi Santoso" value={tenantName} onChangeText={setTenantName} /></View>
        <View className="mt-3"><CurrencyInput label="Harga Sewa / Bulan" value={monthlyRent} onChangeValue={setMonthlyRent} /></View>
        <View className="mt-3"><Input label="Durasi" placeholder="contoh: 12 bulan" value={duration} onChangeText={setDuration} /></View>
        <View className="mt-3"><CurrencyInput label="Deposit" value={deposit} onChangeValue={setDeposit} /></View>
        <View className="mt-4">
          {generateLoading ? (
            <View className="items-center py-4">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="text-sm text-grey-text mt-2">AI sedang buat kontrak...</Text>
            </View>
          ) : (
            <Button title="🤖 Generate Kontrak" onPress={handleGenerate} />
          )}
        </View>
      </Modal>

      {/* Contract Preview */}
      <Modal visible={showPreview} onClose={() => setShowPreview(false)} title="Preview Kontrak">
        <ScrollView className="max-h-80">
          <Text className="text-sm text-dark-text leading-6">{generatedText}</Text>
        </ScrollView>
        <View className="mt-4 flex-row gap-2">
          <View className="flex-1">
            <Button title="Buat Ulang" variant="secondary" onPress={() => { setShowPreview(false); setShowGenerate(true); }} />
          </View>
          <View className="flex-1">
            <Button title="Simpan" onPress={handleSaveGenerated} loading={createLoading} />
          </View>
        </View>
      </Modal>

      <UpgradeModal visible={showUpgrade} onClose={() => setShowUpgrade(false)} currentTier={tier} featureName={upgradeFeature} />
    </SafeAreaView>
  );
}
