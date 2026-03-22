import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button } from '@components/ui/Button';
import { connectByCode } from '@services/connection.service';
import { useAuthStore } from '@stores/auth.store';
import { useUIStore } from '@stores/ui.store';
import { RADIUS, TYPO, SPACING } from '@utils/theme';
import Svg, { Path } from 'react-native-svg';

export default function ScanQRScreen() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const profile = useAuthStore((s) => s.profile);
  const showToast = useUIStore((s) => s.showToast);

  async function handleBarCodeScanned({ data }: { data: string }) {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);
    try {
      let code = data;
      if (data.includes('apick.id')) {
        const segments = data.split('/').filter(Boolean);
        code = segments[segments.length - 1];
      }
      if (profile?.id) {
        await connectByCode(profile.id, code);
        showToast('Berhasil terhubung!', 'success');
        router.back();
      }
    } catch {
      showToast('Kode QR tidak valid. Coba lagi.', 'error');
      setScanned(false);
    } finally {
      setLoading(false);
    }
  }

  if (!permission?.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.lg }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#E0F4F4', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg }}>
          <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
            <Path d="M23 19C23 19.5 22.8 20.1 22.4 20.4C22.1 20.8 21.5 21 21 21H3C2.5 21 1.9 20.8 1.6 20.4C1.2 20.1 1 19.5 1 19V8C1 7.5 1.2 6.9 1.6 6.6C1.9 6.2 2.5 6 3 6H7L9 3H15L17 6H21C21.5 6 22.1 6.2 22.4 6.6C22.8 6.9 23 7.5 23 8V19Z" stroke="#2C7695" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M12 17C14.2 17 16 15.2 16 13C16 10.8 14.2 9 12 9C9.8 9 8 10.8 8 13C8 15.2 9.8 17 12 17Z" stroke="#2C7695" strokeWidth={1.8} />
          </Svg>
        </View>
        <Text style={{ ...TYPO.body, color: '#1E293B', textAlign: 'center', marginBottom: SPACING.lg }}>
          Izinkan Apick mengakses kamera untuk scan QR Code
        </Text>
        <Button title="Izinkan Kamera" onPress={requestPermission} fullWidth={false} style={{ paddingHorizontal: 32 }} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      {/* Header overlay */}
      <View style={{ position: 'absolute', top: insets.top + 8, left: 0, right: 0, zIndex: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg }}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={{ padding: 8, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: RADIUS.full }}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={{ ...TYPO.h3, color: '#FFFFFF', marginLeft: SPACING.sm }}>Scan QR Code</Text>
      </View>

      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Bottom overlay */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.lg,
        paddingBottom: insets.bottom + SPACING.lg,
        borderTopLeftRadius: RADIUS.xxl,
        borderTopRightRadius: RADIUS.xxl,
      }}>
        <Text style={{ ...TYPO.body, color: '#FFFFFF', textAlign: 'center' }}>
          Arahkan kamera ke QR Code dari pengelola
        </Text>
        {scanned && (
          <TouchableOpacity onPress={() => setScanned(false)} style={{ marginTop: SPACING.sm, alignItems: 'center' }}>
            <Text style={{ ...TYPO.captionBold, color: '#50BFC3' }}>Scan ulang</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
