import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { EmptyState } from "@components/shared/EmptyState";
import { ModuleIcon } from "@components/ui/ModuleIcon";
import { getBusinesses } from "@services/lapak.service";
import { useAuthStore } from "@stores/auth.store";
import { GRADIENTS, RADIUS, TYPO, SPACING } from "@utils/theme";
import type { Business, BusinessType } from "@app-types/lapak.types";

const TYPE_LABELS: Record<BusinessType, string> = {
  pedagang: "Pedagang/Warung",
  laundry: "Laundry",
  guru: "Guru/Pelatih",
  jasa_umum: "Jasa Umum",
};

export default function LapakScreen() {
  const insets = useSafeAreaInsets();
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
      <View style={{ flex: 1, backgroundColor: "#F8FAFC", paddingTop: insets.top }}>
        <EmptyState
          illustration="🏪"
          title="Belum ada usaha"
          description="Tambah usaha pertamamu untuk mulai catat penjualan"
          actionLabel="+ Tambah Usaha"
          onAction={() => router.push("/(provider)/(tabs)/lapak/create-biz")}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Gradient Header */}
      <LinearGradient
        colors={[...GRADIENTS.lapak]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + SPACING.sm,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.md,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
            <ModuleIcon module="lapak" size={22} color="#FFFFFF" />
            <Text style={{ ...TYPO.h2, color: "#FFFFFF" }}>Lapak</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(provider)/(tabs)/lapak/create-biz")}
            style={{
              backgroundColor: "rgba(255,255,255,0.25)",
              borderRadius: RADIUS.md,
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.35)",
            }}
          >
            <Text style={{ ...TYPO.captionBold, color: "#FFFFFF" }}>+ Tambah</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.md, paddingTop: SPACING.md }}
      >
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
            <Card variant="glass">
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: RADIUS.lg,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: SPACING.md,
                    overflow: "hidden",
                  }}
                >
                  <LinearGradient
                    colors={[...GRADIENTS.lapakLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: 48,
                      height: 48,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ModuleIcon module="lapak" size={24} />
                  </LinearGradient>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>
                    {biz.name}
                  </Text>
                  <Text style={{ ...TYPO.caption, color: "#64748B", marginTop: 2 }}>
                    {TYPE_LABELS[biz.type]}
                  </Text>
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
