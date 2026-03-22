import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { generateMonthlyBilling, getBillingByPeriod, updateBillingStatus } from "@services/sewa.service";
import { Modal } from "@components/ui/Modal";
import { useReminders } from "@hooks/shared/useReminders";
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
  const { scheduleMonthly } = useReminders();
  const [billings, setBillings] = useState<RentBilling[]>([]);
  const [period] = useState(getCurrentPeriod());
  const [loading, setLoading] = useState(true);
  const [showReminder, setShowReminder] = useState(false);
  const [reminderDay, setReminderDay] = useState(1);

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

  async function handleSetReminder() {
    try {
      await scheduleMonthly({
        title: "Tagihan Sewa",
        body: `Saatnya generate dan cek tagihan sewa bulan ini.`,
        day: reminderDay,
        hour: 8,
        data: { type: "sewa_billing", propId },
      });
      showToast(`Pengingat diset setiap tanggal ${reminderDay}`, "success");
      setShowReminder(false);
    } catch {
      showToast("Gagal set pengingat", "error");
    }
  }

  const paidCount = billings.filter((b) => b.status === "paid").length;
  const totalCollected = billings.filter((b) => b.status === "paid").reduce((s, b) => s + b.amount, 0);

  return (
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-border-color bg-white">
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}><Text className="text-lg text-navy">←</Text></TouchableOpacity>
        <Text className="text-lg font-bold text-dark-text ml-3">Tagihan {period}</Text>
        <View className="flex-1" />
        <TouchableOpacity onPress={() => setShowReminder(true)} className="bg-sewa/10 rounded-lg px-3 py-2">
          <Text className="text-xs font-bold text-sewa">🔔 Pengingat</Text>
        </TouchableOpacity>
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

      <Modal visible={showReminder} onClose={() => setShowReminder(false)} title="Set Pengingat Bulanan">
        <Text className="text-sm text-grey-text mb-4">
          Apick akan mengirim notifikasi setiap bulan untuk mengingatkan kamu cek tagihan sewa.
        </Text>
        <Text className="text-sm font-medium text-dark-text mb-2">Ingatkan setiap tanggal:</Text>
        <View className="flex-row flex-wrap mb-4">
          {[1, 5, 10, 15, 20, 25].map((d) => (
            <TouchableOpacity key={d} onPress={() => setReminderDay(d)} className={`px-4 py-2 rounded-lg mr-2 mb-2 ${reminderDay === d ? "bg-sewa" : "bg-gray-100"}`}>
              <Text className={`text-sm font-bold ${reminderDay === d ? "text-white" : "text-grey-text"}`}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Button title={`Set Pengingat Tanggal ${reminderDay}`} onPress={handleSetReminder} />
      </Modal>
    </SafeAreaView>
  );
}
