import { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { GLASS, RADIUS, TYPO, SPACING } from '@utils/theme';
import Svg, { Path } from 'react-native-svg';

interface PhotoPickerProps {
  label?: string;
  value: string | null;
  onChange: (uri: string) => void;
  placeholder?: string;
  aspect?: [number, number];
}

export function PhotoPicker({ label, value, onChange, placeholder = 'Tambah foto', aspect = [4, 3] }: PhotoPickerProps) {
  const [_loading, setLoading] = useState(false);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Izin Diperlukan', 'Izinkan apick mengakses galeri untuk memilih foto.'); return; }
    setLoading(true);
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect, quality: 0.8 });
    setLoading(false);
    if (!result.canceled && result.assets[0]) onChange(result.assets[0].uri);
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Izin Diperlukan', 'Izinkan apick mengakses kamera untuk mengambil foto.'); return; }
    setLoading(true);
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect, quality: 0.8 });
    setLoading(false);
    if (!result.canceled && result.assets[0]) onChange(result.assets[0].uri);
  }

  function handlePress() {
    Alert.alert('Pilih Foto', 'Mau ambil foto dari mana?', [
      { text: 'Kamera', onPress: takePhoto },
      { text: 'Galeri', onPress: pickImage },
      { text: 'Batal', style: 'cancel' },
    ]);
  }

  return (
    <View style={{ width: '100%' }}>
      {label && (
        <Text style={{ ...TYPO.captionBold, color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </Text>
      )}
      <TouchableOpacity
        onPress={handlePress}
        style={{
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: GLASS.card.border,
          borderRadius: RADIUS.xl,
          height: 128,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: GLASS.card.background,
        }}
      >
        {value ? (
          <Image source={{ uri: value }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#E0F4F4', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm }}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path d="M23 19C23 19.5 22.8 20.1 22.4 20.4C22.1 20.8 21.5 21 21 21H3C2.5 21 1.9 20.8 1.6 20.4C1.2 20.1 1 19.5 1 19V8C1 7.5 1.2 6.9 1.6 6.6C1.9 6.2 2.5 6 3 6H7L9 3H15L17 6H21C21.5 6 22.1 6.2 22.4 6.6C22.8 6.9 23 7.5 23 8V19Z" stroke="#2C7695" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M12 17C14.2 17 16 15.2 16 13C16 10.8 14.2 9 12 9C9.8 9 8 10.8 8 13C8 15.2 9.8 17 12 17Z" stroke="#2C7695" strokeWidth={1.8} />
              </Svg>
            </View>
            <Text style={{ ...TYPO.caption, color: '#94A3B8' }}>{placeholder}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
