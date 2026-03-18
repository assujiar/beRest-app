import { View } from "react-native";
import { EmptyState } from "@components/shared/EmptyState";

export default function HajatScreen() {
  return (
    <View className="flex-1 bg-light-bg">
      <EmptyState
        illustration="🎉"
        title="Belum ada acara"
        description="Bikin undangan digital atau mulai catat amplop"
        actionLabel="+ Buat Acara"
        onAction={() => {}}
      />
    </View>
  );
}
