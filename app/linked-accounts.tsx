import { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Badge } from "@components/ui/Badge";
import { useAuthStore } from "@stores/auth.store";
import { useUIStore } from "@stores/ui.store";
import {
  getLinkedAuthMethods,
  linkPhone,
  linkEmail,
  linkGoogle,
  verifyPhoneLink,
  verifyEmailLink,
  syncLinkedMethods,
} from "@services/auth.service";
import { formatPhoneE164, formatPhoneDisplay } from "@utils/format";
import type { AuthMethod } from "@app-types/shared.types";

const METHOD_LABELS: Record<AuthMethod, string> = {
  phone: "Nomor HP (WhatsApp/SMS)",
  email: "Email",
  google: "Google",
};

const METHOD_DESCRIPTIONS: Record<AuthMethod, string> = {
  phone: "Login via kode OTP ke WhatsApp/SMS",
  email: "Login via kode OTP ke email",
  google: "Login langsung via akun Google",
};

type LinkStep = "input" | "otp";

export default function LinkedAccountsScreen() {
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const showToast = useUIStore((s) => s.showToast);

  const [linkedMethods, setLinkedMethods] = useState<AuthMethod[]>([]);
  const [linkingMethod, setLinkingMethod] = useState<AuthMethod | null>(null);

  // Link phone state
  const [phoneInput, setPhoneInput] = useState("");
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [phoneLinking, setPhoneLinking] = useState(false);
  const [phoneStep, setPhoneStep] = useState<LinkStep>("input");
  const [phoneFormatted, setPhoneFormatted] = useState("");

  // Link email state
  const [emailInput, setEmailInput] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailLinking, setEmailLinking] = useState(false);
  const [emailStep, setEmailStep] = useState<LinkStep>("input");
  const [emailTrimmed, setEmailTrimmed] = useState("");

  // OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputs = useRef<(TextInput | null)[]>([]);

  const [error, setError] = useState("");

  const loadMethods = useCallback(async () => {
    if (!session?.user.id) return;
    const methods = await getLinkedAuthMethods(session.user.id);
    setLinkedMethods(methods);
  }, [session?.user.id]);

  useEffect(() => {
    loadMethods();
  }, [loadMethods]);

  function resetOtp() {
    setOtp(["", "", "", "", "", ""]);
    setOtpVerifying(false);
    setError("");
  }

  function resetPhoneForm() {
    setShowPhoneForm(false);
    setPhoneInput("");
    setPhoneStep("input");
    setPhoneFormatted("");
    resetOtp();
  }

  function resetEmailForm() {
    setShowEmailForm(false);
    setEmailInput("");
    setEmailStep("input");
    setEmailTrimmed("");
    resetOtp();
  }

  function startResendCooldown() {
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

  // ─── OTP input handlers ──────────────────────────────────────

  function handleOtpChange(text: string, index: number) {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setError("");

    if (text && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }

    if (text && index === 5 && newOtp.every((d) => d)) {
      handleVerifyOtp(newOtp.join(""));
    }
  }

  function handleOtpKeyPress(key: string, index: number) {
    if (key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  }

  // ─── Phone linking ───────────────────────────────────────────

  async function handleLinkPhone() {
    if (phoneInput.length < 10) {
      setError("Nomor HP minimal 10 digit ya");
      return;
    }

    setPhoneLinking(true);
    setError("");
    const formatted = formatPhoneE164(phoneInput);
    const { error: linkError } = await linkPhone(formatted);
    setPhoneLinking(false);

    if (linkError) {
      setError(linkError.message);
      return;
    }

    setPhoneFormatted(formatted);
    setPhoneStep("otp");
    resetOtp();
    startResendCooldown();
    showToast("Kode OTP dikirim ke nomor baru!", "success");
  }

  async function handleResendPhoneOtp() {
    if (resendCooldown > 0) return;
    const { error: linkError } = await linkPhone(phoneFormatted);
    if (linkError) {
      setError(linkError.message);
      return;
    }
    showToast("Kode OTP dikirim ulang!", "success");
    startResendCooldown();
  }

  // ─── Email linking ───────────────────────────────────────────

  async function handleLinkEmail() {
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Masukkan alamat email yang valid ya");
      return;
    }

    setEmailLinking(true);
    setError("");
    const { error: linkError } = await linkEmail(trimmed);
    setEmailLinking(false);

    if (linkError) {
      setError(linkError.message);
      return;
    }

    setEmailTrimmed(trimmed);
    setEmailStep("otp");
    resetOtp();
    startResendCooldown();
    showToast("Kode OTP dikirim ke email!", "success");
  }

  async function handleResendEmailOtp() {
    if (resendCooldown > 0) return;
    const { error: linkError } = await linkEmail(emailTrimmed);
    if (linkError) {
      setError(linkError.message);
      return;
    }
    showToast("Kode OTP dikirim ulang ke email!", "success");
    startResendCooldown();
  }

  // ─── OTP verification ────────────────────────────────────────

  async function handleVerifyOtp(code?: string) {
    const token = code ?? otp.join("");
    if (token.length < 6) {
      setError("Masukkan 6 digit kode OTP");
      return;
    }

    setOtpVerifying(true);
    setError("");

    const isPhone = showPhoneForm && phoneStep === "otp";
    const { error: verifyError } = isPhone
      ? await verifyPhoneLink(phoneFormatted, token)
      : await verifyEmailLink(emailTrimmed, token);

    setOtpVerifying(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    const label = isPhone ? "Nomor HP" : "Email";
    showToast(`${label} berhasil dihubungkan!`, "success");

    if (isPhone) resetPhoneForm();
    else resetEmailForm();

    if (session?.user.id) {
      const methods = await syncLinkedMethods(session.user.id);
      setLinkedMethods(methods);
    }
  }

  // ─── Google linking ───────────────────────────────────────────

  async function handleLinkGoogle() {
    setLinkingMethod("google");
    const { error: linkError } = await linkGoogle();
    setLinkingMethod(null);

    if (linkError) {
      showToast("Gagal menghubungkan Google. Coba lagi ya.", "error");
      return;
    }

    showToast("Akun Google berhasil dihubungkan!", "success");
    if (session?.user.id) {
      const methods = await syncLinkedMethods(session.user.id);
      setLinkedMethods(methods);
    }
  }

  // ─── OTP input UI ────────────────────────────────────────────

  function renderOtpInput(onResend: () => void, destination: string, channel: string) {
    return (
      <View className="mt-4 pt-4 border-t border-border-color">
        <Text className="text-sm text-grey-text mb-3">
          Masukkan kode 6 digit yang dikirim via {channel} ke {destination}
        </Text>

        <View className="flex-row justify-between mb-3">
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref) => { otpInputs.current[i] = ref; }}
              className={`
                w-11 h-12 rounded-lg border text-center text-lg font-bold text-dark-text
                ${error ? "border-red-500" : digit ? "border-navy" : "border-border-color"}
              `}
              maxLength={1}
              keyboardType="number-pad"
              value={digit}
              onChangeText={(text) => handleOtpChange(text, i)}
              onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, i)}
            />
          ))}
        </View>

        {error ? (
          <Text className="text-xs text-red-500 mb-2">{error}</Text>
        ) : null}

        <Text
          className={`text-xs mb-3 ${resendCooldown > 0 ? "text-grey-text" : "text-navy font-bold"}`}
          onPress={onResend}
        >
          {resendCooldown > 0
            ? `Kirim ulang dalam ${resendCooldown} detik`
            : "Kirim ulang kode OTP"}
        </Text>

        <View className="flex-row">
          <View className="flex-1 mr-2">
            <Button
              title="Batal"
              variant="secondary"
              onPress={() => {
                if (showPhoneForm) resetPhoneForm();
                else resetEmailForm();
              }}
            />
          </View>
          <View className="flex-1 ml-2">
            <Button
              title="Verifikasi"
              onPress={() => handleVerifyOtp()}
              loading={otpVerifying}
            />
          </View>
        </View>
      </View>
    );
  }

  // ─── Render ───────────────────────────────────────────────────

  const isLinked = (method: AuthMethod) => linkedMethods.includes(method);
  const allMethods: AuthMethod[] = ["phone", "email", "google"];

  return (
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border-color bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 py-1">
          <Text className="text-navy text-base font-bold">{"<"} Kembali</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-dark-text">Metode Login</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-3">
        {/* Info */}
        <Card>
          <Text className="text-sm text-dark-text">
            Hubungkan beberapa metode login supaya kamu tetap bisa masuk kalau salah satu metode bermasalah.
          </Text>
        </Card>

        {/* Methods */}
        {allMethods.map((method) => {
          const linked = isLinked(method);
          return (
            <Card key={method}>
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-base font-bold text-dark-text">
                      {METHOD_LABELS[method]}
                    </Text>
                    {linked && (
                      <Badge label="Terhubung" variant="success" />
                    )}
                  </View>
                  <Text className="text-xs text-grey-text">
                    {METHOD_DESCRIPTIONS[method]}
                  </Text>
                  {linked && method === "phone" && profile?.phone && (
                    <Text className="text-xs text-grey-text mt-1">
                      {formatPhoneDisplay(profile.phone)}
                    </Text>
                  )}
                  {linked && method === "email" && profile?.email && (
                    <Text className="text-xs text-grey-text mt-1">
                      {profile.email}
                    </Text>
                  )}
                </View>
                {!linked && !(method === "phone" && showPhoneForm) && !(method === "email" && showEmailForm) && (
                  <TouchableOpacity
                    className="bg-navy/10 rounded-lg px-3 py-2"
                    onPress={() => {
                      setError("");
                      if (method === "phone") {
                        setShowPhoneForm(true);
                        setShowEmailForm(false);
                        resetEmailForm();
                      } else if (method === "email") {
                        setShowEmailForm(true);
                        setShowPhoneForm(false);
                        resetPhoneForm();
                      } else {
                        handleLinkGoogle();
                      }
                    }}
                    disabled={linkingMethod === method}
                  >
                    <Text className="text-navy text-xs font-bold">
                      {linkingMethod === method ? "..." : "Hubungkan"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Phone: input step */}
              {method === "phone" && showPhoneForm && !linked && phoneStep === "input" && (
                <View className="mt-4 pt-4 border-t border-border-color">
                  <Input
                    placeholder="contoh: 08123456789"
                    value={phoneInput}
                    onChangeText={(text) => {
                      setPhoneInput(text.replace(/\D/g, ""));
                      setError("");
                    }}
                    keyboardType="phone-pad"
                    label="Nomor HP baru"
                    error={error && showPhoneForm && phoneStep === "input" ? error : undefined}
                  />
                  <View className="flex-row mt-3">
                    <View className="flex-1 mr-2">
                      <Button
                        title="Batal"
                        variant="secondary"
                        onPress={resetPhoneForm}
                      />
                    </View>
                    <View className="flex-1 ml-2">
                      <Button
                        title="Kirim OTP"
                        onPress={handleLinkPhone}
                        loading={phoneLinking}
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* Phone: OTP step */}
              {method === "phone" && showPhoneForm && !linked && phoneStep === "otp" &&
                renderOtpInput(handleResendPhoneOtp, phoneFormatted, "WhatsApp/SMS")
              }

              {/* Email: input step */}
              {method === "email" && showEmailForm && !linked && emailStep === "input" && (
                <View className="mt-4 pt-4 border-t border-border-color">
                  <Input
                    placeholder="contoh: nama@email.com"
                    value={emailInput}
                    onChangeText={(text) => {
                      setEmailInput(text);
                      setError("");
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    label="Alamat email"
                    error={error && showEmailForm && emailStep === "input" ? error : undefined}
                  />
                  <View className="flex-row mt-3">
                    <View className="flex-1 mr-2">
                      <Button
                        title="Batal"
                        variant="secondary"
                        onPress={resetEmailForm}
                      />
                    </View>
                    <View className="flex-1 ml-2">
                      <Button
                        title="Kirim OTP"
                        onPress={handleLinkEmail}
                        loading={emailLinking}
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* Email: OTP step */}
              {method === "email" && showEmailForm && !linked && emailStep === "otp" &&
                renderOtpInput(handleResendEmailOtp, emailTrimmed, "email")
              }
            </Card>
          );
        })}

        {/* Summary */}
        <Card>
          <Text className="text-xs text-grey-text mb-2">RINGKASAN</Text>
          <Text className="text-sm text-dark-text">
            {linkedMethods.length} dari {allMethods.length} metode terhubung
          </Text>
          {linkedMethods.length < allMethods.length && (
            <Text className="text-xs text-grey-text mt-1">
              Hubungkan semua metode supaya akun kamu lebih aman dan fleksibel.
            </Text>
          )}
          {linkedMethods.length === allMethods.length && (
            <Text className="text-xs text-sewa mt-1">
              Semua metode login sudah terhubung!
            </Text>
          )}
        </Card>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
