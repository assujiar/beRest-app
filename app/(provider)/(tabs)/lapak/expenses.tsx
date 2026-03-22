import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Card } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Modal } from "@components/ui/Modal";
import { CurrencyInput } from "@components/shared/CurrencyInput";
import { PhotoPicker } from "@components/shared/PhotoPicker";
import { EmptyState } from "@components/shared/EmptyState";
import { UpgradeModal } from "@components/shared/UpgradeModal";
import { getExpensesToday, addExpense } from "@services/lapak.service";
import { scanNota } from "@services/gemini.service";
import { useSubscription } from "@hooks/shared/useSubscription";
import { useUIStore } from "@stores/ui.store";
import { formatRupiah } from "@utils/format";
import { GRADIENTS, GLASS, RADIUS, TYPO, SPACING } from "@utils/theme";
import Svg, { Path } from "react-native-svg";
import type { LapakExpense } from "@app-types/lapak.types";

function ArrowLeftIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CameraIcon({ size = 14, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 17a4 4 0 100-8 4 4 0 000 8z" stroke={color} strokeWidth={2} />
    </Svg>
  );
}

export default function ExpensesScreen() {
  const insets = useSafeAreaInsets();
  const { bizId } = useLocalSearchParams<{ bizId: string }>();
  const showToast = useUIStore((s) => s.showToast);
  const { tier, requireUpgrade, showUpgrade, setShowUpgrade, upgradeFeature } = useSubscription();
  const [expenses, setExpenses] = useState<LapakExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState(0);
  const [photo, setPhoto] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [showScanPicker, setShowScanPicker] = useState(false);
  const [scanPhoto, setScanPhoto] = useState<string | null>(null);
  const [showScanResult, setShowScanResult] = useState(false);
  const [scanItems, setScanItems] = useState<{ name: string; quantity: number; price: number; total: number }[]>([]);
  const [scanTotal, setScanTotal] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (bizId) loadData();
    }, [bizId])
  );

  async function loadData() {
    try {
      const data = await getExpensesToday(bizId!);
      setExpenses(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!desc.trim() || amount <= 0) return;
    setAddLoading(true);
    try {
      await addExpense(bizId!, {
        description: desc.trim(),
        amount,
        category: null,
        proof_photo: photo,
      });
      showToast("Pengeluaran dicatat!", "success");
      setDesc(""); setAmount(0); setPhoto(null);
      setShowAdd(false);
      loadData();
    } catch {
      showToast("Gagal mencatat", "error");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleScanNota(uri: string) {
    if (requireUpgrade("canUseAI", "AI Scan Nota")) return;
    setScanPhoto(uri);
    setScanLoading(true);
    try {
      const result = await scanNota(uri);
      if (result.items.length === 0) {
        showToast("Nota tidak terbaca, coba foto ulang", "error");
        setScanLoading(false);
        return;
      }
      setScanItems(result.items);
      setScanTotal(result.grandTotal);
      setShowScanResult(true);
    } catch {
      showToast("Gagal scan nota", "error");
    } finally {
      setScanLoading(false);
    }
  }

  async function handleSaveFromScan() {
    setAddLoading(true);
    try {
      for (const item of scanItems) {
        await addExpense(bizId!, {
          description: `${item.name} ×${item.quantity}`,
          amount: item.total,
          category: null,
          proof_photo: scanPhoto,
        });
      }
      showToast(`${scanItems.length} item dicatat dari nota!`, "success");
      setScanItems([]);
      setScanTotal(0);
      setScanPhoto(null);
      setShowScanResult(false);
      loadData();
    } catch {
      showToast("Gagal menyimpan", "error");
    } finally {
      setAddLoading(false);
    }
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

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
            <Text style={{ ...TYPO.h3, color: "#FFFFFF", marginLeft: SPACING.md }}>Pengeluaran</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
            <TouchableOpacity
              onPress={() => {
                if (requireUpgrade("canUseAI", "AI Scan Nota")) return;
                setShowScanPicker(true);
              }}
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: RADIUS.md,
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.sm,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.25)",
                flexDirection: "row",
                alignItems: "center",
                gap: SPACING.xs,
              }}
            >
              <CameraIcon size={14} color="#FFFFFF" />
              <Text style={{ ...TYPO.captionBold, color: "#FFFFFF" }}>Scan Nota</Text>
            </TouchableOpacity>
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
              <Text style={{ ...TYPO.captionBold, color: "#FFFFFF" }}>+ Catat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.md, paddingTop: SPACING.md }}
      >
        <Card variant="glass">
          <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8 }}>
            Total hari ini
          </Text>
          <Text style={{ ...TYPO.money, color: "#EF4444" }}>{formatRupiah(total)}</Text>
        </Card>

        {!loading && expenses.length === 0 ? (
          <EmptyState
            illustration="💸"
            title="Belum ada pengeluaran hari ini"
            actionLabel="+ Catat Pengeluaran"
            onAction={() => setShowAdd(true)}
          />
        ) : (
          expenses.map((e) => (
            <Card key={e.id} variant="glass">
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>{e.description}</Text>
                </View>
                <Text style={{ ...TYPO.money, color: "#EF4444" }}>-{formatRupiah(e.amount)}</Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <Modal visible={showAdd} onClose={() => setShowAdd(false)} title="Catat Pengeluaran">
        <Input label="Keterangan" placeholder="contoh: Beli minyak goreng" value={desc} onChangeText={setDesc} />
        <View style={{ marginTop: SPACING.md }}>
          <CurrencyInput label="Jumlah" value={amount} onChangeValue={setAmount} />
        </View>
        <View style={{ marginTop: SPACING.md }}>
          <PhotoPicker label="Bukti (opsional)" value={photo} onChange={setPhoto} />
        </View>
        <View style={{ marginTop: SPACING.lg }}>
          <Button title="Simpan" onPress={handleAdd} loading={addLoading} />
        </View>
      </Modal>

      {/* Scan Nota: photo picker modal */}
      <Modal visible={showScanPicker} onClose={() => setShowScanPicker(false)} title="Scan Nota / Struk">
        <Text style={{ ...TYPO.body, color: "#64748B", marginBottom: SPACING.md }}>
          Foto nota belanja, AI akan baca dan catat otomatis.
        </Text>
        {scanLoading ? (
          <View style={{ alignItems: "center", paddingVertical: SPACING.xxl }}>
            <ActivityIndicator size="large" color="#50BFC3" />
            <Text style={{ ...TYPO.bodyBold, color: "#1E293B", marginTop: SPACING.md }}>
              AI sedang membaca nota...
            </Text>
            <Text style={{ ...TYPO.caption, color: "#64748B", marginTop: SPACING.xs }}>
              Tunggu sebentar
            </Text>
          </View>
        ) : (
          <PhotoPicker label="Foto Nota" value={scanPhoto} onChange={(uri) => { if (uri) handleScanNota(uri); }} />
        )}
      </Modal>

      {/* Scan result */}
      <Modal visible={showScanResult} onClose={() => setShowScanResult(false)} title="Hasil Scan Nota">
        <Text style={{ ...TYPO.caption, color: "#64748B", marginBottom: SPACING.md }}>
          AI menemukan {scanItems.length} item dari nota:
        </Text>
        {scanItems.map((item, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: SPACING.sm,
              borderBottomWidth: 1,
              borderBottomColor: GLASS.card.border,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ ...TYPO.body, color: "#1E293B" }}>{item.name}</Text>
              <Text style={{ ...TYPO.caption, color: "#64748B" }}>{"\u00D7"}{item.quantity}</Text>
            </View>
            <Text style={{ ...TYPO.bodyBold, color: "#EF4444" }}>{formatRupiah(item.total)}</Text>
          </View>
        ))}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: SPACING.md,
            marginTop: SPACING.xs,
          }}
        >
          <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>Total</Text>
          <Text style={{ ...TYPO.money, color: "#EF4444" }}>{formatRupiah(scanTotal)}</Text>
        </View>
        <View style={{ marginTop: SPACING.md }}>
          <Button title={`Simpan ${scanItems.length} Item`} onPress={handleSaveFromScan} loading={addLoading} />
        </View>
      </Modal>

      <UpgradeModal visible={showUpgrade} onClose={() => setShowUpgrade(false)} currentTier={tier} featureName={upgradeFeature} />
    </View>
  );
}
