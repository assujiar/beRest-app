import { View, Text, TouchableOpacity } from "react-native";

interface SmartBannerProps {
  onInstall: () => void;
  onDismiss: () => void;
}

export function SmartBanner({ onInstall, onDismiss }: SmartBannerProps) {
  return (
    <View className="bg-navy flex-row items-center px-4 py-3">
      <View className="flex-1 mr-3">
        <Text className="text-white text-sm font-bold">
          Download Apick
        </Text>
        <Text className="text-white/70 text-xs">
          Notifikasi real-time & semua status di 1 tempat
        </Text>
      </View>
      <TouchableOpacity
        onPress={onInstall}
        className="bg-orange rounded-lg px-4 py-2 mr-2"
      >
        <Text className="text-white text-xs font-bold">Install</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDismiss} hitSlop={8}>
        <Text className="text-white/50 text-lg">✕</Text>
      </TouchableOpacity>
    </View>
  );
}
