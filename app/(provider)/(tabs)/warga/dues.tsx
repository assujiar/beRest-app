import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
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
import type { OrgDues, DuesConfig, DuesStatus } from "@app-types/warga.types";

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
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-border-color bg-white">
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text className="text-lg text-navy">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-dark-text ml-3">Iuran</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-3">
        {/* Config summary */}
        {config ? (
          <Card>
            <Text className="text-xs text-grey-text">Iuran aktif</Text>
            <Text className="text-lg font-bold text-dark-text">
              {config.label}: {formatRupiah(config.amount)}/bulan
            </Text>
          </Card>
        ) : (
          <Card>
            <Text className="text-sm text-grey-text text-center">
              Belum ada iuran yang diatur
            </Text>
            <View className="mt-3">
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
          <Card>
            <Text className="text-xs text-grey-text">Periode: {period}</Text>
            <View className="flex-row mt-2">
              <View className="flex-1">
                <Text className="text-xs text-grey-text">Lunas</Text>
                <Text className="text-lg font-bold text-green-600">
                  {paidCount}/{dues.length}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-grey-text">Terkumpul</Text>
                <Text className="text-lg font-bold text-dark-text">
                  {formatRupiah(totalCollected)}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Reminder button for unpaid */}
        {dues.filter((d) => d.status !== "paid").length > 0 && (
          <TouchableOpacity onPress={() => setShowReminder(true)} className="bg-warga/10 rounded-xl px-4 py-3 mb-3 flex-row items-center justify-center">
            <Text className="text-sm font-bold text-warga">🔔 Kirim Pengingat ({dues.filter((d) => d.status !== "paid").length} belum bayar)</Text>
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
              <Card>
                <View className="flex-row items-center">
                  <View
                    className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${
                      d.status === "paid" ? "bg-green-500 border-green-500" : "border-border-color"
                    }`}
                  >
                    {d.status === "paid" && (
                      <Text className="text-white text-xs font-bold">✓</Text>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-dark-text">
                      {memberData.org_members?.name ?? "Anggota"}
                    </Text>
                    <Text className="text-xs text-grey-text">
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
        <View className="mt-3">
          <CurrencyInput
            label="Jumlah per Bulan"
            value={setupAmount}
            onChangeValue={setSetupAmount}
          />
        </View>
        <View className="mt-4">
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
    </SafeAreaView>
  );
}
