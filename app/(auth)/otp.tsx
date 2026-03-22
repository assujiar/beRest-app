import { useState, useRef, useEffect } from "react";
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
  const [magicLinkMode, setMagicLinkMode] = useState(false);
  const [magicLinkSending, setMagicLinkSending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [otpExpiry, setOtpExpiry] = useState(300); // 5 min countdown
  const inputs = useRef<(TextInput | null)[]>([]);
  const showToast = useUIStore((s) => s.showToast);

  // OTP expiry countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setOtpExpiry((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

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

    if (otpExpiry <= 0) {
      setError("Kode OTP sudah kedaluwarsa. Kirim ulang ya.");
      return;
    }

    setLoading(true);
    setError("");

    const { error: authError } = isEmail
      ? await verifyEmailOtp(email ?? "", token)
      : await verifyOtp(phone ?? "", token);

    setLoading(false);

    if (authError) {
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
      const { error: sendError } = await signInWithEmail(email ?? "");
      if (sendError) {
        setError(sendError.message ?? "Gagal kirim ulang. Coba lagi nanti.");
        return;
      }
      showToast("Kode OTP baru dikirim ke email!", "success");
    } else {
      const { error: sendError } = await signInWithPhone(phone ?? "");
      if (sendError) {
        setError(sendError.message ?? "Gagal kirim ulang. Coba lagi nanti.");
        return;
      }
      showToast("Kode OTP baru dikirim via WhatsApp!", "success");
    }

    // Reset expiry and cooldown
    setOtpExpiry(300);
    setResendCooldown(60);
    setOtp(["", "", "", "", "", ""]);
    setError("");
    inputs.current[0]?.focus();
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

          {/* OTP expiry indicator */}
          {otpExpiry > 0 ? (
            <Text className={`text-xs mt-2 ${otpExpiry <= 60 ? "text-red-500 font-bold" : "text-grey-text"}`}>
              Kode berlaku {formatTime(otpExpiry)}
            </Text>
          ) : (
            <Text className="text-xs mt-2 text-red-500 font-bold">
              Kode sudah kedaluwarsa. Kirim ulang di bawah.
            </Text>
          )}

          {/* OTP inputs */}
          <View className="flex-row justify-between mt-6">
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(ref) => { inputs.current[i] = ref; }}
                className={`
                  w-12 h-14 rounded-lg border text-center text-xl font-bold text-dark-text
                  ${error ? "border-red-500" : digit ? "border-navy" : "border-border-color"}
                  ${otpExpiry <= 0 ? "opacity-50" : ""}
                `}
                maxLength={1}
                keyboardType="number-pad"
                value={digit}
                editable={otpExpiry > 0}
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

          {/* Magic link option - always show for email */}
          {isEmail ? (
            <TouchableOpacity
              onPress={handleMagicLink}
              disabled={magicLinkSending}
              className="bg-white rounded-xl p-4 mt-4 border border-border-color"
            >
              <Text className="text-sm font-bold text-dark-text">
                Masuk lewat link email
              </Text>
              <Text className="text-xs text-grey-text mt-1">
                {magicLinkSending
                  ? "Mengirim link ke email..."
                  : "Gak perlu ketik kode. Klik link di email untuk langsung masuk."}
              </Text>
            </TouchableOpacity>
          ) : null}

          {/* Resend */}
          <TouchableOpacity
            onPress={handleResend}
            disabled={resendCooldown > 0}
            className="mt-4"
          >
            <Text className={`text-sm ${resendCooldown > 0 ? "text-grey-text" : "text-navy font-bold"}`}>
              {resendCooldown > 0
                ? `Kirim ulang kode dalam ${resendCooldown} detik`
                : "Kirim ulang kode OTP"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom - thumb zone */}
        <View className="pb-8">
          <Button
            title="Verifikasi"
            onPress={() => handleVerify()}
            loading={loading}
            disabled={otpExpiry <= 0}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
