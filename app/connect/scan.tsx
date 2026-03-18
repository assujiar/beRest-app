import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Button } from "@components/ui/Button";
import { connectByCode } from "@services/connection.service";
import { useAuthStore } from "@stores/auth.store";
import { useUIStore } from "@stores/ui.store";

export default function ScanQRScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const profile = useAuthStore((s) => s.profile);
  const showToast = useUIStore((s) => s.showToast);

  async function handleBarCodeScanned({ data }: { data: string }) {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);

    try {
      // Extract code from QR data (could be a URL or plain code)
      let code = data;
      if (data.includes("apick.id")) {
        const segments = data.split("/").filter(Boolean);
        code = segments[segments.length - 1];
      }

      if (profile?.id) {
        await connectByCode(profile.id, code);
        showToast("Berhasil terhubung!", "success");
        router.back();
      }
    } catch {
      showToast("Kode QR tidak valid. Coba lagi.", "error");
      setScanned(false);
    } finally {
      setLoading(false);
    }
  }

  if (!permission?.granted) {
    return (
      <SafeAreaView className="flex-1 bg-light-bg items-center justify-center px-6">
        <Text className="text-base text-dark-text text-center mb-4">
          Izinkan Apick mengakses kamera untuk scan QR Code
        </Text>
        <Button title="Izinkan Kamera" onPress={requestPermission} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="absolute top-12 left-0 right-0 z-10 flex-row items-center px-4">
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text className="text-lg text-white">← </Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-white ml-2">
          Scan QR Code
        </Text>
      </View>

      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      <View className="absolute bottom-0 left-0 right-0 bg-black/50 px-6 py-6">
        <Text className="text-sm text-white text-center">
          Arahkan kamera ke QR Code dari pengelola
        </Text>
        {scanned && (
          <TouchableOpacity
            onPress={() => setScanned(false)}
            className="mt-3 items-center"
          >
            <Text className="text-sm text-orange font-bold">
              Scan ulang
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
