import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { EmptyState } from "@components/shared/EmptyState";
import { getBusinesses } from "@services/lapak.service";
import { useAuthStore } from "@stores/auth.store";
import type { Business, BusinessType } from "@app-types/lapak.types";

const TYPE_LABELS: Record<BusinessType, string> = {
  pedagang: "Pedagang/Warung",
  laundry: "Laundry",
  guru: "Guru/Pelatih",
  jasa_umum: "Jasa Umum",
};

export default function LapakScreen() {
  const profile = useAuthStore((s) => s.profile);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) loadData();
  }, [profile?.id]);

  async function loadData() {
    try {
      const data = await getBusinesses(profile!.id);
      setBusinesses(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  if (!loading && businesses.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
        <EmptyState
          illustration="🏪"
          title="Belum ada usaha"
          description="Tambah usaha pertamamu untuk mulai catat penjualan"
          actionLabel="+ Tambah Usaha"
          onAction={() => router.push("/(provider)/(tabs)/lapak/create-biz")}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="text-xl font-bold text-dark-text">Lapak</Text>
        <TouchableOpacity
          onPress={() => router.push("/(provider)/(tabs)/lapak/create-biz")}
          className="bg-lapak rounded-lg px-4 py-2"
        >
          <Text className="text-white text-sm font-bold">+ Tambah</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4">
        {businesses.map((biz) => (
          <TouchableOpacity
            key={biz.id}
            onPress={() =>
              router.push({
                pathname: "/(provider)/(tabs)/lapak/dashboard",
                params: { bizId: biz.id, bizName: biz.name },
              })
            }
            activeOpacity={0.7}
          >
            <Card>
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full bg-lapak/10 items-center justify-center mr-3">
                  <Text className="text-xl">🏪</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-dark-text">
                    {biz.name}
                  </Text>
                  <Text className="text-xs text-grey-text mt-0.5">
                    {TYPE_LABELS[biz.type]}
                  </Text>
                </View>
                <Badge label="Aktif" variant="success" />
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
