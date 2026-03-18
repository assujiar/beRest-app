import { Tabs } from "expo-router";

export default function ConsumerTabsLayout() {
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
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifikasi",
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
