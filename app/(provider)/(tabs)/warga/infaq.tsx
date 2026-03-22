import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Card } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Modal } from "@components/ui/Modal";
import { CurrencyInput } from "@components/shared/CurrencyInput";
import { EmptyState } from "@components/shared/EmptyState";
import { getTransactions, addTransaction } from "@services/warga.service";
import { useUIStore } from "@stores/ui.store";
import { formatRupiah, formatDate } from "@utils/format";
import { GRADIENTS, RADIUS, TYPO, SPACING } from "@utils/theme";
import { COLORS } from "@utils/colors";
import type { OrgTransaction } from "@app-types/warga.types";
import Svg, { Path } from "react-native-svg";

export default function InfaqScreen() {
  const insets = useSafeAreaInsets();
  const { orgId } = useLocalSearchParams<{ orgId: string }>();
  const showToast = useUIStore((s) => s.showToast);
  const [donations, setDonations] = useState<OrgTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [amount, setAmount] = useState(0);
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    if (orgId) loadData();
  }, [orgId]);

  async function loadData() {
    setLoading(true);
    try {
      const all = await getTransactions(orgId!);
      setDonations(all.filter((t) => t.category === "infaq"));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (amount <= 0) return;
    setAddLoading(true);
    try {
      await addTransaction(orgId!, {
        type: "income",
        category: "infaq",
        description: `Infaq: ${donorName.trim() || "Hamba Allah"}`,
        amount,
        transaction_date: new Date().toISOString(),
        proof_photo: null,
        donor_name: donorName.trim() || "Hamba Allah",
      });
      showToast("Infaq dicatat!", "success");
      setDonorName("");
      setAmount(0);
      setShowAdd(false);
      loadData();
    } catch {
      showToast("Gagal mencatat infaq", "error");
    } finally {
      setAddLoading(false);
    }
  }

  const total = donations.reduce((sum, d) => sum + d.amount, 0);

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
              Infaq / Donasi
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowAdd(true)}
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: RADIUS.md,
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.3)",
            }}
          >
            <Text style={{ ...TYPO.captionBold, color: "#FFFFFF" }}>+ Catat</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.md, paddingBottom: SPACING.xxl }}
      >
        <Card variant="glass">
          <Text style={{ ...TYPO.caption, color: COLORS.greyText }}>Total Infaq</Text>
          <Text style={{ ...TYPO.money, color: COLORS.warga, marginTop: SPACING.xs }}>
            {formatRupiah(total)}
          </Text>
          <Text style={{ ...TYPO.caption, color: COLORS.greyText, marginTop: SPACING.xs }}>
            {donations.length} donatur
          </Text>
        </Card>

        {!loading && donations.length === 0 ? (
          <EmptyState
            illustration="🤲"
            title="Belum ada infaq"
            description="Catat infaq dan donasi yang masuk"
            actionLabel="+ Catat Infaq"
            onAction={() => setShowAdd(true)}
          />
        ) : (
          <>
            <Text
              style={{
                ...TYPO.small,
                color: "#94A3B8",
                textTransform: "uppercase",
                letterSpacing: 0.8,
                marginBottom: SPACING.sm,
              }}
            >
              RIWAYAT INFAQ
            </Text>
            {donations.map((d) => (
              <Card key={d.id} variant="glass">
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: RADIUS.full,
                      backgroundColor: "rgba(251,143,103,0.12)",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: SPACING.md,
                    }}
                  >
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                      <Path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" stroke={COLORS.warga} strokeWidth={2} strokeLinejoin="round" />
                    </Svg>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...TYPO.bodyBold, color: COLORS.darkText }}>
                      {d.donor_name ?? "Hamba Allah"}
                    </Text>
                    <Text style={{ ...TYPO.caption, color: COLORS.greyText }}>
                      {formatDate(d.transaction_date)}
                    </Text>
                  </View>
                  <Text style={{ ...TYPO.bodyBold, color: COLORS.warga }}>
                    +{formatRupiah(d.amount)}
                  </Text>
                </View>
              </Card>
            ))}
          </>
        )}
      </ScrollView>

      <Modal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        title="Catat Infaq"
      >
        <Input
          label="Nama Donatur"
          placeholder="kosongkan untuk 'Hamba Allah'"
          value={donorName}
          onChangeText={setDonorName}
        />
        <View style={{ marginTop: SPACING.md }}>
          <CurrencyInput label="Jumlah" value={amount} onChangeValue={setAmount} />
        </View>
        <View style={{ marginTop: SPACING.md }}>
          <Button title="Simpan" onPress={handleAdd} loading={addLoading} />
        </View>
      </Modal>
    </View>
  );
}
