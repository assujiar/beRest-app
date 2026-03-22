import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Modal } from "@components/ui/Modal";
import { CurrencyInput } from "@components/shared/CurrencyInput";
import {
  getActiveDuesConfig,
  setDuesConfig,
  getDuesByPeriod,
  generateDuesForPeriod,
  updateDuesStatus,
} from "@services/warga.service";
import { ReminderSheet } from "@components/warga/ReminderSheet";
import { useAuthStore } from "@stores/auth.store";
import { useUIStore } from "@stores/ui.store";
import { formatRupiah } from "@utils/format";
import { GRADIENTS, RADIUS, TYPO, SPACING } from "@utils/theme";
import { COLORS } from "@utils/colors";
import type { OrgDues, DuesConfig, DuesStatus } from "@app-types/warga.types";
import Svg, { Path } from "react-native-svg";

const STATUS_MAP: Record<DuesStatus, { label: string; variant: "success" | "error" | "warning" | "neutral" }> = {
  paid: { label: "Lunas", variant: "success" },
  unpaid: { label: "Belum Bayar", variant: "error" },
  partial: { label: "Sebagian", variant: "warning" },
  exempt: { label: "Dibebaskan", variant: "neutral" },
};

function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function DuesScreen() {
  const insets = useSafeAreaInsets();
  const { orgId, orgName } = useLocalSearchParams<{ orgId: string; orgName: string }>();
  const profile = useAuthStore((s) => s.profile);
  const showToast = useUIStore((s) => s.showToast);
  const [showReminder, setShowReminder] = useState(false);
  const [config, setConfig] = useState<DuesConfig | null>(null);
  const [dues, setDues] = useState<OrgDues[]>([]);
  const [period] = useState(getCurrentPeriod());
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [setupLabel, setSetupLabel] = useState("");
  const [setupAmount, setSetupAmount] = useState(0);
  const [setupLoading, setSetupLoading] = useState(false);

  useEffect(() => {
    if (orgId) loadData();
  }, [orgId, period]);

  async function loadData() {
    setLoading(true);
    try {
      const [cfg, duesData] = await Promise.all([
        getActiveDuesConfig(orgId!),
        getDuesByPeriod(orgId!, period),
      ]);
      setConfig(cfg);
      setDues(duesData);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function handleSetupDues() {
    if (!setupLabel.trim() || setupAmount <= 0) return;
    setSetupLoading(true);
    try {
      const cfg = await setDuesConfig(orgId!, {
        label: setupLabel.trim(),
        amount: setupAmount,
        period_type: "monthly",
      });
      setConfig(cfg);
      setShowSetup(false);
      showToast("Iuran berhasil diatur!", "success");
    } catch {
      showToast("Gagal mengatur iuran", "error");
    } finally {
      setSetupLoading(false);
    }
  }

  async function handleGenerate() {
    if (!config) return;
    try {
      const generated = await generateDuesForPeriod(orgId!, period, config.amount);
      setDues(generated);
      showToast(`Iuran ${period} berhasil digenerate`, "success");
    } catch {
      showToast("Gagal generate iuran", "error");
    }
  }

  async function handleTogglePaid(d: OrgDues) {
    const newStatus: DuesStatus = d.status === "paid" ? "unpaid" : "paid";
    try {
      await updateDuesStatus(d.id, newStatus);
      loadData();
    } catch {
      showToast("Gagal update status", "error");
    }
  }

  const paidCount = dues.filter((d) => d.status === "paid").length;
  const totalCollected = dues
    .filter((d) => d.status === "paid")
    .reduce((sum, d) => sum + d.amount, 0);

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
          <Text style={{ ...TYPO.h3, color: "#FFFFFF", marginLeft: SPACING.md }}>Iuran</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.md, paddingBottom: SPACING.xxl }}
      >
        {/* Config summary */}
        {config ? (
          <Card variant="glass">
            <Text style={{ ...TYPO.caption, color: COLORS.greyText }}>Iuran aktif</Text>
            <Text style={{ ...TYPO.h3, color: COLORS.darkText, marginTop: SPACING.xs }}>
              {config.label}: {formatRupiah(config.amount)}/bulan
            </Text>
          </Card>
        ) : (
          <Card variant="glass">
            <Text style={{ ...TYPO.body, color: COLORS.greyText, textAlign: "center" }}>
              Belum ada iuran yang diatur
            </Text>
            <View style={{ marginTop: SPACING.md }}>
              <Button
                title="Atur Iuran"
                variant="secondary"
                onPress={() => setShowSetup(true)}
              />
            </View>
          </Card>
        )}

        {/* Period summary */}
        {dues.length > 0 && (
          <Card variant="glass">
            <Text style={{ ...TYPO.caption, color: COLORS.greyText }}>Periode: {period}</Text>
            <View style={{ flexDirection: "row", marginTop: SPACING.sm }}>
              <View style={{ flex: 1 }}>
                <Text style={{ ...TYPO.caption, color: COLORS.greyText }}>Lunas</Text>
                <Text style={{ ...TYPO.h3, color: COLORS.green, marginTop: SPACING.xs }}>
                  {paidCount}/{dues.length}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ ...TYPO.caption, color: COLORS.greyText }}>Terkumpul</Text>
                <Text style={{ ...TYPO.h3, color: COLORS.darkText, marginTop: SPACING.xs }}>
                  {formatRupiah(totalCollected)}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Reminder button for unpaid */}
        {dues.filter((d) => d.status !== "paid").length > 0 && (
          <TouchableOpacity
            onPress={() => setShowReminder(true)}
            style={{
              backgroundColor: "rgba(251,143,103,0.12)",
              borderRadius: RADIUS.lg,
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.md,
              marginBottom: SPACING.md,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "rgba(251,143,103,0.2)",
            }}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginRight: SPACING.sm }}>
              <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={COLORS.warga} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={COLORS.warga} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={{ ...TYPO.captionBold, color: COLORS.warga }}>
              Kirim Pengingat ({dues.filter((d) => d.status !== "paid").length} belum bayar)
            </Text>
          </TouchableOpacity>
        )}

        {/* Generate button */}
        {config && dues.length === 0 && !loading && (
          <Button
            title="Generate Iuran Bulan Ini"
            variant="secondary"
            onPress={handleGenerate}
          />
        )}

        {/* Section header */}
        {dues.length > 0 && (
          <Text
            style={{
              ...TYPO.small,
              color: "#94A3B8",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginBottom: SPACING.sm,
              marginTop: SPACING.xs,
            }}
          >
            DAFTAR ANGGOTA
          </Text>
        )}

        {/* Member dues list */}
        {dues.map((d) => {
          const s = STATUS_MAP[d.status];
          const memberData = d as OrgDues & { org_members?: { name: string; phone: string | null } };
          return (
            <TouchableOpacity
              key={d.id}
              onPress={() => handleTogglePaid(d)}
              activeOpacity={0.7}
            >
              <Card variant="glass">
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: RADIUS.sm,
                      borderWidth: 2,
                      borderColor: d.status === "paid" ? COLORS.green : COLORS.border,
                      backgroundColor: d.status === "paid" ? COLORS.green : "transparent",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: SPACING.md,
                    }}
                  >
                    {d.status === "paid" && (
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                        <Path d="M20 6L9 17L4 12" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...TYPO.bodyBold, color: COLORS.darkText }}>
                      {memberData.org_members?.name ?? "Anggota"}
                    </Text>
                    <Text style={{ ...TYPO.caption, color: COLORS.greyText }}>
                      {formatRupiah(d.amount)}
                    </Text>
                  </View>
                  <Badge label={s.label} variant={s.variant} />
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Setup modal */}
      <Modal
        visible={showSetup}
        onClose={() => setShowSetup(false)}
        title="Atur Iuran"
      >
        <Input
          label="Nama Iuran"
          placeholder="contoh: Iuran Bulanan"
          value={setupLabel}
          onChangeText={setSetupLabel}
        />
        <View style={{ marginTop: SPACING.md }}>
          <CurrencyInput
            label="Jumlah per Bulan"
            value={setupAmount}
            onChangeValue={setSetupAmount}
          />
        </View>
        <View style={{ marginTop: SPACING.md }}>
          <Button
            title="Simpan"
            onPress={handleSetupDues}
            loading={setupLoading}
          />
        </View>
      </Modal>

      <ReminderSheet
        visible={showReminder}
        onClose={() => setShowReminder(false)}
        orgName={orgName ?? "Organisasi"}
        providerId={profile?.id ?? ""}
        unpaidMembers={dues.filter((d) => d.status !== "paid") as (OrgDues & { org_members?: { name: string; phone: string | null } })[]}
        period={period}
      />
    </View>
  );
}
