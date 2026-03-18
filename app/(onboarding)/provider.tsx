import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@components/ui/Button";
import { useModulesStore } from "@stores/modules.store";
import { useRoleStore } from "@stores/role.store";
import { MODULE_COLORS, MODULE_LABELS } from "@utils/colors";
import type { ModuleKey } from "@app-types/shared.types";

const MODULE_OPTIONS: {
  key: ModuleKey;
  icon: string;
  description: string;
}[] = [
  {
    key: "lapak",
    icon: "🏪",
    description: "Jualan, laundry, les, jasa",
  },
  {
    key: "sewa",
    icon: "🏠",
    description: "Kos, kontrakan, rental barang",
  },
  {
    key: "warga",
    icon: "👥",
    description: "RT/RW, mesjid, pengajian, klub",
  },
  {
    key: "hajat",
    icon: "🎉",
    description: "Undangan, kondangan, amplop",
  },
];

export default function ProviderOnboardingScreen() {
  const [selected, setSelected] = useState<ModuleKey[]>([]);
  const setActiveModules = useModulesStore((s) => s.setActiveModules);
  const setRole = useRoleStore((s) => s.setRole);
  const setActiveView = useRoleStore((s) => s.setActiveView);

  function toggleModule(key: ModuleKey) {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function handleContinue() {
    setActiveModules(selected);
    setRole("provider");
    setActiveView("provider");
    router.replace("/(provider)/(tabs)");
  }

  function handleSkipToConsumer() {
    setRole("consumer");
    setActiveView("consumer");
    router.replace("/(consumer)/(tabs)");
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg">
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingTop: 24 }}>
        <Text className="text-2xl font-bold text-dark-text">
          Halo! Mau apik-in apa?
        </Text>
        <Text className="text-sm text-grey-text mt-2 mb-6">
          Pilih minimal 1 module. Kamu bisa tambah lagi nanti.
        </Text>

        {MODULE_OPTIONS.map((mod) => {
          const isSelected = selected.includes(mod.key);
          return (
            <TouchableOpacity
              key={mod.key}
              onPress={() => toggleModule(mod.key)}
              className={`
                flex-row items-center p-4 rounded-xl mb-3 border-2
                ${isSelected ? "bg-white" : "bg-white border-transparent"}
              `}
              style={
                isSelected
                  ? { borderColor: MODULE_COLORS[mod.key] }
                  : { borderColor: "#E2E8F0" }
              }
              activeOpacity={0.7}
            >
              <Text className="text-3xl mr-4">{mod.icon}</Text>
              <View className="flex-1">
                <Text className="text-base font-bold text-dark-text">
                  {MODULE_LABELS[mod.key]}
                </Text>
                <Text className="text-sm text-grey-text">
                  {mod.description}
                </Text>
              </View>
              <View
                className={`
                  w-6 h-6 rounded-full border-2 items-center justify-center
                  ${isSelected ? "" : "border-border-color"}
                `}
                style={
                  isSelected
                    ? { backgroundColor: MODULE_COLORS[mod.key], borderColor: MODULE_COLORS[mod.key] }
                    : {}
                }
              >
                {isSelected && (
                  <Text className="text-white text-xs font-bold">✓</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom - thumb zone */}
      <View className="px-6 pb-8 pt-4">
        <Button
          title="Lanjut"
          onPress={handleContinue}
          disabled={selected.length === 0}
        />
        <TouchableOpacity
          onPress={handleSkipToConsumer}
          className="mt-4 items-center py-2"
        >
          <Text className="text-sm text-grey-text">
            Saya cuma pengguna, bukan pengelola
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
