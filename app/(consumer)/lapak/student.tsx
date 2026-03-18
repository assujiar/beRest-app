import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { getSchedules, getStudentBillings } from "@services/lapak-advanced.service";
import { formatRupiah } from "@utils/format";
import type { Schedule, StudentBilling, PaymentStatus } from "@app-types/lapak.types";

const DAY_LABELS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const STATUS_MAP: Record<PaymentStatus, { label: string; variant: "success" | "error" | "warning" }> = {
  paid: { label: "Lunas", variant: "success" }, unpaid: { label: "Belum Bayar", variant: "error" }, partial: { label: "Sebagian", variant: "warning" },
};

export default function StudentDashboardScreen() {
  const { bizId } = useLocalSearchParams<{ bizId: string }>();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [billings, setBillings] = useState<StudentBilling[]>([]);

  useEffect(() => { if (bizId) loadData(); }, [bizId]);

  async function loadData() {
    try {
      const now = new Date();
      const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const [sc, bl] = await Promise.all([getSchedules(bizId!), getStudentBillings(bizId!, period)]);
      setSchedules(sc); setBillings(bl);
    } catch {}
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-border-color bg-white">
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}><Text className="text-lg text-navy">←</Text></TouchableOpacity>
        <Text className="text-lg font-bold text-dark-text ml-3">Jadwal & Tagihan</Text>
      </View>
      <ScrollView className="flex-1 px-4 pt-3">
        <Text className="text-sm font-bold text-grey-text mb-2">JADWAL</Text>
        {schedules.map((sc) => (
          <Card key={sc.id}>
            <Text className="text-base font-bold text-dark-text">{DAY_LABELS[sc.day_of_week]}</Text>
            <Text className="text-sm text-lapak">{sc.start_time} - {sc.end_time}</Text>
            {sc.subject && <Text className="text-xs text-grey-text">{sc.subject}</Text>}
          </Card>
        ))}
        {schedules.length === 0 && <Card><Text className="text-sm text-grey-text text-center">Belum ada jadwal</Text></Card>}

        <Text className="text-sm font-bold text-grey-text mt-4 mb-2">TAGIHAN</Text>
        {billings.map((b) => {
          const s = STATUS_MAP[b.status];
          return (
            <Card key={b.id}>
              <View className="flex-row items-center">
                <View className="flex-1">
                  <Text className="text-base font-bold text-dark-text">{b.student_name}</Text>
                  <Text className="text-sm text-lapak font-bold">{formatRupiah(b.amount)}</Text>
                </View>
                <Badge label={s.label} variant={s.variant} />
              </View>
            </Card>
          );
        })}
        {billings.length === 0 && <Card><Text className="text-sm text-grey-text text-center">Belum ada tagihan</Text></Card>}
      </ScrollView>
    </SafeAreaView>
  );
}
