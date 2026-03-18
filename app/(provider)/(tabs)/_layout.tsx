import { Tabs } from "expo-router";
import { useModulesStore } from "@stores/modules.store";
import { MODULE_COLORS, MODULE_LABELS } from "@utils/colors";


export default function ProviderTabsLayout() {
  const activeModules = useModulesStore((s) => s.activeModules);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { height: 64, paddingBottom: 8, paddingTop: 4 },
        tabBarActiveTintColor: "#FF4600",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="lapak"
        options={{
          title: MODULE_LABELS.lapak,
          tabBarActiveTintColor: MODULE_COLORS.lapak,
          href: activeModules.includes("lapak") ? "/(provider)/(tabs)/lapak" : null,
        }}
      />
      <Tabs.Screen
        name="sewa"
        options={{
          title: MODULE_LABELS.sewa,
          tabBarActiveTintColor: MODULE_COLORS.sewa,
          href: activeModules.includes("sewa") ? "/(provider)/(tabs)/sewa" : null,
        }}
      />
      <Tabs.Screen
        name="warga"
        options={{
          title: MODULE_LABELS.warga,
          tabBarActiveTintColor: MODULE_COLORS.warga,
          href: activeModules.includes("warga") ? "/(provider)/(tabs)/warga" : null,
        }}
      />
      <Tabs.Screen
        name="hajat"
        options={{
          title: MODULE_LABELS.hajat,
          tabBarActiveTintColor: MODULE_COLORS.hajat,
          href: activeModules.includes("hajat") ? "/(provider)/(tabs)/hajat" : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
        }}
      />
    </Tabs>
  );
}
