import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Modal } from "@components/ui/Modal";
import { EmptyState } from "@components/shared/EmptyState";
import { getSchedules, createSchedule } from "@services/warga-jadwal.service";
import { getMembers } from "@services/warga.service";
import { useUIStore } from "@stores/ui.store";
import { formatDate } from "@utils/format";
import { GRADIENTS, GLASS, RADIUS, TYPO, SPACING } from "@utils/theme";
import { COLORS } from "@utils/colors";
import type { WargaSchedule, ScheduleType } from "@app-types/sewa.types";
import type { OrgMember } from "@app-types/warga.types";
import Svg, { Path } from "react-native-svg";

const TYPE_LABELS: Record<ScheduleType, string> = { piket: "Piket", ronda: "Ronda", kebersihan: "Kebersihan", custom: "Lainnya" };

export default function JadwalScreen() {
  const insets = useSafeAreaInsets();
  const { orgId } = useLocalSearchParams<{ orgId: string }>();
  const showToast = useUIStore((s) => s.showToast);
  const [schedules, setSchedules] = useState<WargaSchedule[]>([]);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [selectedMember, setSelectedMember] = useState<OrgMember | null>(null);
  const [selectedType, setSelectedType] = useState<ScheduleType>("piket");
  const [actionLoading, setActionLoading] = useState(false);

  useFocusEffect(useCallback(() => { if (orgId) loadData(); }, [orgId]));

  async function loadData() {
    try {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const [sc, mem] = await Promise.all([getSchedules(orgId!, month), getMembers(orgId!)]);
      setSchedules(sc); setMembers(mem);
    } catch {} finally { setLoading(false); }
  }

  async function handleAdd() {
    if (!title.trim() || !date || !selectedMember) return;
    setActionLoading(true);
    try {
      await createSchedule(orgId!, { title: title.trim(), type: selectedType, date, member_id: selectedMember.id, member_name: selectedMember.name });
      showToast("Jadwal ditambahkan!", "success"); setTitle(""); setDate(""); setSelectedMember(null); setShowAdd(false); loadData();
    } catch { showToast("Gagal", "error"); } finally { setActionLoading(false); }
  }

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
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
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
            <Text style={{ ...TYPO.h3, color: "#FFFFFF", marginLeft: SPACING.md }}>Jadwal & Giliran</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowAdd(true)}
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: RADIUS.md,
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.3)",
            }}
          >
            <Text style={{ ...TYPO.captionBold, color: "#FFFFFF" }}>+ Tambah</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.md, paddingBottom: SPACING.xxl }}
      >
        {!loading && schedules.length === 0 ? (
          <EmptyState
            illustration="📅"
            title="Belum ada jadwal"
            actionLabel="+ Buat Jadwal"
            onAction={() => setShowAdd(true)}
          />
        ) : (
          <>
            <Text
              style={{
                ...TYPO.small,
                color: "#94A3B8",
                textTransform: "uppercase",
                letterSpacing: 0.8,
                marginBottom: SPACING.sm,
              }}
            >
              JADWAL BULAN INI
            </Text>
            {schedules.map((sc) => (
              <Card key={sc.id} variant="glass">
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...TYPO.bodyBold, color: COLORS.darkText }}>
                      {formatDate(sc.date)} - {sc.title}
                    </Text>
                    <Text style={{ ...TYPO.caption, color: COLORS.greyText, marginTop: SPACING.xs }}>
                      {sc.is_swapped ? `${sc.swap_with_name} (tukar dari ${sc.member_name})` : sc.member_name}
                    </Text>
                  </View>
                  <Badge label={TYPE_LABELS[sc.type]} variant={sc.is_swapped ? "warning" : "info"} />
                </View>
              </Card>
            ))}
          </>
        )}
      </ScrollView>

      <Modal visible={showAdd} onClose={() => setShowAdd(false)} title="Tambah Jadwal">
        <Input label="Kegiatan" placeholder="contoh: Ronda Malam" value={title} onChangeText={setTitle} />

        <Text style={{ ...TYPO.captionBold, color: COLORS.darkText, marginTop: SPACING.md, marginBottom: SPACING.sm }}>
          Jenis
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {(Object.keys(TYPE_LABELS) as ScheduleType[]).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setSelectedType(t)}
              style={{
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.sm,
                borderRadius: RADIUS.md,
                marginRight: SPACING.xs,
                marginBottom: SPACING.xs,
                backgroundColor: selectedType === t ? COLORS.warga : GLASS.card.background,
                borderWidth: 1,
                borderColor: selectedType === t ? COLORS.warga : COLORS.border,
              }}
            >
              <Text
                style={{
                  ...TYPO.captionBold,
                  color: selectedType === t ? "#FFFFFF" : COLORS.greyText,
                }}
              >
                {TYPE_LABELS[t]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ marginTop: SPACING.md }}>
          <Input label="Tanggal (YYYY-MM-DD)" placeholder="2026-04-01" value={date} onChangeText={setDate} />
        </View>

        <Text style={{ ...TYPO.captionBold, color: COLORS.darkText, marginTop: SPACING.md, marginBottom: SPACING.sm }}>
          Petugas
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {members.map((m) => (
            <TouchableOpacity
              key={m.id}
              onPress={() => setSelectedMember(m)}
              style={{
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.sm,
                borderRadius: RADIUS.md,
                marginRight: SPACING.xs,
                marginBottom: SPACING.xs,
                backgroundColor: selectedMember?.id === m.id ? COLORS.warga : GLASS.card.background,
                borderWidth: 1,
                borderColor: selectedMember?.id === m.id ? COLORS.warga : COLORS.border,
              }}
            >
              <Text
                style={{
                  ...TYPO.captionBold,
                  color: selectedMember?.id === m.id ? "#FFFFFF" : COLORS.greyText,
                }}
              >
                {m.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ marginTop: SPACING.md }}>
          <Button title="Tambah" onPress={handleAdd} loading={actionLoading} />
        </View>
      </Modal>
    </View>
  );
}
