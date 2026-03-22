import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { Badge } from "@components/ui/Badge";
import { useAuthStore } from "@stores/auth.store";
import { useRoleStore } from "@stores/role.store";
import { useConnectionsStore } from "@stores/connections.store";
import { signOut, getProfile } from "@services/auth.service";
import { getConsumerConnections } from "@services/connection.service";
import { formatDate } from "@utils/format";

export default function ConsumerProfileScreen() {
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const reset = useAuthStore((s) => s.reset);
  const role = useRoleStore((s) => s.role);
  const connections = useConnectionsStore((s) => s.connections);
  const setConnections = useConnectionsStore((s) => s.setConnections);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user.id) {
      getProfile(session.user.id).then((p) => {
        if (p) setProfile(p);
      });
      getConsumerConnections(session.user.id).then(setConnections);
    }
  }, [session?.user.id]);

  function handleLogout() {
    Alert.alert(
      "Keluar",
      "Yakin ingin keluar dari akun?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Keluar",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            await signOut();
            reset();
            router.replace("/(auth)/welcome");
          },
        },
      ]
    );
  }

  const activeCount = connections.filter((c) => c.status === "active").length;

  return (
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="px-4 py-3 border-b border-border-color bg-white">
        <Text className="text-lg font-bold text-dark-text">Profil</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-3">
        {/* Profile info */}
        <Card>
          <View className="items-center py-2">
            <View className="w-16 h-16 rounded-full bg-orange items-center justify-center mb-3">
              <Text className="text-2xl text-white font-bold">
                {(profile?.full_name ?? "?")[0].toUpperCase()}
              </Text>
            </View>
            <Text className="text-lg font-bold text-dark-text">
              {profile?.full_name ?? "Pengguna Apick"}
            </Text>
            {profile?.phone && (
              <Text className="text-sm text-grey-text mt-1">
                {profile.phone}
              </Text>
            )}
            {profile?.email && (
              <Text className="text-sm text-grey-text mt-0.5">
                {profile.email}
              </Text>
            )}
            <View className="flex-row mt-2">
              <Badge
                label={role === "both" ? "Pengelola & Pengguna" : "Pengguna"}
                variant="info"
              />
            </View>
            <TouchableOpacity
              className="mt-3 bg-orange/10 rounded-lg px-4 py-2"
              onPress={() => router.push("/edit-profile")}
            >
              <Text className="text-orange text-sm font-bold">Edit Profil</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Connections summary */}
        <Card>
          <Text className="text-xs text-grey-text mb-2">KONEKSI</Text>
          <View className="flex-row">
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-dark-text">
                {activeCount}
              </Text>
              <Text className="text-xs text-grey-text">Terhubung</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-dark-text">
                {connections.length - activeCount}
              </Text>
              <Text className="text-xs text-grey-text">Diarsipkan</Text>
            </View>
          </View>
        </Card>

        {/* Account info */}
        <Card>
          <Text className="text-xs text-grey-text mb-2">AKUN</Text>
          {profile?.created_at && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-grey-text">Bergabung</Text>
              <Text className="text-sm text-dark-text">
                {formatDate(profile.created_at)}
              </Text>
            </View>
          )}
          <View className="flex-row justify-between">
            <Text className="text-sm text-grey-text">User ID</Text>
            <Text className="text-xs text-grey-text font-mono">
              {session?.user.id.slice(0, 8)}...
            </Text>
          </View>
        </Card>

        {/* Linked auth methods */}
        <Card>
          <TouchableOpacity
            className="flex-row items-center justify-between"
            onPress={() => router.push("/linked-accounts")}
          >
            <View>
              <Text className="text-sm font-bold text-dark-text">Metode Login</Text>
              <Text className="text-xs text-grey-text mt-0.5">
                Kelola cara masuk ke akun kamu
              </Text>
            </View>
            <Text className="text-grey-text text-lg">{">"}</Text>
          </TouchableOpacity>
        </Card>

        {/* Logout */}
        <View className="mt-2 mb-8">
          <Button
            title="Keluar"
            variant="destructive"
            onPress={handleLogout}
            loading={loading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
