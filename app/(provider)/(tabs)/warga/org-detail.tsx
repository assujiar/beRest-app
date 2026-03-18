import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@components/ui/Card";

const MENU_ITEMS = [
  { icon: "👥", label: "Anggota", route: "members" },
  { icon: "💰", label: "Iuran", route: "dues" },
  { icon: "📊", label: "Keuangan", route: "finance" },
  { icon: "📢", label: "Pengumuman", route: "announcements" },
  { icon: "🤲", label: "Infaq/Donasi", route: "infaq" },
  { icon: "🎯", label: "Penggalangan Dana", route: "fundraising" },
] as const;

export default function OrgDetailScreen() {
  const { orgId, orgName } = useLocalSearchParams<{
    orgId: string;
    orgName: string;
  }>();

  function navigateTo(route: string) {
    router.push({
      pathname: `/(provider)/(tabs)/warga/${route}`,
      params: { orgId, orgName },
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-border-color bg-white">
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text className="text-lg text-navy">←</Text>
        </TouchableOpacity>
        <View className="flex-1 ml-3">
          <Text className="text-lg font-bold text-dark-text">{orgName}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        <View className="flex-row flex-wrap">
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.route}
              onPress={() => navigateTo(item.route)}
              className="w-[48%] mr-[4%] mb-3"
              style={{ marginRight: MENU_ITEMS.indexOf(item) % 2 === 1 ? 0 : "4%" }}
              activeOpacity={0.7}
            >
              <Card>
                <View className="items-center py-2">
                  <Text className="text-3xl mb-2">{item.icon}</Text>
                  <Text className="text-sm font-bold text-dark-text">
                    {item.label}
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
