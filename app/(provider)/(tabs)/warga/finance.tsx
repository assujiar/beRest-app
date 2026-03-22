import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
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
import {
  getTransactions,
  getFinancialSummary,
  addTransaction,
} from "@services/warga.service";
import { shareViaWhatsApp, generateReportMessage } from "@services/wa-share.service";
import { generateDeepLink } from "@services/deep-link.service";
import { exportFinancialReport } from "@services/export.service";
import { UpgradeModal } from "@components/shared/UpgradeModal";
import { useSubscription } from "@hooks/shared/useSubscription";
import { useUIStore } from "@stores/ui.store";
import { formatRupiah, formatDate } from "@utils/format";
import { GRADIENTS, RADIUS, TYPO, SPACING } from "@utils/theme";
import { COLORS } from "@utils/colors";
import type { OrgTransaction, TransactionType } from "@app-types/warga.types";
import Svg, { Path } from "react-native-svg";

export default function FinanceScreen() {
  const insets = useSafeAreaInsets();
  const { orgId, orgName } = useLocalSearchParams<{ orgId: string; orgName: string }>();
  const showToast = useUIStore((s) => s.showToast);
  const { tier, requireUpgrade, showUpgrade, setShowUpgrade, upgradeFeature } = useSubscription();
  const [transactions, setTransactions] = useState<OrgTransaction[]>([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [_loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [txType, setTxType] = useState<TransactionType>("expense");
  const [txDesc, setTxDesc] = useState("");
  const [txAmount, setTxAmount] = useState(0);
  const [txPhoto, setTxPhoto] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (orgId) loadData();
    }, [orgId])
  );

  async function loadData() {
    setLoading(true);
    try {
      const [txData, summaryData] = await Promise.all([
        getTransactions(orgId!),
        getFinancialSummary(orgId!),
      ]);
      setTransactions(txData);
      setSummary(summaryData);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTransaction() {
    if (!txDesc.trim() || txAmount <= 0) return;
    setAddLoading(true);
    try {
      await addTransaction(orgId!, {
        type: txType,
        category: null,
        description: txDesc.trim(),
        amount: txAmount,
        transaction_date: new Date().toISOString(),
        proof_photo: txPhoto,
        donor_name: null,
      });
      showToast("Transaksi dicatat!", "success");
      resetForm();
      setShowAdd(false);
      loadData();
    } catch {
      showToast("Gagal mencatat transaksi", "error");
    } finally {
      setAddLoading(false);
    }
  }

  function resetForm() {
    setTxDesc("");
    setTxAmount(0);
    setTxPhoto(null);
    setTxType("expense");
  }

  function handleShareReport() {
    const url = generateDeepLink("rt", orgId ?? "", "laporan");
    const message = generateReportMessage(orgName ?? "Organisasi", url);
    shareViaWhatsApp(message);
  }

  async function handleExportPDF() {
    if (requireUpgrade("canExportPDF", "Export PDF")) return;
    try {
      await exportFinancialReport(orgName ?? "Organisasi", transactions, summary);
      showToast("PDF berhasil dibuat!", "success");
    } catch {
      showToast("Gagal membuat PDF", "error");
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
              Keuangan
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.md }}>
            <TouchableOpacity
              onPress={handleExportPDF}
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: RADIUS.md,
                paddingHorizontal: SPACING.sm,
                paddingVertical: SPACING.xs,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.3)",
              }}
            >
              <Text style={{ ...TYPO.captionBold, color: "#FFFFFF" }}>PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShareReport}
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: RADIUS.md,
                paddingHorizontal: SPACING.sm,
                paddingVertical: SPACING.xs,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.3)",
              }}
            >
              <Text style={{ ...TYPO.captionBold, color: "#FFFFFF" }}>Bagikan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.md, paddingBottom: SPACING.xxl }}
      >
        {/* Summary cards */}
        <Card variant="glass">
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ ...TYPO.caption, color: COLORS.greyText }}>Pemasukan</Text>
              <Text style={{ ...TYPO.h3, color: COLORS.green, marginTop: SPACING.xs }}>
                {formatRupiah(summary.totalIncome)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ ...TYPO.caption, color: COLORS.greyText }}>Pengeluaran</Text>
              <Text style={{ ...TYPO.h3, color: COLORS.red, marginTop: SPACING.xs }}>
                {formatRupiah(summary.totalExpense)}
              </Text>
            </View>
          </View>
          <View
            style={{
              marginTop: SPACING.md,
              paddingTop: SPACING.md,
              borderTopWidth: 1,
              borderTopColor: COLORS.border,
            }}
          >
            <Text style={{ ...TYPO.caption, color: COLORS.greyText }}>Saldo</Text>
            <Text style={{ ...TYPO.money, color: COLORS.darkText, marginTop: SPACING.xs }}>
              {formatRupiah(summary.balance)}
            </Text>
          </View>
        </Card>

        {/* Add buttons */}
        <View style={{ flexDirection: "row", marginBottom: SPACING.md, gap: SPACING.sm }}>
          <View style={{ flex: 1 }}>
            <Button
              title="+ Pemasukan"
              variant="secondary"
              onPress={() => {
                setTxType("income");
                setShowAdd(true);
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              title="+ Pengeluaran"
              variant="secondary"
              onPress={() => {
                setTxType("expense");
                setShowAdd(true);
              }}
            />
          </View>
        </View>

        {/* Section header */}
        {transactions.length > 0 && (
          <Text
            style={{
              ...TYPO.small,
              color: "#94A3B8",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginBottom: SPACING.sm,
            }}
          >
            RIWAYAT TRANSAKSI
          </Text>
        )}

        {/* Transaction list */}
        {transactions.map((tx) => (
          <Card key={tx.id} variant="glass">
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: RADIUS.full,
                  backgroundColor: tx.type === "income" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: SPACING.md,
                }}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  {tx.type === "income" ? (
                    <Path d="M12 19V5M5 12L12 5L19 12" stroke={COLORS.green} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  ) : (
                    <Path d="M12 5V19M19 12L12 19L5 12" stroke={COLORS.red} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </Svg>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ ...TYPO.bodyBold, color: COLORS.darkText }}>
                  {tx.description}
                </Text>
                <Text style={{ ...TYPO.caption, color: COLORS.greyText }}>
                  {formatDate(tx.transaction_date)}
                </Text>
              </View>
              <Text
                style={{
                  ...TYPO.bodyBold,
                  color: tx.type === "income" ? COLORS.green : COLORS.red,
                }}
              >
                {tx.type === "income" ? "+" : "-"}
                {formatRupiah(tx.amount)}
              </Text>
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* Add transaction modal */}
      <Modal
        visible={showAdd}
        onClose={() => {
          setShowAdd(false);
          resetForm();
        }}
        title={txType === "income" ? "Tambah Pemasukan" : "Tambah Pengeluaran"}
      >
        <Input
          label="Keterangan"
          placeholder={
            txType === "income" ? "contoh: Iuran Maret" : "contoh: Beli tinta printer"
          }
          value={txDesc}
          onChangeText={setTxDesc}
        />
        <View style={{ marginTop: SPACING.md }}>
          <CurrencyInput
            label="Jumlah"
            value={txAmount}
            onChangeValue={setTxAmount}
          />
        </View>
        <View style={{ marginTop: SPACING.md }}>
          <PhotoPicker
            label="Bukti (opsional)"
            value={txPhoto}
            onChange={setTxPhoto}
          />
        </View>
        <View style={{ marginTop: SPACING.md }}>
          <Button
            title="Simpan"
            onPress={handleAddTransaction}
            loading={addLoading}
          />
        </View>
      </Modal>

      <UpgradeModal visible={showUpgrade} onClose={() => setShowUpgrade(false)} currentTier={tier} featureName={upgradeFeature} />
    </View>
  );
}
