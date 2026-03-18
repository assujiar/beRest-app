import { View } from "react-native";
import { EmptyState } from "@components/shared/EmptyState";

export default function LapakScreen() {
  return (
    <View className="flex-1 bg-light-bg">
      <EmptyState
        illustration="🏪"
        title="Belum ada usaha"
        description="Tambah usaha pertamamu untuk mulai catat penjualan"
        actionLabel="+ Tambah Usaha"
        onAction={() => {}}
      />
    </View>
  );
}
