import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useRoleStore } from "@stores/role.store";

export function RoleSwitcher() {
  const { role, activeView, toggleView } = useRoleStore();

  if (role !== "both") return null;

  function handleToggle() {
    toggleView();
    if (activeView === "provider") {
      router.replace("/(consumer)/(tabs)");
    } else {
      router.replace("/(provider)/(tabs)");
    }
  }

  return (
    <TouchableOpacity
      onPress={handleToggle}
      className="flex-row items-center bg-white rounded-full border border-border-color px-1 py-1"
      activeOpacity={0.7}
    >
      <View
        className={`
          rounded-full px-4 py-2
          ${activeView === "provider" ? "bg-navy" : ""}
        `}
      >
        <Text
          className={`text-xs font-bold ${activeView === "provider" ? "text-white" : "text-grey-text"}`}
        >
          Pengelola
        </Text>
      </View>
      <View
        className={`
          rounded-full px-4 py-2
          ${activeView === "consumer" ? "bg-navy" : ""}
        `}
      >
        <Text
          className={`text-xs font-bold ${activeView === "consumer" ? "text-white" : "text-grey-text"}`}
        >
          Pengguna
        </Text>
      </View>
    </TouchableOpacity>
  );
}
