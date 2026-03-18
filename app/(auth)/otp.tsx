import { useState, useRef } from "react";
import { View, Text, TextInput } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@components/ui/Button";
import { verifyOtp, signInWithPhone } from "@services/auth.service";
import { useUIStore } from "@stores/ui.store";

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputs = useRef<(TextInput | null)[]>([]);
  const showToast = useUIStore((s) => s.showToast);

  function handleChange(text: string, index: number) {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setError("");

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits filled
    if (text && index === 5 && newOtp.every((d) => d)) {
      handleVerify(newOtp.join(""));
    }
  }

  function handleKeyPress(key: string, index: number) {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  async function handleVerify(code?: string) {
    const token = code ?? otp.join("");
    if (token.length < 6) {
      setError("Masukkan 6 digit kode OTP");
      return;
    }

    setLoading(true);
    setError("");
    const { error: authError } = await verifyOtp(phone ?? "", token);
    setLoading(false);

    if (authError) {
      setError("Kode OTP salah. Cek lagi ya.");
      return;
    }

    // Auth state change will handle navigation
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    await signInWithPhone(phone ?? "");
    showToast("Kode OTP baru sudah dikirim!", "success");
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg">
      <View className="flex-1 px-6 justify-between">
        {/* Top */}
        <View className="pt-16">
          <Text className="text-2xl font-bold text-dark-text">
            Masukkan Kode OTP
          </Text>
          <Text className="text-sm text-grey-text mt-2">
            Kode 6 digit sudah dikirim ke {phone}
          </Text>

          {/* OTP inputs */}
          <View className="flex-row justify-between mt-8">
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(ref) => { inputs.current[i] = ref; }}
                className={`
                  w-12 h-14 rounded-lg border text-center text-xl font-bold text-dark-text
                  ${error ? "border-red-500" : digit ? "border-navy" : "border-border-color"}
                `}
                maxLength={1}
                keyboardType="number-pad"
                value={digit}
                onChangeText={(text) => handleChange(text, i)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(nativeEvent.key, i)
                }
              />
            ))}
          </View>

          {error ? (
            <Text className="text-sm text-red-500 mt-3">{error}</Text>
          ) : null}

          <Text
            className={`text-sm mt-4 ${resendCooldown > 0 ? "text-grey-text" : "text-navy font-bold"}`}
            onPress={handleResend}
          >
            {resendCooldown > 0
              ? `Kirim ulang kode dalam ${resendCooldown} detik`
              : "Kirim ulang kode OTP"}
          </Text>
        </View>

        {/* Bottom - thumb zone */}
        <View className="pb-8">
          <Button
            title="Verifikasi"
            onPress={() => handleVerify()}
            loading={loading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
