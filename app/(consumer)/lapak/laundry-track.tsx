import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { getLaundryByCode } from "@services/lapak-advanced.service";
import { formatRupiah, formatRelativeTime } from "@utils/format";
import type { LaundryOrder, LaundryStatus } from "@app-types/lapak.types";

const STATUS_LABELS: Record<LaundryStatus, string> = {
  received: "Diterima", washing: "Dicuci", drying: "Dikeringkan",
  ironing: "Disetrika", ready: "Siap Ambil", picked_up: "Diambil", cancelled: "Dibatalkan",
};
const STATUS_STEPS: LaundryStatus[] = ["received", "washing", "drying", "ironing", "ready", "picked_up"];

export default function LaundryTrackScreen() {
  const [code, setCode] = useState("");
  const [order, setOrder] = useState<LaundryOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleTrack() {
    if (code.length < 3) { setError("Masukkan kode order"); return; }
    setLoading(true); setError("");
    try {
      const result = await getLaundryByCode(code);
      if (!result) { setError("Kode order tidak ditemukan"); return; }
      setOrder(result);
    } catch { setError("Gagal mencari order"); } finally { setLoading(false); }
  }

  const currentStep = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-border-color bg-white">
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}><Text className="text-lg text-navy">←</Text></TouchableOpacity>
        <Text className="text-lg font-bold text-dark-text ml-3">Lacak Laundry</Text>
      </View>
      <View className="px-4 pt-4">
        <Input label="Kode Order" placeholder="contoh: LDR-18ABCD" value={code} onChangeText={(t) => { setCode(t.toUpperCase()); setError(""); }} autoCapitalize="characters" error={error} />
        <View className="mt-3"><Button title="Lacak" onPress={handleTrack} loading={loading} /></View>
      </View>

      {order && (
        <View className="px-4 mt-4">
          <Card>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xs text-grey-text font-mono">{order.order_code}</Text>
              <Badge label={STATUS_LABELS[order.status]} variant={order.status === "ready" ? "success" : order.status === "picked_up" ? "neutral" : "info"} />
            </View>
            <Text className="text-base font-bold text-dark-text">{order.customer_name}</Text>
            <Text className="text-sm font-bold text-lapak mt-1">{formatRupiah(order.total)}</Text>
            <Text className="text-xs text-grey-text mt-1">{formatRelativeTime(order.created_at)}</Text>
          </Card>

          {/* Progress steps */}
          <Card>
            <Text className="text-sm font-bold text-grey-text mb-3">PROGRESS</Text>
            {STATUS_STEPS.map((step, i) => (
              <View key={step} className="flex-row items-center mb-2">
                <View className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${i <= currentStep ? "bg-lapak" : "bg-gray-200"}`}>
                  {i <= currentStep ? <Text className="text-white text-xs font-bold">✓</Text> : <Text className="text-grey-text text-xs">{i + 1}</Text>}
                </View>
                <Text className={`text-sm ${i <= currentStep ? "text-dark-text font-bold" : "text-grey-text"}`}>{STATUS_LABELS[step]}</Text>
              </View>
            ))}
          </Card>
        </View>
      )}
    </SafeAreaView>
  );
}
