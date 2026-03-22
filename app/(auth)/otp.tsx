import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';
import { verifyOtp, verifyEmailOtp, signInWithPhone, signInWithEmail } from '@services/auth.service';
import { useUIStore } from '@stores/ui.store';
import { GRADIENTS, GLASS, RADIUS, TYPO, SPACING } from '@utils/theme';

export default function OtpScreen() {
  const insets = useSafeAreaInsets();
  const { phone, email, via } = useLocalSearchParams<{
    phone?: string;
    email?: string;
    via?: 'phone' | 'email';
  }>();

  const isEmail = via === 'email';
  const destination = isEmail ? email : phone;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicLinkMode, setMagicLinkMode] = useState(false);
  const [magicLinkSending, setMagicLinkSending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [otpExpiry, setOtpExpiry] = useState(300);
  const inputs = useRef<(TextInput | null)[]>([]);
  const showToast = useUIStore((s) => s.showToast);

  // OTP expiry countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setOtpExpiry((c) => {
        if (c <= 1) { clearInterval(interval); return 0; }
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
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function handleChange(text: string, index: number) {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setError('');
    if (text && index < 5) inputs.current[index + 1]?.focus();
    if (text && index === 5 && newOtp.every((d) => d)) handleVerify(newOtp.join(''));
  }

  function handleKeyPress(key: string, index: number) {
    if (key === 'Backspace' && !otp[index] && index > 0) inputs.current[index - 1]?.focus();
  }

  async function handleVerify(code?: string) {
    const token = code ?? otp.join('');
    if (token.length < 6) { setError('Masukkan 6 digit kode OTP'); return; }
    if (otpExpiry <= 0) { setError('Kode OTP sudah kedaluwarsa. Kirim ulang ya.'); return; }
    setLoading(true);
    setError('');
    const { error: authError } = isEmail
      ? await verifyEmailOtp(email ?? '', token)
      : await verifyOtp(phone ?? '', token);
    setLoading(false);
    if (authError) setError(authError.message ?? 'Kode OTP salah. Cek lagi ya.');
  }

  async function handleMagicLink() {
    setMagicLinkSending(true);
    const { error: sendError } = await signInWithEmail(email ?? '');
    setMagicLinkSending(false);
    if (sendError) { setError(sendError.message ?? 'Gagal kirim link. Coba lagi ya.'); return; }
    setMagicLinkMode(true);
    showToast('Link masuk sudah dikirim ke email!', 'success');
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    if (isEmail) {
      const { error: sendError } = await signInWithEmail(email ?? '');
      if (sendError) { setError(sendError.message ?? 'Gagal kirim ulang. Coba lagi nanti.'); return; }
      showToast('Kode OTP baru dikirim ke email!', 'success');
    } else {
      const { error: sendError } = await signInWithPhone(phone ?? '');
      if (sendError) { setError(sendError.message ?? 'Gagal kirim ulang. Coba lagi nanti.'); return; }
      showToast('Kode OTP baru dikirim via WhatsApp!', 'success');
    }
    setOtpExpiry(300);
    setResendCooldown(60);
    setOtp(['', '', '', '', '', '']);
    setError('');
    inputs.current[0]?.focus();
  }

  const channelText = isEmail ? 'email' : 'WhatsApp';

  // Magic link waiting screen
  if (magicLinkMode && isEmail) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <LinearGradient
          colors={GRADIENTS.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: insets.top + SPACING.xl,
            paddingBottom: SPACING.xl,
            paddingHorizontal: SPACING.lg,
            borderBottomLeftRadius: RADIUS.xxl,
            borderBottomRightRadius: RADIUS.xxl,
          }}
        >
          <Text style={{ ...TYPO.h1, color: '#FFFFFF' }}>Cek Email Kamu</Text>
          <Text style={{ ...TYPO.body, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
            Link masuk sudah dikirim ke
          </Text>
          <Text style={{ ...TYPO.bodyBold, color: '#FFFFFF', marginTop: 2 }}>{destination}</Text>
        </LinearGradient>

        <View style={{ paddingHorizontal: SPACING.lg, marginTop: SPACING.lg }}>
          <Card variant="elevated">
            <Text style={{ ...TYPO.body, color: '#1E293B', lineHeight: 24 }}>
              1. Buka email dari Apick{'\n'}
              2. Klik tombol "Login" atau link di email{'\n'}
              3. Otomatis masuk ke aplikasi
            </Text>
          </Card>
          <Text style={{ ...TYPO.caption, color: '#94A3B8', marginTop: SPACING.sm }}>
            Gak dapat email? Cek folder Spam atau Promosi.
          </Text>
        </View>

        <View style={{ flex: 1 }} />
        <View style={{ paddingHorizontal: SPACING.lg, paddingBottom: insets.bottom + SPACING.lg }}>
          <TouchableOpacity
            onPress={() => { setMagicLinkMode(false); setError(''); }}
            style={{ alignItems: 'center', paddingVertical: 12 }}
          >
            <Text style={{ ...TYPO.captionBold, color: '#2C7695' }}>Kembali ke kode OTP</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Timer color
  const timerColor = otpExpiry <= 60 ? '#DC2626' : '#64748B';
  const timerBg = otpExpiry <= 60 ? '#FEE2E2' : '#F1F5F9';

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <LinearGradient
        colors={GRADIENTS.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + SPACING.xl,
          paddingBottom: SPACING.xl,
          paddingHorizontal: SPACING.lg,
          borderBottomLeftRadius: RADIUS.xxl,
          borderBottomRightRadius: RADIUS.xxl,
        }}
      >
        <Text style={{ ...TYPO.h1, color: '#FFFFFF' }}>Masukkan Kode OTP</Text>
        <Text style={{ ...TYPO.body, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
          Kode 6 digit dikirim via {channelText} ke
        </Text>
        <Text style={{ ...TYPO.bodyBold, color: '#FFFFFF', marginTop: 2 }}>{destination}</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg }}>
          {/* Timer badge */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: SPACING.lg }}>
            <View style={{ backgroundColor: timerBg, borderRadius: RADIUS.full, paddingHorizontal: 16, paddingVertical: 6 }}>
              <Text style={{ ...TYPO.captionBold, color: timerColor }}>
                {otpExpiry > 0 ? `Berlaku ${formatTime(otpExpiry)}` : 'Kode kedaluwarsa'}
              </Text>
            </View>
          </View>

          {/* OTP inputs */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md }}>
            {otp.map((digit, i) => (
              <View
                key={i}
                style={{
                  width: 50,
                  height: 60,
                  borderRadius: RADIUS.lg,
                  borderWidth: 2,
                  borderColor: error ? '#EF4444' : digit ? '#2C7695' : GLASS.card.border,
                  backgroundColor: digit ? 'rgba(44,118,149,0.06)' : GLASS.card.background,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: otpExpiry <= 0 ? 0.4 : 1,
                  ...(digit ? GLASS.shadow.sm : {}),
                }}
              >
                <TextInput
                  ref={(ref) => { inputs.current[i] = ref; }}
                  style={{
                    width: '100%',
                    height: '100%',
                    textAlign: 'center',
                    fontSize: 22,
                    fontWeight: '700',
                    color: '#1E293B',
                  }}
                  maxLength={1}
                  keyboardType="number-pad"
                  value={digit}
                  editable={otpExpiry > 0}
                  onChangeText={(text) => handleChange(text, i)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                />
              </View>
            ))}
          </View>

          {error ? (
            <View style={{ backgroundColor: '#FEE2E2', borderRadius: RADIUS.md, padding: 10, marginBottom: SPACING.sm }}>
              <Text style={{ ...TYPO.caption, color: '#DC2626' }}>{error}</Text>
            </View>
          ) : null}

          {/* Magic link option */}
          {isEmail ? (
            <TouchableOpacity onPress={handleMagicLink} disabled={magicLinkSending}>
              <Card variant="elevated" style={{ marginTop: SPACING.sm }}>
                <Text style={{ ...TYPO.bodyBold, color: '#1E293B' }}>Masuk lewat link email</Text>
                <Text style={{ ...TYPO.caption, color: '#94A3B8', marginTop: 4 }}>
                  {magicLinkSending
                    ? 'Mengirim link ke email...'
                    : 'Gak perlu ketik kode. Klik link di email untuk langsung masuk.'}
                </Text>
              </Card>
            </TouchableOpacity>
          ) : null}

          {/* Resend */}
          <TouchableOpacity onPress={handleResend} disabled={resendCooldown > 0} style={{ marginTop: SPACING.md, alignItems: 'center' }}>
            <Text style={{ ...TYPO.captionBold, color: resendCooldown > 0 ? '#94A3B8' : '#2C7695' }}>
              {resendCooldown > 0 ? `Kirim ulang dalam ${resendCooldown} detik` : 'Kirim ulang kode OTP'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom CTA */}
        <View style={{ paddingHorizontal: SPACING.lg, paddingBottom: insets.bottom + SPACING.lg }}>
          <Button title="Verifikasi" onPress={() => handleVerify()} loading={loading} disabled={otpExpiry <= 0} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
