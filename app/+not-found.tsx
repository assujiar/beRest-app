import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@stores/auth.store";

export default function NotFoundScreen() {
  const session = useAuthStore((s) => s.session);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (isLoading) return;

    // Auto-redirect to index after a short delay
    const timeout = setTimeout(() => {
      router.replace("/");
    }, 1500);

    return () => clearTimeout(timeout);
  }, [isLoading, session]);

  return (
    <View className="flex-1 bg-light-bg items-center justify-center px-6">
      <Text className="text-3xl font-bold text-navy mb-4">Apick</Text>
      <ActivityIndicator size="large" color="#156064" />
      <Text className="text-sm text-grey-text mt-4">Mengalihkan...</Text>
    </View>
  );
}
