import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { getSchedules, getStudentBillings } from "@services/lapak-advanced.service";
import { formatRupiah } from "@utils/format";
import { GRADIENTS, RADIUS, TYPO, SPACING } from "@utils/theme";
import type { Schedule, StudentBilling, PaymentStatus } from "@app-types/lapak.types";

const MODULE_COLOR = "#50BFC3";

const DAY_LABELS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const STATUS_MAP: Record<PaymentStatus, { label: string; variant: "success" | "error" | "warning" }> = {
  paid: { label: "Lunas", variant: "success" }, unpaid: { label: "Belum Bayar", variant: "error" }, partial: { label: "Sebagian", variant: "warning" },
};

function BackIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 19L8 12L15 5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CalendarIcon({ size = 20, color = "#50BFC3" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4ZM16 2V6M8 2V6M3 10H21" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ClockIcon({ size = 14, color = "#50BFC3" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 6V12L16 14" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function StudentDashboardScreen() {
  const insets = useSafeAreaInsets();
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
          <Text style={{ ...TYPO.h3, color: "#FFFFFF" }}>Jadwal & Tagihan</Text>
        </View>
      </LinearGradient>

      <ScrollView style={{ flex: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.md }}>
        <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: SPACING.sm }}>JADWAL</Text>
        {schedules.map((sc) => (
          <Card key={sc.id} variant="glass">
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{
                width: 44,
                height: 44,
                borderRadius: RADIUS.md,
                backgroundColor: "rgba(80,191,195,0.1)",
                alignItems: "center",
                justifyContent: "center",
                marginRight: SPACING.md,
              }}>
                <CalendarIcon size={20} color={MODULE_COLOR} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>{DAY_LABELS[sc.day_of_week]}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.xs, marginTop: 2 }}>
                  <ClockIcon size={12} color={MODULE_COLOR} />
                  <Text style={{ ...TYPO.caption, color: MODULE_COLOR }}>{sc.start_time} - {sc.end_time}</Text>
                </View>
                {sc.subject && <Text style={{ ...TYPO.caption, color: "#64748B", marginTop: 2 }}>{sc.subject}</Text>}
              </View>
            </View>
          </Card>
        ))}
        {schedules.length === 0 && (
          <Card variant="glass">
            <Text style={{ ...TYPO.body, color: "#64748B", textAlign: "center" }}>Belum ada jadwal</Text>
          </Card>
        )}

        <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, marginTop: SPACING.lg, marginBottom: SPACING.sm }}>TAGIHAN</Text>
        {billings.map((b) => {
          const s = STATUS_MAP[b.status];
          return (
            <Card key={b.id} variant="glass">
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>{b.student_name}</Text>
                  <Text style={{ ...TYPO.bodyBold, color: MODULE_COLOR, marginTop: 2 }}>{formatRupiah(b.amount)}</Text>
                </View>
                <Badge label={s.label} variant={s.variant} />
              </View>
            </Card>
          );
        })}
        {billings.length === 0 && (
          <Card variant="glass">
            <Text style={{ ...TYPO.body, color: "#64748B", textAlign: "center" }}>Belum ada tagihan</Text>
          </Card>
        )}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </View>
  );
}
