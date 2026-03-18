import { View } from "react-native";
import { EmptyState } from "@components/shared/EmptyState";

export default function SewaScreen() {
  return (
    <View className="flex-1 bg-light-bg">
      <EmptyState
        illustration="🏠"
        title="Belum ada properti"
        description="Tambah kos atau barang rental pertamamu"
        actionLabel="+ Tambah Properti"
        onAction={() => {}}
      />
    </View>
  );
}
