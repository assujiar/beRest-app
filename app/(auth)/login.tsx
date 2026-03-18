import { useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { signInWithGoogle, signInWithPhone } from "@services/auth.service";
import { useUIStore } from "@stores/ui.store";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const showToast = useUIStore((s) => s.showToast);

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setError("");
    const { error: authError } = await signInWithGoogle();
    setGoogleLoading(false);
    if (authError) {
      setError("Login Google gagal. Coba lagi ya.");
    }
  }

  async function handlePhoneLogin() {
    if (phone.length < 10) {
      setError("Nomor HP minimal 10 digit ya");
      return;
    }

    setLoading(true);
    setError("");
    const formatted = phone.startsWith("0") ? `+62${phone.slice(1)}` : phone;
    const { error: authError } = await signInWithPhone(formatted);
    setLoading(false);

    if (authError) {
      setError("Gagal kirim kode OTP. Cek nomor HP kamu ya.");
      return;
    }

    showToast("Kode OTP sudah dikirim!", "success");
    router.push({ pathname: "/(auth)/otp", params: { phone: formatted } });
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg">
      <View className="flex-1 px-6 justify-between">
        {/* Top section */}
        <View className="items-center pt-16">
          <Text className="text-4xl font-bold text-navy">Apick</Text>
          <Text className="text-base text-grey-text mt-2">
            Life, well arranged.
          </Text>
        </View>

        {/* Bottom section - thumb zone */}
        <View className="pb-8">
          {error ? (
            <Text className="text-sm text-red-500 text-center mb-4">
              {error}
            </Text>
          ) : null}

          <Input
            placeholder="contoh: 08123456789"
            value={phone}
            onChangeText={(text) => {
              setPhone(text.replace(/\D/g, ""));
              setError("");
            }}
            keyboardType="phone-pad"
            label="Nomor HP"
          />

          <View className="mt-4">
            <Button
              title="Masuk dengan Nomor HP"
              onPress={handlePhoneLogin}
              loading={loading}
            />
          </View>

          <View className="flex-row items-center my-5">
            <View className="flex-1 h-px bg-border-color" />
            <Text className="mx-4 text-sm text-grey-text">atau</Text>
            <View className="flex-1 h-px bg-border-color" />
          </View>

          <Button
            title="Masuk dengan Google"
            variant="secondary"
            onPress={handleGoogleLogin}
            loading={googleLoading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
