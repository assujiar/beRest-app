import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { signInWithGoogle, signInWithPhone, signInWithEmail } from "@services/auth.service";
import { formatPhoneE164 } from "@utils/format";
import { useUIStore } from "@stores/ui.store";

type AuthTab = "phone" | "email";

export default function RegisterScreen() {
  const [activeTab, setActiveTab] = useState<AuthTab>("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const showToast = useUIStore((s) => s.showToast);

  async function handleGoogleRegister() {
    setGoogleLoading(true);
    setError("");
    const { error: authError } = await signInWithGoogle();
    setGoogleLoading(false);
    if (authError) {
      setError("Daftar dengan Google gagal. Coba lagi ya.");
    }
  }

  async function handlePhoneRegister() {
    if (phone.length < 10) {
      setError("Nomor HP minimal 10 digit ya");
      return;
    }

    setLoading(true);
    setError("");
    const formatted = formatPhoneE164(phone);
    const { error: authError } = await signInWithPhone(formatted);
    setLoading(false);

    if (authError) {
      setError(authError.message ?? "Gagal kirim kode OTP. Cek nomor HP kamu ya.");
      return;
    }

    showToast("Kode OTP sudah dikirim!", "success");
    router.push({
      pathname: "/(auth)/otp",
      params: { phone: formatted, mode: "register", via: "phone" },
    });
  }

  async function handleEmailRegister() {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Masukkan alamat email yang valid ya");
      return;
    }

    setLoading(true);
    setError("");
    const { error: authError } = await signInWithEmail(trimmed);
    setLoading(false);

    if (authError) {
      const msg = authError.message?.toLowerCase() ?? "";
      if (msg.includes("database error") || msg.includes("saving new user")) {
        setError("Gagal membuat akun baru. Pastikan email valid dan coba lagi ya.");
      } else {
        setError(authError.message ?? "Gagal kirim kode OTP ke email. Coba lagi ya.");
      }
      return;
    }

    showToast("Kode OTP sudah dikirim ke email!", "success");
    router.push({
      pathname: "/(auth)/otp",
      params: { email: trimmed, mode: "register", via: "email" },
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg">
      <View className="flex-1 px-6 justify-between">
        {/* Top section */}
        <View className="pt-12">
          <Text className="text-2xl font-bold text-dark-text">
            Buat Akun Baru
          </Text>
          <Text className="text-sm text-grey-text mt-2">
            Gratis! Langsung bisa pakai 1 modul tanpa batas waktu.
          </Text>

          {/* Pricing info */}
          <View className="bg-white rounded-xl p-4 mt-6 border border-border-color">
            <View className="flex-row items-center mb-3">
              <View className="bg-green-100 rounded-full px-3 py-1">
                <Text className="text-green-700 text-xs font-bold">GRATIS</Text>
              </View>
              <Text className="text-sm text-grey-text ml-2">Selamanya</Text>
            </View>
            <Text className="text-sm text-dark-text">
              1 modul aktif, 30 anggota, 20 produk
            </Text>
            <Text className="text-xs text-grey-text mt-1">
              Mau lebih? Mulai Rp 29.000/bln atau Rp 290.000/thn (hemat 2 bln)
            </Text>
          </View>
        </View>

        {/* Bottom section - thumb zone */}
        <View className="pb-8">
          {error ? (
            <Text className="text-sm text-red-500 text-center mb-4">
              {error}
            </Text>
          ) : null}

          {/* Tab switcher: HP / Email */}
          <View className="flex-row bg-white rounded-lg border border-border-color mb-4">
            <TouchableOpacity
              className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === "phone" ? "bg-navy" : ""}`}
              onPress={() => { setActiveTab("phone"); setError(""); }}
            >
              <Text className={`text-sm font-bold ${activeTab === "phone" ? "text-white" : "text-grey-text"}`}>
                Nomor HP
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === "email" ? "bg-navy" : ""}`}
              onPress={() => { setActiveTab("email"); setError(""); }}
            >
              <Text className={`text-sm font-bold ${activeTab === "email" ? "text-white" : "text-grey-text"}`}>
                Email
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === "phone" ? (
            <>
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
                  title="Daftar dengan Nomor HP"
                  onPress={handlePhoneRegister}
                  loading={loading}
                />
              </View>
            </>
          ) : (
            <>
              <Input
                placeholder="contoh: nama@email.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                label="Alamat Email"
              />
              <View className="mt-4">
                <Button
                  title="Daftar dengan Email"
                  onPress={handleEmailRegister}
                  loading={loading}
                />
              </View>
            </>
          )}

          <View className="flex-row items-center my-5">
            <View className="flex-1 h-px bg-border-color" />
            <Text className="mx-4 text-sm text-grey-text">atau</Text>
            <View className="flex-1 h-px bg-border-color" />
          </View>

          <Button
            title="Daftar dengan Google"
            variant="secondary"
            onPress={handleGoogleRegister}
            loading={googleLoading}
          />

          <TouchableOpacity
            onPress={() => router.push("/(auth)/login")}
            className="mt-4 items-center py-2"
          >
            <Text className="text-sm text-grey-text">
              Sudah punya akun?{" "}
              <Text className="text-navy font-bold">Masuk</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
