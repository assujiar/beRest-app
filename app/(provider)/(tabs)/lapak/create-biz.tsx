import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { createBusiness } from "@services/lapak.service";
import { useAuthStore } from "@stores/auth.store";
import { useUIStore } from "@stores/ui.store";
import type { BusinessType } from "@app-types/lapak.types";

const BIZ_TYPES: { key: BusinessType; label: string; icon: string }[] = [
  { key: "pedagang", label: "Pedagang/Warung", icon: "🏪" },
  { key: "laundry", label: "Laundry", icon: "👕" },
  { key: "guru", label: "Guru/Pelatih", icon: "📚" },
  { key: "jasa_umum", label: "Jasa Umum", icon: "🔧" },
];

export default function CreateBizScreen() {
  const profile = useAuthStore((s) => s.profile);
  const showToast = useUIStore((s) => s.showToast);
  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState<BusinessType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!name.trim()) { setError("Nama usaha wajib diisi"); return; }
    if (!selectedType) { setError("Pilih jenis usaha"); return; }
    if (!profile?.id) return;

    setLoading(true);
    try {
      await createBusiness(profile.id, {
        name: name.trim(),
        type: selectedType,
        description: null,
        address: null,
        logo_url: null,
      });
      showToast("Usaha berhasil dibuat!", "success");
      router.back();
    } catch {
      setError("Gagal membuat usaha. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg">
      <View className="flex-row items-center px-4 py-3 border-b border-border-color bg-white">
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text className="text-lg text-navy">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-dark-text ml-3">Tambah Usaha</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        <Input
          label="Nama Usaha"
          placeholder="contoh: Warung Bu Tini"
          value={name}
          onChangeText={(t) => { setName(t); setError(""); }}
        />

        <Text className="text-sm font-medium text-dark-text mt-5 mb-2">Jenis Usaha</Text>
        <View className="flex-row flex-wrap">
          {BIZ_TYPES.map((bt) => {
            const isSelected = selectedType === bt.key;
            return (
              <TouchableOpacity
                key={bt.key}
                onPress={() => { setSelectedType(bt.key); setError(""); }}
                className={`mr-2 mb-2 px-4 py-3 rounded-xl border ${isSelected ? "border-lapak bg-lapak/10" : "border-border-color bg-white"}`}
              >
                <Text className="text-center text-lg">{bt.icon}</Text>
                <Text className={`text-xs text-center mt-1 ${isSelected ? "text-lapak font-bold" : "text-grey-text"}`}>
                  {bt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {error ? <Text className="text-sm text-red-500 mt-3">{error}</Text> : null}
      </ScrollView>

      <View className="px-4 pb-8 pt-4">
        <Button title="Buat Usaha" onPress={handleCreate} loading={loading} />
      </View>
    </SafeAreaView>
  );
}
