import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Modal } from "@components/ui/Modal";
import { CurrencyInput } from "@components/shared/CurrencyInput";
import { EmptyState } from "@components/shared/EmptyState";
import {
  getFundraisings,
  createFundraising,
  addDonation,
} from "@services/warga.service";
import { useUIStore } from "@stores/ui.store";
import { formatRupiah } from "@utils/format";
import { GRADIENTS, RADIUS, TYPO, SPACING } from "@utils/theme";
import { COLORS } from "@utils/colors";
import type { Fundraising, FundraisingStatus } from "@app-types/warga.types";
import Svg, { Path } from "react-native-svg";

const STATUS_MAP: Record<FundraisingStatus, { label: string; variant: "success" | "info" | "neutral" }> = {
  active: { label: "Berjalan", variant: "info" },
  completed: { label: "Tercapai", variant: "success" },
  cancelled: { label: "Dibatalkan", variant: "neutral" },
};

export default function FundraisingScreen() {
  const insets = useSafeAreaInsets();
  const { orgId } = useLocalSearchParams<{ orgId: string }>();
  const showToast = useUIStore((s) => s.showToast);
  const [items, setItems] = useState<Fundraising[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showDonate, setShowDonate] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newTarget, setNewTarget] = useState(0);
  const [donorName, setDonorName] = useState("");
  const [donateAmount, setDonateAmount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (orgId) loadData();
    }, [orgId])
  );

  async function loadData() {
    setLoading(true);
    try {
      const data = await getFundraisings(orgId!);
      setItems(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newTitle.trim() || newTarget <= 0) return;
    setActionLoading(true);
    try {
      await createFundraising(orgId!, {
        title: newTitle.trim(),
        description: null,
        target_amount: newTarget,
        deadline: null,
      });
      showToast("Penggalangan dana dibuat!", "success");
      setNewTitle("");
      setNewTarget(0);
      setShowCreate(false);
      loadData();
    } catch {
      showToast("Gagal membuat penggalangan", "error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDonate() {
    if (donateAmount <= 0 || !showDonate) return;
    setActionLoading(true);
    try {
      await addDonation(
        showDonate,
        donateAmount,
        donorName.trim() || "Hamba Allah",
        orgId!
      );
      showToast("Donasi dicatat!", "success");
      setDonorName("");
      setDonateAmount(0);
      setShowDonate(null);
      loadData();
    } catch {
      showToast("Gagal mencatat donasi", "error");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.lightBg }}>
      {/* Gradient Header */}
      <LinearGradient
        colors={GRADIENTS.warga}
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
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={12}
              style={{
                width: 36,
                height: 36,
                borderRadius: RADIUS.full,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M15 18L9 12L15 6" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            <Text style={{ ...TYPO.h3, color: "#FFFFFF", marginLeft: SPACING.md }}>
              Penggalangan Dana
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowCreate(true)}
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: RADIUS.md,
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.3)",
            }}
          >
            <Text style={{ ...TYPO.captionBold, color: "#FFFFFF" }}>+ Buat</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.md, paddingBottom: SPACING.xxl }}
      >
        {!loading && items.length === 0 ? (
          <EmptyState
            illustration="🎯"
            title="Belum ada penggalangan"
            description="Buat target pengumpulan dana"
            actionLabel="+ Buat Penggalangan"
            onAction={() => setShowCreate(true)}
          />
        ) : (
          items.map((fund) => {
            const progress =
              fund.target_amount > 0
                ? Math.min(100, (fund.collected_amount / fund.target_amount) * 100)
                : 0;
            const s = STATUS_MAP[fund.status];

            return (
              <Card key={fund.id} variant="glass">
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACING.sm }}>
                  <Text style={{ ...TYPO.bodyBold, color: COLORS.darkText, flex: 1 }}>
                    {fund.title}
                  </Text>
                  <Badge label={s.label} variant={s.variant} />
                </View>

                {/* Progress bar */}
                <View
                  style={{
                    height: 8,
                    backgroundColor: COLORS.border,
                    borderRadius: RADIUS.full,
                    overflow: "hidden",
                    marginBottom: SPACING.sm,
                  }}
                >
                  <View
                    style={{
                      height: "100%",
                      backgroundColor: COLORS.warga,
                      borderRadius: RADIUS.full,
                      width: `${progress}%`,
                    }}
                  />
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: SPACING.md }}>
                  <Text style={{ ...TYPO.captionBold, color: COLORS.warga }}>
                    {formatRupiah(fund.collected_amount)}
                  </Text>
                  <Text style={{ ...TYPO.caption, color: COLORS.greyText }}>
                    dari {formatRupiah(fund.target_amount)}
                  </Text>
                </View>

                {fund.status === "active" && (
                  <Button
                    title="+ Catat Donasi"
                    variant="secondary"
                    onPress={() => setShowDonate(fund.id)}
                  />
                )}
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Create modal */}
      <Modal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        title="Buat Penggalangan Dana"
      >
        <Input
          label="Judul"
          placeholder="contoh: Renovasi Mesjid"
          value={newTitle}
          onChangeText={setNewTitle}
        />
        <View style={{ marginTop: SPACING.md }}>
          <CurrencyInput
            label="Target Dana"
            value={newTarget}
            onChangeValue={setNewTarget}
          />
        </View>
        <View style={{ marginTop: SPACING.md }}>
          <Button title="Buat" onPress={handleCreate} loading={actionLoading} />
        </View>
      </Modal>

      {/* Donate modal */}
      <Modal
        visible={!!showDonate}
        onClose={() => setShowDonate(null)}
        title="Catat Donasi"
      >
        <Input
          label="Nama Donatur"
          placeholder="kosongkan untuk 'Hamba Allah'"
          value={donorName}
          onChangeText={setDonorName}
        />
        <View style={{ marginTop: SPACING.md }}>
          <CurrencyInput
            label="Jumlah"
            value={donateAmount}
            onChangeValue={setDonateAmount}
          />
        </View>
        <View style={{ marginTop: SPACING.md }}>
          <Button title="Simpan" onPress={handleDonate} loading={actionLoading} />
        </View>
      </Modal>
    </View>
  );
}
