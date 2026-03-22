import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Card } from '@components/ui/Card';
import { useRoleStore } from '@stores/role.store';
import { useAuthStore } from '@stores/auth.store';
import { upsertProfile } from '@services/auth.service';
import { GRADIENTS, GLASS, RADIUS, TYPO, SPACING } from '@utils/theme';
import Svg, { Path } from 'react-native-svg';

type Step = 'input' | 'detected';

interface DetectedConnection {
  id: string;
  providerName: string;
  module: string;
  role: string;
  checked: boolean;
}

export default function ConsumerOnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [step, _setStep] = useState<Step>('input');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [detected, setDetected] = useState<DetectedConnection[]>([]);
  const setRole = useRoleStore((s) => s.setRole);
  const setActiveView = useRoleStore((s) => s.setActiveView);
  const session = useAuthStore((s) => s.session);
  const setProfile = useAuthStore((s) => s.setProfile);

  function handleCodeSubmit() {
    if (code.length < 6) { setError('Kode koneksi harus 6 karakter'); return; }
    goToConsumerHome();
  }

  function handleScanQR() { router.push('/connect/scan'); }

  function toggleDetected(id: string) {
    setDetected((prev) => prev.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c)));
  }

  function handleConfirmDetected() { goToConsumerHome(); }

  async function goToConsumerHome() {
    setSaving(true);
    if (session?.user.id) {
      const { data } = await upsertProfile(session.user.id, { role: 'consumer' });
      if (data) setProfile(data);
    }
    setRole('consumer');
    setActiveView('consumer');
    setSaving(false);
    router.replace('/(consumer)/(tabs)');
  }

  if (step === 'detected' && detected.length > 0) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
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
          <Text style={{ ...TYPO.h1, color: '#FFFFFF' }}>Kamu terhubung dengan:</Text>
        </LinearGradient>

        <View style={{ flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg }}>
          {detected.map((conn) => (
            <TouchableOpacity key={conn.id} onPress={() => toggleDetected(conn.id)}>
              <Card variant={conn.checked ? 'elevated' : 'glass'}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: RADIUS.sm,
                      borderWidth: 2,
                      borderColor: conn.checked ? '#156064' : '#E2E8F0',
                      backgroundColor: conn.checked ? '#156064' : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 14,
                    }}
                  >
                    {conn.checked && <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>✓</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...TYPO.bodyBold, color: '#1E293B' }}>{conn.providerName}</Text>
                    <Text style={{ ...TYPO.caption, color: '#64748B' }}>{conn.role}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ paddingHorizontal: SPACING.lg, paddingBottom: insets.bottom + SPACING.lg }}>
          <Button title="Konfirmasi" onPress={handleConfirmDetected} loading={saving} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
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
        <Text style={{ ...TYPO.h1, color: '#FFFFFF' }}>Masukkan kode koneksi</Text>
        <Text style={{ ...TYPO.body, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
          Minta kode dari pengelola (pemilik kos, laundry, ketua RT)
        </Text>
      </LinearGradient>

      <View style={{ flex: 1, paddingHorizontal: SPACING.lg, justifyContent: 'space-between' }}>
        <View style={{ paddingTop: SPACING.xl }}>
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
            onPress={handleScanQR}
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
              backgroundColor: GLASS.card.background,
            }}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M3 7V5C3 3.9 3.9 3 5 3H7" stroke="#2C7695" strokeWidth={2} strokeLinecap="round" />
              <Path d="M17 3H19C20.1 3 21 3.9 21 5V7" stroke="#2C7695" strokeWidth={2} strokeLinecap="round" />
              <Path d="M21 17V19C21 20.1 20.1 21 19 21H17" stroke="#2C7695" strokeWidth={2} strokeLinecap="round" />
              <Path d="M7 21H5C3.9 21 3 20.1 3 19V17" stroke="#2C7695" strokeWidth={2} strokeLinecap="round" />
              <Path d="M7 7H10V10H7V7Z" stroke="#2C7695" strokeWidth={1.5} />
              <Path d="M14 7H17V10H14V7Z" stroke="#2C7695" strokeWidth={1.5} />
              <Path d="M7 14H10V17H7V14Z" stroke="#2C7695" strokeWidth={1.5} />
            </Svg>
            <Text style={{ ...TYPO.captionBold, color: '#2C7695', marginLeft: 10 }}>Scan QR Code</Text>
          </TouchableOpacity>
        </View>

        <View style={{ paddingBottom: insets.bottom + SPACING.lg }}>
          <Button title="Hubungkan" onPress={handleCodeSubmit} loading={saving} />
          <TouchableOpacity onPress={goToConsumerHome} style={{ marginTop: SPACING.md, alignItems: 'center', paddingVertical: 8 }}>
            <Text style={{ ...TYPO.caption, color: '#64748B' }}>Belum punya kode? Lewati dulu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
