import "../global.css";
import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthStore } from "@stores/auth.store";
import { onAuthStateChange, getProfile } from "@services/auth.service";
import { useRoleStore } from "@stores/role.store";
import { useModulesStore } from "@stores/modules.store";

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[Apick] App crash caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
            backgroundColor: "#F8FAFC",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#1E293B",
              marginBottom: 8,
            }}
          >
            Oops, terjadi kesalahan
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#64748B",
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            Aplikasi mengalami error. Coba buka ulang aplikasi.
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false, error: null })}
            style={{
              backgroundColor: "#156064",
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>
              Coba Lagi
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

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
    let subscription: { unsubscribe: () => void } | undefined;

    try {
      const { data } = onAuthStateChange(async (session) => {
        try {
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
        } catch (error) {
          console.warn("[Apick] Auth state error:", error);
        } finally {
          setLoading(false);
        }
      });
      subscription = data?.subscription;
    } catch (error) {
      console.warn("[Apick] Auth init error:", error);
      setLoading(false);
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AppErrorBoundary>
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
    </AppErrorBoundary>
  );
}
