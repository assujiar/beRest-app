import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@stores/auth.store";

export default function AuthCallbackScreen() {
  const session = useAuthStore((s) => s.session);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    // Token extraction already handled by _layout.tsx deep link handler.
    // Once session is set via onAuthStateChange, redirect to index for routing.
    if (!isLoading && session) {
      router.replace("/");
    }
  }, [isLoading, session]);

  return (
    <View className="flex-1 bg-light-bg items-center justify-center">
      <Text className="text-3xl font-bold text-navy mb-4">Apick</Text>
      <ActivityIndicator size="large" color="#156064" />
      <Text className="text-sm text-grey-text mt-4">Sedang masuk...</Text>
    </View>
  );
}
