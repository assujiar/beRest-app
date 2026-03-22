import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { connectByCode } from '@services/connection.service';
import { useAuthStore } from '@stores/auth.store';
import { useUIStore } from '@stores/ui.store';
import { GRADIENTS, RADIUS, TYPO, SPACING } from '@utils/theme';
import Svg, { Path } from 'react-native-svg';

export default function ConnectByCodeScreen() {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const profile = useAuthStore((s) => s.profile);
  const showToast = useUIStore((s) => s.showToast);

  async function handleConnect() {
    if (code.length < 4) { setError('Kode koneksi terlalu pendek'); return; }
    if (!profile?.id) return;
    setLoading(true);
    setError('');
    try {
      await connectByCode(profile.id, code);
      showToast('Berhasil terhubung!', 'success');
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kode tidak valid. Cek lagi ya.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <LinearGradient
        colors={GRADIENTS.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + SPACING.sm,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.lg,
          borderBottomLeftRadius: RADIUS.xxl,
          borderBottomRightRadius: RADIUS.xxl,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={{ padding: 8 }}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <Text style={{ ...TYPO.h3, color: '#FFFFFF', marginLeft: SPACING.sm }}>Masukkan Kode</Text>
        </View>
      </LinearGradient>

      <View style={{ flex: 1, paddingHorizontal: SPACING.lg, justifyContent: 'space-between' }}>
        <View style={{ paddingTop: SPACING.xl }}>
          <Text style={{ ...TYPO.body, color: '#64748B', marginBottom: SPACING.lg }}>
            Minta kode koneksi dari pengelola (pemilik kos, laundry, ketua RT, dll)
          </Text>
          <Input
            label="Kode Koneksi"
            placeholder="contoh: KOS-4829"
            value={code}
            onChangeText={(text) => { setCode(text.toUpperCase()); setError(''); }}
            error={error}
            autoCapitalize="characters"
            maxLength={10}
          />
          <TouchableOpacity
            onPress={() => router.push('/connect/scan')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: SPACING.lg,
              paddingVertical: 14,
              borderRadius: RADIUS.lg,
              borderWidth: 1.5,
              borderColor: '#E2E8F0',
              borderStyle: 'dashed',
            }}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M3 7V5C3 3.9 3.9 3 5 3H7" stroke="#2C7695" strokeWidth={2} strokeLinecap="round" />
              <Path d="M17 3H19C20.1 3 21 3.9 21 5V7" stroke="#2C7695" strokeWidth={2} strokeLinecap="round" />
              <Path d="M21 17V19C21 20.1 20.1 21 19 21H17" stroke="#2C7695" strokeWidth={2} strokeLinecap="round" />
              <Path d="M7 21H5C3.9 21 3 20.1 3 19V17" stroke="#2C7695" strokeWidth={2} strokeLinecap="round" />
            </Svg>
            <Text style={{ ...TYPO.captionBold, color: '#2C7695', marginLeft: 10 }}>Scan QR Code</Text>
          </TouchableOpacity>
        </View>

        <View style={{ paddingBottom: insets.bottom + SPACING.lg }}>
          <Button title="Hubungkan" onPress={handleConnect} loading={loading} />
        </View>
      </View>
    </View>
  );
}
