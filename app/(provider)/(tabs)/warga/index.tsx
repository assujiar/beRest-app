import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { EmptyState } from "@components/shared/EmptyState";
import { getOrganizations } from "@services/warga.service";
import { useAuthStore } from "@stores/auth.store";
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
  const profile = useAuthStore((s) => s.profile);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) loadOrgs();
  }, [profile?.id]);

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
      <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
        <EmptyState
          illustration="👥"
          title="Belum ada organisasi"
          description="Buat organisasi pertamamu (RT, mesjid, pengajian, dll)"
          actionLabel="+ Buat Organisasi"
          onAction={() => router.push("/(provider)/(tabs)/warga/create-org")}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="text-xl font-bold text-dark-text">Warga</Text>
        <TouchableOpacity
          onPress={() => router.push("/(provider)/(tabs)/warga/create-org")}
          className="bg-warga rounded-lg px-4 py-2"
        >
          <Text className="text-white text-sm font-bold">+ Buat</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4">
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
            <Card>
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full bg-warga/10 items-center justify-center mr-3">
                  <Text className="text-xl">👥</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-dark-text">
                    {org.name}
                  </Text>
                  <Text className="text-xs text-grey-text mt-0.5">
                    {ORG_TYPE_LABELS[org.type] ?? org.type}
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
