import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { connectByCode } from "@services/connection.service";
import { useAuthStore } from "@stores/auth.store";
import { useUIStore } from "@stores/ui.store";

export default function ConnectByCodeScreen() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const profile = useAuthStore((s) => s.profile);
  const showToast = useUIStore((s) => s.showToast);

  async function handleConnect() {
    if (code.length < 4) {
      setError("Kode koneksi terlalu pendek");
      return;
    }
    if (!profile?.id) return;

    setLoading(true);
    setError("");
    try {
      await connectByCode(profile.id, code);
      showToast("Berhasil terhubung!", "success");
      router.back();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Kode tidak valid. Cek lagi ya."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg">
      <View className="flex-row items-center px-4 py-3 border-b border-border-color bg-white">
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text className="text-lg text-navy">← </Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-dark-text ml-2">
          Masukkan Kode
        </Text>
      </View>

      <View className="flex-1 px-6 justify-between">
        <View className="pt-8">
          <Text className="text-sm text-grey-text mb-4">
            Minta kode koneksi dari pengelola (pemilik kos, laundry, ketua RT, dll)
          </Text>
          <Input
            label="Kode Koneksi"
            placeholder="contoh: KOS-4829"
            value={code}
            onChangeText={(text) => {
              setCode(text.toUpperCase());
              setError("");
            }}
            error={error}
            autoCapitalize="characters"
            maxLength={10}
          />

          <TouchableOpacity
            onPress={() => router.push("/connect/scan")}
            className="flex-row items-center justify-center mt-4 py-3"
          >
            <Text className="text-base mr-2">📷</Text>
            <Text className="text-sm text-navy font-bold">
              Scan QR Code
            </Text>
          </TouchableOpacity>
        </View>

        <View className="pb-8">
          <Button
            title="Hubungkan"
            onPress={handleConnect}
            loading={loading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
