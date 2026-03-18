import { View, Text } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@components/ui/Button";

export default function RegisterScreen() {
  return (
    <SafeAreaView className="flex-1 bg-light-bg">
      <View className="flex-1 px-6 justify-between">
        <View className="pt-16">
          <Text className="text-2xl font-bold text-dark-text">
            Selamat Datang!
          </Text>
          <Text className="text-sm text-grey-text mt-2">
            Akun kamu sudah dibuat. Sekarang, mau pakai Apick untuk apa?
          </Text>
        </View>

        <View className="pb-8">
          <Button
            title="Lanjut"
            onPress={() => router.replace("/(onboarding)/provider")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
