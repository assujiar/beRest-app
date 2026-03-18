import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { RoleSwitcher } from "@components/shared/RoleSwitcher";
import { EmptyState } from "@components/shared/EmptyState";
import { useConnectionsStore } from "@stores/connections.store";
import { useAuthStore } from "@stores/auth.store";
import { MODULE_COLORS, MODULE_LABELS } from "@utils/colors";
import type { ConsumerConnection, ModuleKey } from "@app-types/shared.types";

const MODULE_ICONS: Record<ModuleKey, string> = {
  lapak: "🏪",
  sewa: "🏠",
  warga: "👥",
  hajat: "🎉",
};

function ConnectionCard({ connection }: { connection: ConsumerConnection }) {
  return (
    <TouchableOpacity
      onPress={() =>
        router.push(`/(consumer)/${connection.module}/${connection.id}`)
      }
      activeOpacity={0.7}
    >
      <Card>
        <View className="flex-row items-center">
          <Text className="text-2xl mr-3">
            {MODULE_ICONS[connection.module]}
          </Text>
          <View className="flex-1">
            <Text className="text-base font-bold text-dark-text">
              {connection.notes ?? "Provider"}
            </Text>
            <Text
              className="text-xs mt-0.5"
              style={{ color: MODULE_COLORS[connection.module] }}
            >
              {MODULE_LABELS[connection.module]}
            </Text>
          </View>
          <Badge
            label={connection.status === "active" ? "Aktif" : "Pending"}
            variant={connection.status === "active" ? "success" : "warning"}
          />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export default function ConsumerHomeScreen() {
  const connections = useConnectionsStore((s) => s.connections);
  const profile = useAuthStore((s) => s.profile);
  const name = profile?.full_name ?? "Pengguna";

  const activeConnections = connections.filter(
    (c) => c.status === "active" || c.status === "pending"
  );

  return (
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-sm text-grey-text">Halo,</Text>
            <Text className="text-xl font-bold text-dark-text">{name}</Text>
          </View>
          <RoleSwitcher />
        </View>

        {/* Connected providers */}
        {activeConnections.length > 0 ? (
          <>
            <Text className="text-sm font-bold text-grey-text mb-3">
              TERHUBUNG DENGAN
            </Text>
            {activeConnections.map((conn) => (
              <ConnectionCard key={conn.id} connection={conn} />
            ))}
          </>
        ) : (
          <EmptyState
            illustration="🔗"
            title="Belum terhubung dengan siapapun"
            description="Masukkan kode koneksi atau scan QR dari pengelola"
            actionLabel="Hubungkan"
            onAction={() => router.push("/connect/code")}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
