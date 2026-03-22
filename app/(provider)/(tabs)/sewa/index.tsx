import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { ModuleIcon } from "@components/ui/ModuleIcon";
import { EmptyState } from "@components/shared/EmptyState";
import { getProperties, getPropertySummary } from "@services/sewa.service";
import { useAuthStore } from "@stores/auth.store";
import { GRADIENTS, RADIUS, TYPO, SPACING } from "@utils/theme";
import type { Property, PropertyType } from "@app-types/sewa.types";

const TYPE_LABELS: Record<PropertyType, string> = {
  kos: "Kos", kontrakan: "Kontrakan", rumah_sewa: "Rumah Sewa", apartment: "Apartment",
};

function PlusIcon({ size = 16, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5V19M5 12H19" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

export default function SewaScreen() {
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((s) => s.profile);
  const [properties, setProperties] = useState<(Property & { summary?: { occupied: number; total: number } })[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (profile?.id) loadData();
    }, [profile?.id])
  );

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
      <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
        <LinearGradient
          colors={GRADIENTS.sewa}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: insets.top + SPACING.sm,
            paddingBottom: SPACING.xl,
            paddingHorizontal: SPACING.lg,
            borderBottomLeftRadius: RADIUS.xxl,
            borderBottomRightRadius: RADIUS.xxl,
          }}
        >
          <Text style={{ ...TYPO.h2, color: "#FFFFFF" }}>Sewa</Text>
        </LinearGradient>
        <EmptyState illustration="🏠" title="Belum ada properti" description="Tambah kos atau properti sewa pertamamu" actionLabel="+ Tambah Properti" onAction={() => router.push("/(provider)/(tabs)/sewa/create-prop")} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Gradient Header */}
      <LinearGradient
        colors={GRADIENTS.sewa}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + SPACING.sm,
          paddingBottom: SPACING.xl,
          paddingHorizontal: SPACING.lg,
          borderBottomLeftRadius: RADIUS.xxl,
          borderBottomRightRadius: RADIUS.xxl,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ ...TYPO.h2, color: "#FFFFFF" }}>Sewa</Text>
          <TouchableOpacity
            onPress={() => router.push("/(provider)/(tabs)/sewa/create-prop")}
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
            <PlusIcon size={14} />
            <Text style={{ ...TYPO.captionBold, color: "#FFFFFF" }}>Tambah</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.lg, paddingTop: SPACING.md }}
      >
        {properties.map((p) => (
          <TouchableOpacity key={p.id} onPress={() => router.push({ pathname: "/(provider)/(tabs)/sewa/prop-detail", params: { propId: p.id, propName: p.name } })} activeOpacity={0.7}>
            <Card variant="glass">
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ModuleIcon module="sewa" size={24} withBackground />
                <View style={{ flex: 1, marginLeft: SPACING.md }}>
                  <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>{p.name}</Text>
                  <Text style={{ ...TYPO.caption, color: "#64748B", marginTop: 2 }}>{TYPE_LABELS[p.type]} {"\u2022"} {p.summary?.occupied ?? 0}/{p.summary?.total ?? 0} terisi</Text>
                </View>
                <Badge label="Aktif" variant="success" />
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
