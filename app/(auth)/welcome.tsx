import { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@components/ui/Button";

interface SlideData {
  icon: string;
  title: string;
  description: string;
  color: string;
}

const SLIDES: SlideData[] = [
  {
    icon: "📱",
    title: "Apick",
    description:
      "Life, well arranged.\n\nKelola usaha, properti, komunitas, dan acara kamu — semua dalam satu aplikasi.",
    color: "#1B3A5C",
  },
  {
    icon: "🏪",
    title: "Apick Lapak",
    description:
      "Catat penjualan, atur pelanggan, kirim tagihan.\nCocok buat warung, laundry, les privat, jasa.",
    color: "#10B981",
  },
  {
    icon: "🏠",
    title: "Apick Sewa",
    description:
      "Kelola kos, kontrakan, dan rental barang.\nTagihan otomatis, kontrak, data penghuni.",
    color: "#3B82F6",
  },
  {
    icon: "👥",
    title: "Apick Warga",
    description:
      "Urus iuran RT/RW, kas mesjid, dan komunitas.\nTransparan, rapi, bisa di-share lewat WhatsApp.",
    color: "#8B5CF6",
  },
  {
    icon: "🎉",
    title: "Apick Hajat",
    description:
      "Bikin undangan digital, tracking RSVP, catat amplop.\nPernikahan, khitanan, syukuran — semua terdata.",
    color: "#EC4899",
  },
];

export default function WelcomeScreen() {
  const { width } = useWindowDimensions();
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
    if (isLastSlide) {
      return;
    }
    scrollRef.current?.scrollTo({ x: (activeIndex + 1) * width, animated: true });
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg">
      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        className="flex-1"
      >
        {SLIDES.map((slide, index) => (
          <View
            key={index}
            style={{ width }}
            className="flex-1 px-8 justify-center items-center"
          >
            <Text className="text-6xl mb-6">{slide.icon}</Text>
            <Text
              className="text-3xl font-bold text-center mb-4"
              style={{ color: slide.color }}
            >
              {slide.title}
            </Text>
            <Text className="text-base text-grey-text text-center leading-6">
              {slide.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View className="flex-row justify-center mb-6">
        {SLIDES.map((_, index) => (
          <View
            key={index}
            className={`w-2.5 h-2.5 rounded-full mx-1.5 ${
              index === activeIndex ? "bg-navy" : "bg-border-color"
            }`}
          />
        ))}
      </View>

      {/* Bottom CTA - thumb zone */}
      <View className="px-6 pb-8">
        {isLastSlide ? (
          <>
            <Button
              title="Daftar Sekarang — Gratis!"
              onPress={() => router.push("/(auth)/register")}
            />
            <View className="mt-3">
              <Button
                title="Sudah punya akun? Masuk"
                variant="secondary"
                onPress={() => router.push("/(auth)/login")}
              />
            </View>
          </>
        ) : (
          <>
            <Button title="Lanjut" onPress={handleNext} />
            <View className="mt-3">
              <Button
                title="Lewati"
                variant="secondary"
                onPress={() =>
                  scrollRef.current?.scrollTo({
                    x: (SLIDES.length - 1) * width,
                    animated: true,
                  })
                }
              />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
