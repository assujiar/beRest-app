import "../global.css";
import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Notifications from "expo-notifications";
import * as Linking from "expo-linking";
import { useAuthStore } from "@stores/auth.store";
import { onAuthStateChange, getProfile } from "@services/auth.service";
import { registerPushToken } from "@services/notification.service";
import { useRoleStore } from "@stores/role.store";
import { useModulesStore } from "@stores/modules.store";
import { supabase } from "@services/supabase";

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

  // Handle magic link deep links (apick://auth/callback#access_token=...&refresh_token=...)
  useEffect(() => {
    function handleDeepLink(event: { url: string }) {
      const url = event.url;
      if (!url) return;

      // Extract tokens from fragment (#) or query params
      const hashIndex = url.indexOf("#");
      if (hashIndex === -1) return;

      const params = new URLSearchParams(url.substring(hashIndex + 1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        supabase.auth
          .setSession({ access_token: accessToken, refresh_token: refreshToken })
          .catch((err) => console.warn("[Apick] Magic link session error:", err));
      }
    }

    // Handle URL that launched the app
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    // Handle URL while app is open
    const linkSub = Linking.addEventListener("url", handleDeepLink);

    return () => {
      linkSub.remove();
    };
  }, []);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined;

    try {
      const { data } = onAuthStateChange(async (session) => {
        try {
          setSession(session);

          if (session) {
            let profile = null;
            try {
              profile = await getProfile(session.user.id);
            } catch (fetchErr) {
              console.warn("[Apick] Profile fetch failed (offline?):", fetchErr);
            }
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

            // Register push token after login
            registerPushToken(session.user.id).catch((err) =>
              console.warn("[Apick] Push token registration failed:", err)
            );
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

/** Handle notification tap → navigate to deep_link */
function NotificationHandler() {
  const router = useRouter();
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // When user taps a notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const deepLink =
          response.notification.request.content.data?.deep_link as
            | string
            | undefined;
        if (deepLink) {
          try {
            router.push(deepLink as any);
          } catch (err) {
            console.warn("[Apick] Deep link navigation failed:", err);
          }
        }
      });

    return () => {
      responseListener.current?.remove();
    };
  }, [router]);

  return null;
}

export default function RootLayout() {
  return (
    <AppErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <AuthInitializer>
            <NotificationHandler />
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="(provider)" />
              <Stack.Screen name="(consumer)" />
              <Stack.Screen name="connect" />
              <Stack.Screen name="linked-accounts" />
              <Stack.Screen name="edit-profile" />
              <Stack.Screen name="auth/callback" />
              <Stack.Screen name="+not-found" />
            </Stack>
          </AuthInitializer>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </AppErrorBoundary>
  );
}
