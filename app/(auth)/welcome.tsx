import { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@components/ui/Button';
import { ModuleIcon } from '@components/ui/ModuleIcon';
import { GRADIENTS, RADIUS, TYPO, SPACING } from '@utils/theme';
import type { ModuleKey } from '@app-types/shared.types';

interface SlideData {
  module?: ModuleKey;
  title: string;
  description: string;
  gradient: [string, string, ...string[]];
}

const SLIDES: SlideData[] = [
  {
    title: 'apick',
    description:
      'Life, well arranged.\n\nKelola usaha, properti, komunitas, dan acara kamu — semua dalam satu aplikasi.',
    gradient: GRADIENTS.hero,
  },
  {
    module: 'lapak',
    title: 'Apick Lapak',
    description:
      'Catat penjualan, atur pelanggan, kirim tagihan.\nCocok buat warung, laundry, les privat, jasa.',
    gradient: GRADIENTS.lapak,
  },
  {
    module: 'sewa',
    title: 'Apick Sewa',
    description:
      'Kelola kos, kontrakan, dan rental barang.\nTagihan otomatis, kontrak, data penghuni.',
    gradient: GRADIENTS.sewa,
  },
  {
    module: 'warga',
    title: 'Apick Warga',
    description:
      'Urus iuran RT/RW, kas mesjid, dan komunitas.\nTransparan, rapi, bisa di-share lewat WhatsApp.',
    gradient: GRADIENTS.warga,
  },
  {
    module: 'hajat',
    title: 'Apick Hajat',
    description:
      'Bikin undangan digital, tracking RSVP, catat amplop.\nPernikahan, khitanan, syukuran — semua terdata.',
    gradient: GRADIENTS.hajat,
  },
];

export default function WelcomeScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / width);
      setActiveIndex(index);
    },
    [width]
  );

  const isLastSlide = activeIndex === SLIDES.length - 1;

  function handleNext() {
    if (isLastSlide) return;
    scrollRef.current?.scrollTo({ x: (activeIndex + 1) * width, animated: true });
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide, index) => (
          <LinearGradient
            key={index}
            colors={slide.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{
              width,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: SPACING.xl,
            }}
          >
            {/* Module icon or app logo */}
            {slide.module ? (
              <View
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: RADIUS.xxl,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: SPACING.lg,
                }}
              >
                <ModuleIcon module={slide.module} size={44} color="#FFFFFF" />
              </View>
            ) : (
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  borderWidth: 2,
                  borderColor: 'rgba(255,255,255,0.3)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: SPACING.lg,
                }}
              >
                <Text style={{ fontSize: 42, fontWeight: '800', color: '#FFFFFF' }}>A</Text>
              </View>
            )}

            <Text
              style={{
                ...TYPO.h1,
                fontSize: index === 0 ? 36 : 28,
                color: '#FFFFFF',
                textAlign: 'center',
                marginBottom: SPACING.md,
              }}
            >
              {slide.title}
            </Text>
            <Text
              style={{
                ...TYPO.body,
                color: 'rgba(255,255,255,0.85)',
                textAlign: 'center',
                lineHeight: 24,
              }}
            >
              {slide.description}
            </Text>
          </LinearGradient>
        ))}
      </ScrollView>

      {/* Bottom overlay with dots and CTA */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: insets.bottom + SPACING.lg,
          paddingHorizontal: SPACING.lg,
          paddingTop: SPACING.xl,
        }}
      >
        {/* Dots */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: SPACING.lg }}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={{
                width: index === activeIndex ? 24 : 8,
                height: 8,
                borderRadius: 4,
                marginHorizontal: 4,
                backgroundColor:
                  index === activeIndex ? '#FFFFFF' : 'rgba(255,255,255,0.35)',
              }}
            />
          ))}
        </View>

        {isLastSlide ? (
          <>
            <Button
              title="Daftar Sekarang — Gratis!"
              onPress={() => router.push('/(auth)/register')}
            />
            <View style={{ marginTop: 12 }}>
              <Button
                title="Sudah punya akun? Masuk"
                variant="ghost"
                onPress={() => router.push('/(auth)/login')}
                style={{ borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)' }}
              />
            </View>
          </>
        ) : (
          <>
            <Button title="Lanjut" onPress={handleNext} />
            <View style={{ marginTop: 12 }}>
              <Button
                title="Lewati"
                variant="ghost"
                onPress={() =>
                  scrollRef.current?.scrollTo({
                    x: (SLIDES.length - 1) * width,
                    animated: true,
                  })
                }
                style={{ borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)' }}
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
}
