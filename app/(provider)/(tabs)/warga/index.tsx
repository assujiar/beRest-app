import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { EmptyState } from "@components/shared/EmptyState";
import { ModuleIcon } from "@components/ui/ModuleIcon";
import { getOrganizations } from "@services/warga.service";
import { useAuthStore } from "@stores/auth.store";
import { GRADIENTS, RADIUS, TYPO, SPACING } from "@utils/theme";
import { COLORS } from "@utils/colors";
import type { Organization } from "@app-types/warga.types";

const ORG_TYPE_LABELS: Record<string, string> = {
  rt_rw: "RT/RW",
  komplek: "Komplek",
  mesjid: "Mesjid",
  pengajian: "Pengajian",
  klub: "Klub",
  sekolah: "Sekolah",
  alumni: "Alumni",
  other: "Lainnya",
};

export default function WargaScreen() {
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((s) => s.profile);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (profile?.id) loadOrgs();
    }, [profile?.id])
  );

  async function loadOrgs() {
    try {
      const data = await getOrganizations(profile!.id);
      setOrgs(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  if (!loading && orgs.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.lightBg, paddingTop: insets.top }}>
        <EmptyState
          illustration="👥"
          title="Belum ada organisasi"
          description="Buat organisasi pertamamu (RT, mesjid, pengajian, dll)"
          actionLabel="+ Buat Organisasi"
          onAction={() => router.push("/(provider)/(tabs)/warga/create-org")}
        />
      </View>
    );
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
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
            <ModuleIcon module="warga" size={24} color="#FFFFFF" />
            <Text style={{ ...TYPO.h2, color: "#FFFFFF" }}>Warga</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(provider)/(tabs)/warga/create-org")}
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: RADIUS.md,
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.3)",
            }}
          >
            <Text style={{ ...TYPO.captionBold, color: "#FFFFFF" }}>+ Buat</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.md, paddingBottom: SPACING.xxl }}
      >
        <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: SPACING.sm }}>
          ORGANISASI KAMU
        </Text>

        {orgs.map((org) => (
          <TouchableOpacity
            key={org.id}
            onPress={() =>
              router.push({
                pathname: "/(provider)/(tabs)/warga/org-detail",
                params: { orgId: org.id, orgName: org.name },
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
                    borderRadius: RADIUS.full,
                    backgroundColor: "rgba(251,143,103,0.12)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: SPACING.md,
                  }}
                >
                  <ModuleIcon module="warga" size={24} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ ...TYPO.bodyBold, color: COLORS.darkText }}>
                    {org.name}
                  </Text>
                  <Text style={{ ...TYPO.caption, color: COLORS.greyText, marginTop: 2 }}>
                    {ORG_TYPE_LABELS[org.type] ?? org.type}
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
