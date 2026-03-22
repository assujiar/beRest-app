import { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@components/ui/Button";
import { verifyOtp, verifyEmailOtp, signInWithPhone, signInWithEmail } from "@services/auth.service";
import { useUIStore } from "@stores/ui.store";

export default function OtpScreen() {
  const { phone, email, via } = useLocalSearchParams<{
    phone?: string;
    email?: string;
    via?: "phone" | "email";
  }>();

  const isEmail = via === "email";
  const destination = isEmail ? email : phone;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpFailCount, setOtpFailCount] = useState(0);
  const [magicLinkMode, setMagicLinkMode] = useState(false);
  const [magicLinkSending, setMagicLinkSending] = useState(false);
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

    const { error: authError } = isEmail
      ? await verifyEmailOtp(email ?? "", token)
      : await verifyOtp(phone ?? "", token);

    setLoading(false);

    if (authError) {
      const newFailCount = otpFailCount + 1;
      setOtpFailCount(newFailCount);
      setError(authError.message ?? "Kode OTP salah. Cek lagi ya.");
      return;
    }

    // Auth state change will handle navigation
  }

  async function handleMagicLink() {
    setMagicLinkSending(true);
    const { error: sendError } = await signInWithEmail(email ?? "");
    setMagicLinkSending(false);

    if (sendError) {
      setError(sendError.message ?? "Gagal kirim link. Coba lagi ya.");
      return;
    }

    setMagicLinkMode(true);
    showToast("Link masuk sudah dikirim ke email!", "success");
  }

  async function handleResend() {
    if (resendCooldown > 0) return;

    if (isEmail) {
      await signInWithEmail(email ?? "");
      showToast("Kode OTP baru dikirim ke email!", "success");
    } else {
      await signInWithPhone(phone ?? "");
      showToast("Kode OTP baru dikirim via WhatsApp!", "success");
    }

    setResendCooldown(60);
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

  const channelText = isEmail ? "email" : "WhatsApp";

  // Show magic link waiting screen
  if (magicLinkMode && isEmail) {
    return (
      <SafeAreaView className="flex-1 bg-light-bg">
        <View className="flex-1 px-6 justify-between">
          <View className="pt-16">
            <Text className="text-2xl font-bold text-dark-text">
              Cek Email Kamu
            </Text>
            <Text className="text-sm text-grey-text mt-3 leading-5">
              Link masuk sudah dikirim ke{"\n"}
              <Text className="font-bold text-dark-text">{destination}</Text>
            </Text>

            <View className="bg-white rounded-xl p-4 mt-6 border border-border-color">
              <Text className="text-sm text-dark-text leading-5">
                1. Buka email dari Apick{"\n"}
                2. Klik tombol "Login" atau link di email{"\n"}
                3. Otomatis masuk ke aplikasi
              </Text>
            </View>

            <Text className="text-xs text-grey-text mt-4">
              Gak dapat email? Cek folder Spam atau Promosi.
            </Text>
          </View>

          <View className="pb-8">
            <TouchableOpacity
              onPress={() => {
                setMagicLinkMode(false);
                setError("");
                setOtpFailCount(0);
              }}
              className="items-center py-3"
            >
              <Text className="text-sm text-navy font-bold">
                Kembali ke kode OTP
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
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
            Kode 6 digit sudah dikirim via {channelText} ke {destination}
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

          {/* Magic link fallback - show after 1 failed OTP attempt (email only) */}
          {isEmail && otpFailCount >= 1 ? (
            <TouchableOpacity
              onPress={handleMagicLink}
              disabled={magicLinkSending}
              className="bg-white rounded-xl p-4 mt-4 border border-border-color"
            >
              <Text className="text-sm font-bold text-dark-text">
                Kode OTP bermasalah?
              </Text>
              <Text className="text-xs text-grey-text mt-1">
                {magicLinkSending
                  ? "Mengirim link ke email..."
                  : "Ketuk di sini untuk masuk lewat link di email."}
              </Text>
            </TouchableOpacity>
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
