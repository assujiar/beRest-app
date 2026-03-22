import { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Card } from '@components/ui/Card';
import { Badge } from '@components/ui/Badge';
import { signInWithGoogle, signInWithPhone, signInWithEmail } from '@services/auth.service';
import { formatPhoneE164 } from '@utils/format';
import { useUIStore } from '@stores/ui.store';
import { GRADIENTS, GLASS, RADIUS, TYPO, SPACING } from '@utils/theme';

type AuthTab = 'phone' | 'email';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<AuthTab>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const showToast = useUIStore((s) => s.showToast);

  async function handleGoogleRegister() {
    setGoogleLoading(true);
    setError('');
    const { error: authError } = await signInWithGoogle();
    setGoogleLoading(false);
    if (authError) {
      setError('Daftar dengan Google gagal. Coba lagi ya.');
    }
  }

  async function handlePhoneRegister() {
    if (phone.length < 10) {
      setError('Nomor HP minimal 10 digit ya');
      return;
    }
    setLoading(true);
    setError('');
    const formatted = formatPhoneE164(phone);
    const { error: authError } = await signInWithPhone(formatted);
    setLoading(false);
    if (authError) {
      setError(authError.message ?? 'Gagal kirim kode OTP. Cek nomor HP kamu ya.');
      return;
    }
    showToast('Kode OTP sudah dikirim!', 'success');
    router.push({ pathname: '/(auth)/otp', params: { phone: formatted, mode: 'register', via: 'phone' } });
  }

  async function handleEmailRegister() {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setError('Masukkan alamat email yang valid ya');
      return;
    }
    setLoading(true);
    setError('');
    const { error: authError } = await signInWithEmail(trimmed);
    setLoading(false);
    if (authError) {
      const msg = authError.message?.toLowerCase() ?? '';
      if (msg.includes('database error') || msg.includes('saving new user')) {
        setError('Gagal membuat akun baru. Pastikan email valid dan coba lagi ya.');
      } else {
        setError(authError.message ?? 'Gagal kirim kode OTP ke email. Coba lagi ya.');
      }
      return;
    }
    showToast('Kode OTP sudah dikirim ke email!', 'success');
    router.push({ pathname: '/(auth)/otp', params: { email: trimmed, mode: 'register', via: 'email' } });
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Gradient header */}
      <LinearGradient
        colors={GRADIENTS.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + SPACING.lg,
          paddingBottom: SPACING.xl,
          paddingHorizontal: SPACING.lg,
          borderBottomLeftRadius: RADIUS.xxl,
          borderBottomRightRadius: RADIUS.xxl,
        }}
      >
        <Text style={{ ...TYPO.h1, color: '#FFFFFF' }}>Buat Akun Baru</Text>
        <Text style={{ ...TYPO.body, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
          Gratis! Langsung bisa pakai 1 modul.
        </Text>
      </LinearGradient>

      {/* Pricing card - overlapping */}
      <View style={{ paddingHorizontal: SPACING.lg, marginTop: -SPACING.md }}>
        <Card variant="elevated">
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Badge label="GRATIS" variant="success" />
            <Text style={{ ...TYPO.caption, color: '#64748B', marginLeft: 8 }}>Selamanya</Text>
          </View>
          <Text style={{ ...TYPO.bodyBold, color: '#1E293B' }}>
            1 modul aktif, 30 anggota, 20 produk
          </Text>
          <Text style={{ ...TYPO.caption, color: '#94A3B8', marginTop: 4 }}>
            Mau lebih? Mulai Rp 29.000/bln atau Rp 290.000/thn (hemat 2 bln)
          </Text>
        </Card>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', paddingHorizontal: SPACING.lg, paddingBottom: insets.bottom + SPACING.lg }}>
          {error ? (
            <View style={{ backgroundColor: '#FEE2E2', borderRadius: RADIUS.md, padding: 12, marginBottom: SPACING.md }}>
              <Text style={{ ...TYPO.caption, color: '#DC2626', textAlign: 'center' }}>{error}</Text>
            </View>
          ) : null}

          {/* Tab switcher */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: GLASS.card.background,
              borderRadius: RADIUS.md,
              padding: 4,
              marginBottom: SPACING.md,
              borderWidth: 1,
              borderColor: GLASS.card.border,
            }}
          >
            {(['phone', 'email'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => { setActiveTab(tab); setError(''); }}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: RADIUS.sm,
                  alignItems: 'center',
                  ...(activeTab === tab ? { backgroundColor: '#2C7695', ...GLASS.shadow.sm } : {}),
                }}
              >
                <Text style={{ ...TYPO.captionBold, color: activeTab === tab ? '#FFFFFF' : '#64748B' }}>
                  {tab === 'phone' ? 'Nomor HP' : 'Email'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === 'phone' ? (
            <>
              <Input
                placeholder="contoh: 08123456789"
                value={phone}
                onChangeText={(text) => { setPhone(text.replace(/\D/g, '')); setError(''); }}
                keyboardType="phone-pad"
                label="Nomor HP"
              />
              <View style={{ marginTop: SPACING.md }}>
                <Button title="Daftar dengan Nomor HP" onPress={handlePhoneRegister} loading={loading} />
              </View>
            </>
          ) : (
            <>
              <Input
                placeholder="contoh: nama@email.com"
                value={email}
                onChangeText={(text) => { setEmail(text); setError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                label="Alamat Email"
              />
              <View style={{ marginTop: SPACING.md }}>
                <Button title="Daftar dengan Email" onPress={handleEmailRegister} loading={loading} />
              </View>
            </>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.lg }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
            <Text style={{ ...TYPO.caption, color: '#94A3B8', marginHorizontal: 16 }}>atau</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
          </View>

          <Button
            title="Daftar dengan Google"
            variant="secondary"
            onPress={handleGoogleRegister}
            loading={googleLoading}
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            style={{ marginTop: SPACING.md, alignItems: 'center', paddingVertical: 8 }}
          >
            <Text style={{ ...TYPO.caption, color: '#64748B' }}>
              Sudah punya akun?{' '}
              <Text style={{ color: '#2C7695', fontWeight: '700' }}>Masuk</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
