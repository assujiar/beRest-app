import { View } from "react-native";
import { EmptyState } from "@components/shared/EmptyState";

export default function WargaScreen() {
  return (
    <View className="flex-1 bg-light-bg">
      <EmptyState
        illustration="👥"
        title="Belum ada organisasi"
        description="Buat organisasi pertamamu (RT, mesjid, pengajian, dll)"
        actionLabel="+ Buat Organisasi"
        onAction={() => {}}
      />
    </View>
  );
}
