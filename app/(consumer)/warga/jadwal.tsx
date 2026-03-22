import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Modal } from "@components/ui/Modal";
import { useAuthStore } from "@stores/auth.store";
import { useUIStore } from "@stores/ui.store";
import { getMySchedules, requestSwap } from "@services/warga-jadwal.service";
import { formatDate } from "@utils/format";
import type { WargaSchedule, ScheduleType } from "@app-types/sewa.types";

const TYPE_LABELS: Record<ScheduleType, string> = {
  piket: "Piket",
  ronda: "Ronda",
  kebersihan: "Kebersihan",
  custom: "Lainnya",
};

const TYPE_ICONS: Record<ScheduleType, string> = {
  piket: "🧹",
  ronda: "🔦",
  kebersihan: "♻️",
  custom: "📋",
};

export default function ConsumerJadwalScreen() {
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
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-border-color bg-white">
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text className="text-lg text-navy">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-dark-text ml-3">
          Jadwal {orgName ?? ""}
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-3"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {schedules.length === 0 ? (
          <View className="items-center py-16">
            <Text className="text-4xl mb-3">📅</Text>
            <Text className="text-base font-bold text-grey-text">
              Belum ada jadwal
            </Text>
            <Text className="text-sm text-grey-text mt-1">
              Jadwal dari pengelola akan muncul di sini
            </Text>
          </View>
        ) : (
          <>
            {upcoming.length > 0 && (
              <>
                <Text className="text-xs font-bold text-grey-text mb-2">
                  MENDATANG
                </Text>
                {upcoming.map((s) => (
                  <Card key={s.id}>
                    <View className="flex-row items-center">
                      <Text className="text-xl mr-3">
                        {TYPE_ICONS[s.type]}
                      </Text>
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-dark-text">
                          {s.title}
                        </Text>
                        <Text className="text-xs text-grey-text">
                          {formatDate(s.date)}
                        </Text>
                        {s.is_swapped && s.swap_with_name && (
                          <Text className="text-xs text-orange mt-1">
                            Tukar dengan {s.swap_with_name}
                          </Text>
                        )}
                      </View>
                      {!s.is_swapped && (
                        <TouchableOpacity onPress={() => handleOpenSwap(s)} className="bg-warga/10 rounded-lg px-2 py-1 mr-2">
                          <Text className="text-xs font-bold text-warga">Tukar</Text>
                        </TouchableOpacity>
                      )}
                      <Badge
                        label={TYPE_LABELS[s.type]}
                        variant="info"
                      />
                    </View>
                  </Card>
                ))}
              </>
            )}

            {past.length > 0 && (
              <>
                <Text className="text-xs font-bold text-grey-text mb-2 mt-4">
                  SELESAI
                </Text>
                {past.map((s) => (
                  <Card key={s.id} className="opacity-60">
                    <View className="flex-row items-center">
                      <Text className="text-xl mr-3">
                        {TYPE_ICONS[s.type]}
                      </Text>
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-dark-text">
                          {s.title}
                        </Text>
                        <Text className="text-xs text-grey-text">
                          {formatDate(s.date)}
                        </Text>
                      </View>
                      <Badge
                        label={TYPE_LABELS[s.type]}
                        variant="neutral"
                      />
                    </View>
                  </Card>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Swap Modal */}
      <Modal visible={showSwap} onClose={() => setShowSwap(false)} title="Tukar Jadwal">
        {swapSchedule && (
          <>
            <Text className="text-sm text-grey-text mb-1">
              Jadwal: <Text className="font-bold text-dark-text">{swapSchedule.title}</Text>
            </Text>
            <Text className="text-sm text-grey-text mb-4">
              Tanggal: <Text className="font-bold text-dark-text">{formatDate(swapSchedule.date)}</Text>
            </Text>
            <Input
              label="Nama yang menggantikan"
              placeholder="contoh: Pak Budi"
              value={swapName}
              onChangeText={setSwapName}
            />
            <View className="mt-4">
              <Button title="Ajukan Tukar" onPress={handleSwap} loading={swapLoading} />
            </View>
          </>
        )}
      </Modal>
    </SafeAreaView>
  );
}
