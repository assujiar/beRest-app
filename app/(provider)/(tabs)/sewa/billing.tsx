import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { generateMonthlyBilling, getBillingByPeriod, updateBillingStatus } from "@services/sewa.service";
import { Modal } from "@components/ui/Modal";
import { useReminders } from "@hooks/shared/useReminders";
import { useUIStore } from "@stores/ui.store";
import { formatRupiah } from "@utils/format";
import { GRADIENTS, GLASS, RADIUS, TYPO, SPACING } from "@utils/theme";
import type { RentBilling, RentPaymentStatus } from "@app-types/sewa.types";

const STATUS_MAP: Record<RentPaymentStatus, { label: string; variant: "success" | "error" | "warning" | "neutral" }> = {
  paid: { label: "Lunas", variant: "success" }, unpaid: { label: "Belum Bayar", variant: "error" },
  partial: { label: "Sebagian", variant: "warning" }, overdue: { label: "Terlambat", variant: "error" },
};

function BackIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BellIcon({ size = 16, color = "#00C49A" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
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

function getCurrentPeriod() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; }

export default function BillingScreen() {
  const insets = useSafeAreaInsets();
  const { propId } = useLocalSearchParams<{ propId: string }>();
  const showToast = useUIStore((s) => s.showToast);
  const { scheduleMonthly } = useReminders();
  const [billings, setBillings] = useState<RentBilling[]>([]);
  const [period] = useState(getCurrentPeriod());
  const [loading, setLoading] = useState(true);
  const [showReminder, setShowReminder] = useState(false);
  const [reminderDay, setReminderDay] = useState(1);

  useFocusEffect(useCallback(() => { if (propId) loadData(); }, [propId]));

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
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Gradient Header */}
      <LinearGradient
        colors={GRADIENTS.sewa}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + SPACING.sm,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.lg,
          borderBottomLeftRadius: RADIUS.xxl,
          borderBottomRightRadius: RADIUS.xxl,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <BackIcon />
            </TouchableOpacity>
            <Text style={{ ...TYPO.h3, color: "#FFFFFF", marginLeft: SPACING.md }}>Tagihan {period}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowReminder(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: RADIUS.md,
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              gap: SPACING.xs,
            }}
          >
            <BellIcon size={14} color="#FFFFFF" />
            <Text style={{ ...TYPO.captionBold, color: "#FFFFFF" }}>Pengingat</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.lg, paddingTop: SPACING.md }}
      >
        {billings.length > 0 && (
          <Card variant="glass">
            <View style={{ flexDirection: "row" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ ...TYPO.caption, color: "#64748B" }}>Lunas</Text>
                <Text style={{ ...TYPO.money, color: "#00C49A", fontSize: 22 }}>{paidCount}/{billings.length}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ ...TYPO.caption, color: "#64748B" }}>Terkumpul</Text>
                <Text style={{ ...TYPO.money, color: "#1E293B", fontSize: 22 }}>{formatRupiah(totalCollected)}</Text>
              </View>
            </View>
          </Card>
        )}

        {billings.length === 0 && !loading && (
          <Card variant="glass">
            <Text style={{ ...TYPO.body, color: "#64748B", textAlign: "center", marginBottom: SPACING.md }}>Belum ada tagihan bulan ini</Text>
            <Button title="Generate Tagihan" variant="secondary" onPress={handleGenerate} />
          </Card>
        )}

        {billings.map((b) => {
          const s = STATUS_MAP[b.status];
          return (
            <TouchableOpacity key={b.id} onPress={() => handleTogglePaid(b)} activeOpacity={0.7}>
              <Card variant="glass">
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: RADIUS.sm,
                    borderWidth: 2,
                    borderColor: b.status === "paid" ? "#22C55E" : GLASS.card.border,
                    backgroundColor: b.status === "paid" ? "#22C55E" : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: SPACING.md,
                  }}>
                    {b.status === "paid" && <CheckIcon size={12} color="#FFFFFF" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>{b.tenant_name}</Text>
                    <Text style={{ ...TYPO.caption, color: "#64748B" }}>{formatRupiah(b.amount)}</Text>
                  </View>
                  <Badge label={s.label} variant={s.variant} />
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Modal visible={showReminder} onClose={() => setShowReminder(false)} title="Set Pengingat Bulanan">
        <Text style={{ ...TYPO.body, color: "#64748B", marginBottom: SPACING.lg }}>
          Apick akan mengirim notifikasi setiap bulan untuk mengingatkan kamu cek tagihan sewa.
        </Text>
        <Text style={{ ...TYPO.bodyBold, color: "#1E293B", marginBottom: SPACING.sm }}>Ingatkan setiap tanggal:</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: SPACING.lg }}>
          {[1, 5, 10, 15, 20, 25].map((d) => (
            <TouchableOpacity
              key={d}
              onPress={() => setReminderDay(d)}
              style={{
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.sm,
                borderRadius: RADIUS.md,
                marginRight: SPACING.sm,
                marginBottom: SPACING.sm,
                backgroundColor: reminderDay === d ? "#00C49A" : GLASS.card.background,
                borderWidth: 1,
                borderColor: reminderDay === d ? "#00C49A" : GLASS.card.border,
              }}
            >
              <Text style={{ ...TYPO.captionBold, color: reminderDay === d ? "#FFFFFF" : "#64748B" }}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Button title={`Set Pengingat Tanggal ${reminderDay}`} onPress={handleSetReminder} />
      </Modal>
    </View>
  );
}
