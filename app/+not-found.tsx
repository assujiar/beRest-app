import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@stores/auth.store';
import { GRADIENTS, TYPO } from '@utils/theme';

export default function NotFoundScreen() {
  const session = useAuthStore((s) => s.session);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (isLoading) return;
    const timeout = setTimeout(() => { router.replace('/'); }, 1500);
    return () => clearTimeout(timeout);
  }, [isLoading, session]);

  return (
    <LinearGradient
      colors={GRADIENTS.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderWidth: 2,
          borderColor: 'rgba(255,255,255,0.3)',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 30, fontWeight: '800', color: '#FFFFFF' }}>A</Text>
      </View>
      <ActivityIndicator size="large" color="rgba(255,255,255,0.8)" />
      <Text style={{ ...TYPO.body, color: 'rgba(255,255,255,0.7)', marginTop: 16 }}>Mengalihkan...</Text>
    </LinearGradient>
  );
}
