import React from "react";
import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Modal } from "@components/ui/Modal";
import { useAuthStore } from "@stores/auth.store";
import { useUIStore } from "@stores/ui.store";
import { getMySchedules, requestSwap } from "@services/warga-jadwal.service";
import { formatDate } from "@utils/format";
import { GRADIENTS, RADIUS, TYPO, SPACING } from "@utils/theme";
import type { WargaSchedule, ScheduleType } from "@app-types/sewa.types";

const MODULE_COLOR = "#FB8F67";

const TYPE_LABELS: Record<ScheduleType, string> = {
  piket: "Piket",
  ronda: "Ronda",
  kebersihan: "Kebersihan",
  custom: "Lainnya",
};

function BackIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 19L8 12L15 5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BroomIcon({ size = 20, color = "#FB8F67" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 3L19 17M9 7L6.74 4.74C6.36 4.36 5.73 4.36 5.35 4.74L4.74 5.35C4.36 5.73 4.36 6.36 4.74 6.74L7 9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M14 17L17 20M10 13L7 16" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function FlashlightIcon({ size = 20, color = "#FB8F67" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 6L6 18M8 2V4M2 8H4M16 2V4M22 8H20" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function RecycleIcon({ size = 20, color = "#FB8F67" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7 19H4.815C3.77 18.99 2.907 18.15 2.907 17.106V12M12 5L8 1L4 5M7 5H17L21 12H14L10 19H17" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ClipboardIcon({ size = 20, color = "#FB8F67" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M16 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M15 2H9C8.44772 2 8 2.44772 8 3V5C8 5.55228 8.44772 6 9 6H15C15.5523 6 16 5.55228 16 5V3C16 2.44772 15.5523 2 15 2Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CalendarIcon({ size = 48, color = "#94A3B8" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4ZM16 2V6M8 2V6M3 10H21" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const TYPE_ICON_MAP: Record<ScheduleType, (props: { size?: number; color?: string }) => React.ReactElement> = {
  piket: BroomIcon,
  ronda: FlashlightIcon,
  kebersihan: RecycleIcon,
  custom: ClipboardIcon,
};

export default function ConsumerJadwalScreen() {
  const insets = useSafeAreaInsets();
  const { orgId, orgName } = useLocalSearchParams<{ orgId: string; orgName: string }>();
  const profile = useAuthStore((s) => s.profile);
  const [schedules, setSchedules] = useState<WargaSchedule[]>([]);
  const showToast = useUIStore((s) => s.showToast);
  const [refreshing, setRefreshing] = useState(false);
  const [showSwap, setShowSwap] = useState(false);
  const [swapSchedule, setSwapSchedule] = useState<WargaSchedule | null>(null);
  const [swapName, setSwapName] = useState("");
  const [swapLoading, setSwapLoading] = useState(false);

  const loadSchedules = useCallback(async () => {
    if (!orgId || !profile?.id) return;
    try {
      const data = await getMySchedules(orgId, profile.id);
      setSchedules(data);
    } catch {
      // silent
    }
  }, [orgId, profile?.id]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  async function onRefresh() {
    setRefreshing(true);
    await loadSchedules();
    setRefreshing(false);
  }

  function handleOpenSwap(schedule: WargaSchedule) {
    setSwapSchedule(schedule);
    setSwapName("");
    setShowSwap(true);
  }

  async function handleSwap() {
    if (!swapSchedule || !swapName.trim()) return;
    setSwapLoading(true);
    try {
      await requestSwap(swapSchedule.id, profile?.id ?? "", swapName.trim());
      showToast("Tukar jadwal berhasil!", "success");
      setShowSwap(false);
      loadSchedules();
    } catch {
      showToast("Gagal tukar jadwal", "error");
    } finally {
      setSwapLoading(false);
    }
  }

  const upcoming = schedules.filter((s) => new Date(s.date) >= new Date());
  const past = schedules.filter((s) => new Date(s.date) < new Date());

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Gradient Header */}
      <LinearGradient
        colors={GRADIENTS.warga}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + SPACING.sm, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.md }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.md }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <BackIcon size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ ...TYPO.h3, color: "#FFFFFF" }}>Jadwal {orgName ?? ""}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.md }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={MODULE_COLOR} />
        }
      >
        {schedules.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: SPACING.xxl * 1.5 }}>
            <CalendarIcon size={48} color="#94A3B8" />
            <Text style={{ ...TYPO.bodyBold, color: "#64748B", marginTop: SPACING.md }}>
              Belum ada jadwal
            </Text>
            <Text style={{ ...TYPO.caption, color: "#64748B", marginTop: SPACING.xs }}>
              Jadwal dari pengelola akan muncul di sini
            </Text>
          </View>
        ) : (
          <>
            {upcoming.length > 0 && (
              <>
                <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: SPACING.sm }}>
                  MENDATANG
                </Text>
                {upcoming.map((s) => {
                  const IconComponent = TYPE_ICON_MAP[s.type];
                  return (
                    <Card key={s.id} variant="glass">
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <View style={{
                          width: 40,
                          height: 40,
                          borderRadius: RADIUS.md,
                          backgroundColor: "rgba(251,143,103,0.1)",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: SPACING.md,
                        }}>
                          <IconComponent size={20} color={MODULE_COLOR} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>
                            {s.title}
                          </Text>
                          <Text style={{ ...TYPO.caption, color: "#64748B" }}>
                            {formatDate(s.date)}
                          </Text>
                          {s.is_swapped && s.swap_with_name && (
                            <Text style={{ ...TYPO.caption, color: MODULE_COLOR, marginTop: 2 }}>
                              Tukar dengan {s.swap_with_name}
                            </Text>
                          )}
                        </View>
                        {!s.is_swapped && (
                          <TouchableOpacity
                            onPress={() => handleOpenSwap(s)}
                            style={{
                              backgroundColor: "rgba(251,143,103,0.1)",
                              borderRadius: RADIUS.md,
                              paddingHorizontal: SPACING.sm,
                              paddingVertical: SPACING.xs,
                              marginRight: SPACING.sm,
                            }}
                          >
                            <Text style={{ ...TYPO.captionBold, color: MODULE_COLOR }}>Tukar</Text>
                          </TouchableOpacity>
                        )}
                        <Badge
                          label={TYPE_LABELS[s.type]}
                          variant="info"
                        />
                      </View>
                    </Card>
                  );
                })}
              </>
            )}

            {past.length > 0 && (
              <>
                <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: SPACING.sm, marginTop: SPACING.lg }}>
                  SELESAI
                </Text>
                {past.map((s) => {
                  const IconComponent = TYPE_ICON_MAP[s.type];
                  return (
                    <Card key={s.id} variant="glass" style={{ opacity: 0.6 }}>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <View style={{
                          width: 40,
                          height: 40,
                          borderRadius: RADIUS.md,
                          backgroundColor: "rgba(251,143,103,0.08)",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: SPACING.md,
                        }}>
                          <IconComponent size={20} color="#94A3B8" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>
                            {s.title}
                          </Text>
                          <Text style={{ ...TYPO.caption, color: "#64748B" }}>
                            {formatDate(s.date)}
                          </Text>
                        </View>
                        <Badge
                          label={TYPE_LABELS[s.type]}
                          variant="neutral"
                        />
                      </View>
                    </Card>
                  );
                })}
              </>
            )}
          </>
        )}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      {/* Swap Modal */}
      <Modal visible={showSwap} onClose={() => setShowSwap(false)} title="Tukar Jadwal">
        {swapSchedule && (
          <>
            <Text style={{ ...TYPO.body, color: "#64748B", marginBottom: SPACING.xs }}>
              Jadwal: <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>{swapSchedule.title}</Text>
            </Text>
            <Text style={{ ...TYPO.body, color: "#64748B", marginBottom: SPACING.lg }}>
              Tanggal: <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>{formatDate(swapSchedule.date)}</Text>
            </Text>
            <Input
              label="Nama yang menggantikan"
              placeholder="contoh: Pak Budi"
              value={swapName}
              onChangeText={setSwapName}
            />
            <View style={{ marginTop: SPACING.lg }}>
              <Button title="Ajukan Tukar" onPress={handleSwap} loading={swapLoading} />
            </View>
          </>
        )}
      </Modal>
    </View>
  );
}
