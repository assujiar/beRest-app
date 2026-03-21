import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { useRoleStore } from "@stores/role.store";
import { useAuthStore } from "@stores/auth.store";
import { upsertProfile } from "@services/auth.service";

type Step = "input" | "detected";

interface DetectedConnection {
  id: string;
  providerName: string;
  module: string;
  role: string;
  checked: boolean;
}

export default function ConsumerOnboardingScreen() {
  const [step, _setStep] = useState<Step>("input");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [detected, setDetected] = useState<DetectedConnection[]>([]);
  const setRole = useRoleStore((s) => s.setRole);
  const setActiveView = useRoleStore((s) => s.setActiveView);
  const session = useAuthStore((s) => s.session);
  const setProfile = useAuthStore((s) => s.setProfile);

  function handleCodeSubmit() {
    if (code.length < 6) {
      setError("Kode koneksi harus 6 karakter");
      return;
    }
    // TODO: Verify code via connection service
    goToConsumerHome();
  }

  function handleScanQR() {
    router.push("/connect/scan");
  }

  function toggleDetected(id: string) {
    setDetected((prev) =>
      prev.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c))
    );
  }

  function handleConfirmDetected() {
    // TODO: Confirm detected connections via service
    goToConsumerHome();
  }

  async function goToConsumerHome() {
    setSaving(true);

    // Persist role to Supabase
    if (session?.user.id) {
      const { data } = await upsertProfile(session.user.id, {
        role: "consumer",
      });
      if (data) setProfile(data);
    }

    setRole("consumer");
    setActiveView("consumer");
    setSaving(false);
    router.replace("/(consumer)/(tabs)");
  }

  if (step === "detected" && detected.length > 0) {
    return (
      <SafeAreaView className="flex-1 bg-light-bg">
        <View className="flex-1 px-6 justify-between">
          <View className="pt-8">
            <Text className="text-2xl font-bold text-dark-text">
              Kami menemukan kamu terhubung dengan:
            </Text>
            <View className="mt-6">
              {detected.map((conn) => (
                <TouchableOpacity
                  key={conn.id}
                  onPress={() => toggleDetected(conn.id)}
                  className="flex-row items-center bg-white rounded-xl p-4 mb-3 border border-border-color"
                >
                  <View
                    className={`
                      w-6 h-6 rounded border-2 items-center justify-center mr-3
                      ${conn.checked ? "bg-orange border-orange" : "border-border-color"}
                    `}
                  >
                    {conn.checked && (
                      <Text className="text-white text-xs font-bold">✓</Text>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-dark-text">
                      {conn.providerName}
                    </Text>
                    <Text className="text-sm text-grey-text">
                      {conn.role}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="pb-8">
            <Button title="Konfirmasi" onPress={handleConfirmDetected} loading={saving} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg">
      <View className="flex-1 px-6 justify-between">
        <View className="pt-8">
          <Text className="text-2xl font-bold text-dark-text">
            Masukkan kode koneksi
          </Text>
          <Text className="text-sm text-grey-text mt-2">
            Minta kode dari pengelola (pemilik kos, laundry, ketua RT, dll)
          </Text>

          <View className="mt-8">
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
          </View>

          <TouchableOpacity
            onPress={handleScanQR}
            className="flex-row items-center justify-center mt-4 py-3"
          >
            <Text className="text-base mr-2">📷</Text>
            <Text className="text-sm text-navy font-bold">
              Scan QR Code
            </Text>
          </TouchableOpacity>
        </View>

        <View className="pb-8">
          <Button title="Hubungkan" onPress={handleCodeSubmit} loading={saving} />
          <TouchableOpacity
            onPress={goToConsumerHome}
            className="mt-4 items-center py-2"
          >
            <Text className="text-sm text-grey-text">
              Belum punya kode? Lewati dulu
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
