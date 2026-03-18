import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { generateMonthlyBilling, getBillingByPeriod, updateBillingStatus } from "@services/sewa.service";
import { useUIStore } from "@stores/ui.store";
import { formatRupiah } from "@utils/format";
import type { RentBilling, RentPaymentStatus } from "@app-types/sewa.types";

const STATUS_MAP: Record<RentPaymentStatus, { label: string; variant: "success" | "error" | "warning" | "neutral" }> = {
  paid: { label: "Lunas", variant: "success" }, unpaid: { label: "Belum Bayar", variant: "error" },
  partial: { label: "Sebagian", variant: "warning" }, overdue: { label: "Terlambat", variant: "error" },
};

function getCurrentPeriod() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; }

export default function BillingScreen() {
  const { propId } = useLocalSearchParams<{ propId: string }>();
  const showToast = useUIStore((s) => s.showToast);
  const [billings, setBillings] = useState<RentBilling[]>([]);
  const [period] = useState(getCurrentPeriod());
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (propId) loadData(); }, [propId]);

  async function loadData() {
    try { setBillings(await getBillingByPeriod(propId!, period)); }
    catch { /* silent */ } finally { setLoading(false); }
  }

  async function handleGenerate() {
    try { const b = await generateMonthlyBilling(propId!, period); setBillings(b); showToast(`Tagihan ${period} digenerate`, "success"); }
    catch { showToast("Gagal generate tagihan", "error"); }
  }

  async function handleTogglePaid(b: RentBilling) {
    const newStatus: RentPaymentStatus = b.status === "paid" ? "unpaid" : "paid";
    try { await updateBillingStatus(b.id, newStatus); loadData(); }
    catch { showToast("Gagal update", "error"); }
  }

  const paidCount = billings.filter((b) => b.status === "paid").length;
  const totalCollected = billings.filter((b) => b.status === "paid").reduce((s, b) => s + b.amount, 0);

  return (
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-border-color bg-white">
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}><Text className="text-lg text-navy">←</Text></TouchableOpacity>
        <Text className="text-lg font-bold text-dark-text ml-3">Tagihan {period}</Text>
      </View>
      <ScrollView className="flex-1 px-4 pt-3">
        {billings.length > 0 && (
          <Card>
            <View className="flex-row">
              <View className="flex-1"><Text className="text-xs text-grey-text">Lunas</Text><Text className="text-xl font-bold text-sewa">{paidCount}/{billings.length}</Text></View>
              <View className="flex-1"><Text className="text-xs text-grey-text">Terkumpul</Text><Text className="text-xl font-bold text-dark-text">{formatRupiah(totalCollected)}</Text></View>
            </View>
          </Card>
        )}
        {billings.length === 0 && !loading && (
          <Card><Text className="text-sm text-grey-text text-center mb-3">Belum ada tagihan bulan ini</Text>
            <Button title="Generate Tagihan" variant="secondary" onPress={handleGenerate} /></Card>
        )}
        {billings.map((b) => {
          const s = STATUS_MAP[b.status];
          return (
            <TouchableOpacity key={b.id} onPress={() => handleTogglePaid(b)} activeOpacity={0.7}>
              <Card><View className="flex-row items-center">
                <View className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${b.status === "paid" ? "bg-green-500 border-green-500" : "border-border-color"}`}>
                  {b.status === "paid" && <Text className="text-white text-xs font-bold">✓</Text>}
                </View>
                <View className="flex-1"><Text className="text-base font-bold text-dark-text">{b.tenant_name}</Text><Text className="text-xs text-grey-text">{formatRupiah(b.amount)}</Text></View>
                <Badge label={s.label} variant={s.variant} />
              </View></Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
