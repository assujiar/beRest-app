import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthStore } from "@stores/auth.store";
import { onAuthStateChange, getProfile } from "@services/auth.service";
import { useRoleStore } from "@stores/role.store";
import { useModulesStore } from "@stores/modules.store";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setRole = useRoleStore((s) => s.setRole);
  const setActiveView = useRoleStore((s) => s.setActiveView);
  const setActiveModules = useModulesStore((s) => s.setActiveModules);

  useEffect(() => {
    const { data } = onAuthStateChange(async (session) => {
      setSession(session);

      if (session) {
        const profile = await getProfile(session.user.id);
        if (profile) {
          setProfile(profile);
          setRole(profile.role ?? "consumer");
          setActiveView(
            profile.role === "consumer" ? "consumer" : "provider"
          );
          if (profile.active_modules?.length) {
            setActiveModules(profile.active_modules);
          }
        }
      } else {
        setProfile(null);
        setRole("consumer");
        setActiveModules([]);
      }

      setLoading(false);
    });

    return () => {
      data?.subscription?.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthInitializer>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(provider)" />
            <Stack.Screen name="(consumer)" />
            <Stack.Screen name="connect" />
          </Stack>
        </AuthInitializer>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
