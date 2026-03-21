import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
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
import type { OrgTransaction, TransactionType } from "@app-types/warga.types";

export default function FinanceScreen() {
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

  useEffect(() => {
    if (orgId) loadData();
  }, [orgId]);

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
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border-color bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Text className="text-lg text-navy">←</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-dark-text ml-3">
            Keuangan
          </Text>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={handleExportPDF} className="mr-4">
            <Text className="text-sm text-dark-text font-bold">PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShareReport}>
            <Text className="text-sm text-warga font-bold">Bagikan</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-3">
        {/* Summary cards */}
        <Card>
          <View className="flex-row">
            <View className="flex-1">
              <Text className="text-xs text-grey-text">Pemasukan</Text>
              <Text className="text-lg font-bold text-green-600">
                {formatRupiah(summary.totalIncome)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-grey-text">Pengeluaran</Text>
              <Text className="text-lg font-bold text-red-500">
                {formatRupiah(summary.totalExpense)}
              </Text>
            </View>
          </View>
          <View className="mt-3 pt-3 border-t border-border-color">
            <Text className="text-xs text-grey-text">Saldo</Text>
            <Text className="text-2xl font-bold text-dark-text">
              {formatRupiah(summary.balance)}
            </Text>
          </View>
        </Card>

        {/* Add button */}
        <View className="flex-row mb-3">
          <View className="flex-1 mr-2">
            <Button
              title="+ Pemasukan"
              variant="secondary"
              onPress={() => {
                setTxType("income");
                setShowAdd(true);
              }}
            />
          </View>
          <View className="flex-1 ml-2">
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

        {/* Transaction list */}
        {transactions.map((tx) => (
          <Card key={tx.id}>
            <View className="flex-row items-center">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                  tx.type === "income" ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <Text className="text-sm">
                  {tx.type === "income" ? "↓" : "↑"}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-dark-text">
                  {tx.description}
                </Text>
                <Text className="text-xs text-grey-text">
                  {formatDate(tx.transaction_date)}
                </Text>
              </View>
              <Text
                className={`text-base font-bold ${
                  tx.type === "income" ? "text-green-600" : "text-red-500"
                }`}
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
        <View className="mt-3">
          <CurrencyInput
            label="Jumlah"
            value={txAmount}
            onChangeValue={setTxAmount}
          />
        </View>
        <View className="mt-3">
          <PhotoPicker
            label="Bukti (opsional)"
            value={txPhoto}
            onChange={setTxPhoto}
          />
        </View>
        <View className="mt-4">
          <Button
            title="Simpan"
            onPress={handleAddTransaction}
            loading={addLoading}
          />
        </View>
      </Modal>

      <UpgradeModal visible={showUpgrade} onClose={() => setShowUpgrade(false)} currentTier={tier} featureName={upgradeFeature} />
    </SafeAreaView>
  );
}
