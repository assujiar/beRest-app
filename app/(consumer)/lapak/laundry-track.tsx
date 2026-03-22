import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { getLaundryByCode } from "@services/lapak-advanced.service";
import { formatRupiah, formatRelativeTime } from "@utils/format";
import { GRADIENTS, RADIUS, TYPO, SPACING } from "@utils/theme";
import type { LaundryOrder, LaundryStatus } from "@app-types/lapak.types";

const MODULE_COLOR = "#50BFC3";

const STATUS_LABELS: Record<LaundryStatus, string> = {
  received: "Diterima", washing: "Dicuci", drying: "Dikeringkan",
  ironing: "Disetrika", ready: "Siap Ambil", picked_up: "Diambil", cancelled: "Dibatalkan",
};
const STATUS_STEPS: LaundryStatus[] = ["received", "washing", "drying", "ironing", "ready", "picked_up"];

function BackIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 19L8 12L15 5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CheckIcon({ size = 12, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function LaundryTrackScreen() {
  const insets = useSafeAreaInsets();
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
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Gradient Header */}
      <LinearGradient
        colors={GRADIENTS.lapak}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + SPACING.sm, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.md }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.md }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <BackIcon size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ ...TYPO.h3, color: "#FFFFFF" }}>Lacak Laundry</Text>
        </View>
      </LinearGradient>

      <View style={{ paddingHorizontal: SPACING.md, paddingTop: SPACING.lg }}>
        <Input label="Kode Order" placeholder="contoh: LDR-18ABCD" value={code} onChangeText={(t: string) => { setCode(t.toUpperCase()); setError(""); }} autoCapitalize="characters" error={error} />
        <View style={{ marginTop: SPACING.md }}>
          <Button title="Lacak" onPress={handleTrack} loading={loading} />
        </View>
      </View>

      {order && (
        <View style={{ paddingHorizontal: SPACING.md, marginTop: SPACING.lg }}>
          <Card variant="elevated">
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACING.sm }}>
              <Text style={{ ...TYPO.caption, color: "#64748B", fontFamily: "monospace" }}>{order.order_code}</Text>
              <Badge label={STATUS_LABELS[order.status]} variant={order.status === "ready" ? "success" : order.status === "picked_up" ? "neutral" : "info"} />
            </View>
            <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>{order.customer_name}</Text>
            <Text style={{ ...TYPO.bodyBold, color: MODULE_COLOR, marginTop: SPACING.xs }}>{formatRupiah(order.total)}</Text>
            <Text style={{ ...TYPO.caption, color: "#64748B", marginTop: SPACING.xs }}>{formatRelativeTime(order.created_at)}</Text>
          </Card>

          {/* Progress steps */}
          <Card variant="glass">
            <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: SPACING.md }}>PROGRESS</Text>
            {STATUS_STEPS.map((step, i) => (
              <View key={step} style={{ flexDirection: "row", alignItems: "center", marginBottom: i < STATUS_STEPS.length - 1 ? SPACING.md : 0 }}>
                <View style={{
                  width: 28,
                  height: 28,
                  borderRadius: RADIUS.full,
                  backgroundColor: i <= currentStep ? MODULE_COLOR : "#E2E8F0",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: SPACING.md,
                }}>
                  {i <= currentStep ? (
                    <CheckIcon size={14} color="#FFFFFF" />
                  ) : (
                    <Text style={{ ...TYPO.caption, color: "#64748B" }}>{i + 1}</Text>
                  )}
                </View>
                <Text style={{
                  ...TYPO.body,
                  color: i <= currentStep ? "#1E293B" : "#64748B",
                  fontWeight: i <= currentStep ? "600" : "400",
                }}>{STATUS_LABELS[step]}</Text>
              </View>
            ))}
          </Card>
        </View>
      )}
    </View>
  );
}
