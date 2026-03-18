import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Card } from "@components/ui/Card";
import { EmptyState } from "@components/shared/EmptyState";
import { useConnectionsStore } from "@stores/connections.store";
import { useAuthStore } from "@stores/auth.store";
import { getArchivedConnections } from "@services/connection.service";
import { restoreConnection } from "@services/connection-lifecycle.service";
import { MODULE_LABELS } from "@utils/colors";
import { formatDate } from "@utils/format";
import type { ConsumerConnection, ModuleKey } from "@app-types/shared.types";

const MODULE_ICONS: Record<ModuleKey, string> = {
  lapak: "🏪",
  sewa: "🏠",
  warga: "👥",
  hajat: "🎉",
};

export default function RiwayatScreen() {
  const profile = useAuthStore((s) => s.profile);
  const archivedConnections = useConnectionsStore((s) => s.archivedConnections);
  const setArchivedConnections = useConnectionsStore(
    (s) => s.setArchivedConnections
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      loadArchived();
    }
  }, [profile?.id]);

  async function loadArchived() {
    try {
      const data = await getArchivedConnections(profile!.id);
      setArchivedConnections(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore(conn: ConsumerConnection) {
    Alert.alert(
      "Hubungkan Kembali?",
      `Kamu akan terhubung kembali ke ${conn.notes ?? "provider ini"}.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Hubungkan",
          onPress: async () => {
            try {
              await restoreConnection(conn.id);
              loadArchived();
            } catch {
              Alert.alert("Gagal", "Tidak bisa menghubungkan kembali. Coba lagi.");
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-border-color bg-white">
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text className="text-lg text-navy">← </Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-dark-text ml-2">
          Riwayat Koneksi
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {archivedConnections.length === 0 && !loading ? (
          <EmptyState
            illustration="📦"
            title="Belum ada riwayat"
            description="Koneksi yang diarsipkan akan muncul di sini"
          />
        ) : (
          archivedConnections.map((conn) => (
            <Card key={conn.id}>
              <View className="flex-row items-center">
                <Text className="text-xl mr-3">
                  {MODULE_ICONS[conn.module]}
                </Text>
                <View className="flex-1">
                  <Text className="text-base font-bold text-dark-text">
                    {conn.notes ?? "Provider"}
                  </Text>
                  <Text className="text-xs text-grey-text mt-0.5">
                    {MODULE_LABELS[conn.module]} • Diarsipkan{" "}
                    {conn.archived_at ? formatDate(conn.archived_at) : "-"}
                  </Text>
                  {conn.archive_reason && (
                    <Text className="text-xs text-grey-text mt-0.5">
                      Alasan: {conn.archive_reason}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => handleRestore(conn)}
                  className="bg-navy/10 rounded-lg px-3 py-2"
                >
                  <Text className="text-xs font-bold text-navy">
                    Hubungkan
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
