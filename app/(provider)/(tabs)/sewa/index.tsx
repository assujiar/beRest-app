import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { EmptyState } from "@components/shared/EmptyState";
import { getProperties, getPropertySummary } from "@services/sewa.service";
import { useAuthStore } from "@stores/auth.store";
import type { Property, PropertyType } from "@app-types/sewa.types";

const TYPE_LABELS: Record<PropertyType, string> = {
  kos: "Kos", kontrakan: "Kontrakan", rumah_sewa: "Rumah Sewa", apartment: "Apartment",
};

export default function SewaScreen() {
  const profile = useAuthStore((s) => s.profile);
  const [properties, setProperties] = useState<(Property & { summary?: { occupied: number; total: number } })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (profile?.id) loadData(); }, [profile?.id]);

  async function loadData() {
    try {
      const props = await getProperties(profile!.id);
      const withSummary = await Promise.all(props.map(async (p) => {
        const summary = await getPropertySummary(p.id);
        return { ...p, summary: { occupied: summary.occupied, total: summary.total } };
      }));
      setProperties(withSummary);
    } catch { /* silent */ } finally { setLoading(false); }
  }

  if (!loading && properties.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
        <EmptyState illustration="🏠" title="Belum ada properti" description="Tambah kos atau properti sewa pertamamu" actionLabel="+ Tambah Properti" onAction={() => router.push("/(provider)/(tabs)/sewa/create-prop")} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="text-xl font-bold text-dark-text">Sewa</Text>
        <TouchableOpacity onPress={() => router.push("/(provider)/(tabs)/sewa/create-prop")} className="bg-sewa rounded-lg px-4 py-2">
          <Text className="text-white text-sm font-bold">+ Tambah</Text>
        </TouchableOpacity>
      </View>
      <ScrollView className="flex-1 px-4">
        {properties.map((p) => (
          <TouchableOpacity key={p.id} onPress={() => router.push({ pathname: "/(provider)/(tabs)/sewa/prop-detail", params: { propId: p.id, propName: p.name } })} activeOpacity={0.7}>
            <Card>
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full bg-sewa/10 items-center justify-center mr-3">
                  <Text className="text-xl">🏠</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-dark-text">{p.name}</Text>
                  <Text className="text-xs text-grey-text">{TYPE_LABELS[p.type]} • {p.summary?.occupied ?? 0}/{p.summary?.total ?? 0} terisi</Text>
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
