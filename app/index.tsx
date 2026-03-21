import { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@stores/auth.store";

export default function Index() {
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (isLoading) return;

    if (!session) {
      // Not logged in → welcome screen
      router.replace("/(auth)/welcome");
      return;
    }

    if (!profile?.role || profile.role === "consumer") {
      // No role set or consumer → check if onboarded
      if (!profile?.active_modules || profile.active_modules.length === 0) {
        // If role is set but no modules (consumer), go to consumer home
        if (profile?.role === "consumer") {
          router.replace("/(consumer)/(tabs)");
          return;
        }
        // New user, needs onboarding
        router.replace("/(onboarding)/provider");
        return;
      }
    }

    // Has role + modules → go to the right home
    if (profile?.role === "provider" || profile?.role === "both") {
      router.replace("/(provider)/(tabs)");
    } else {
      router.replace("/(consumer)/(tabs)");
    }
  }, [isLoading, session, profile]);

  return (
    <View className="flex-1 bg-light-bg items-center justify-center">
      <Text className="text-3xl font-bold text-navy mb-4">Apick</Text>
      <ActivityIndicator size="large" color="#FF4600" />
    </View>
  );
}
