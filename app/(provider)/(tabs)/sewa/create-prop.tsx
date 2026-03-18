import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { createProperty } from "@services/sewa.service";
import { useAuthStore } from "@stores/auth.store";
import { useUIStore } from "@stores/ui.store";
import type { PropertyType } from "@app-types/sewa.types";

const PROP_TYPES: { key: PropertyType; label: string; icon: string }[] = [
  { key: "kos", label: "Kos", icon: "🏘️" },
  { key: "kontrakan", label: "Kontrakan", icon: "🏠" },
  { key: "rumah_sewa", label: "Rumah Sewa", icon: "🏡" },
  { key: "apartment", label: "Apartment", icon: "🏢" },
];

export default function CreatePropertyScreen() {
  const profile = useAuthStore((s) => s.profile);
  const showToast = useUIStore((s) => s.showToast);
  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState<PropertyType | null>(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!name.trim()) { setError("Nama properti wajib diisi"); return; }
    if (!selectedType) { setError("Pilih jenis properti"); return; }
    if (!profile?.id) return;
    setLoading(true);
    try {
      await createProperty(profile.id, { name: name.trim(), type: selectedType, address: address.trim() || null, total_units: null });
      showToast("Properti berhasil dibuat!", "success");
      router.back();
    } catch { setError("Gagal membuat properti"); } finally { setLoading(false); }
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg">
      <View className="flex-row items-center px-4 py-3 border-b border-border-color bg-white">
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}><Text className="text-lg text-navy">←</Text></TouchableOpacity>
        <Text className="text-lg font-bold text-dark-text ml-3">Tambah Properti</Text>
      </View>
      <ScrollView className="flex-1 px-4 pt-4">
        <Input label="Nama Properti" placeholder="contoh: Kos Bu Ani" value={name} onChangeText={(t) => { setName(t); setError(""); }} />
        <Text className="text-sm font-medium text-dark-text mt-5 mb-2">Jenis Properti</Text>
        <View className="flex-row flex-wrap">
          {PROP_TYPES.map((pt) => {
            const isSelected = selectedType === pt.key;
            return (
              <TouchableOpacity key={pt.key} onPress={() => { setSelectedType(pt.key); setError(""); }} className={`mr-2 mb-2 px-4 py-3 rounded-xl border ${isSelected ? "border-sewa bg-sewa/10" : "border-border-color bg-white"}`}>
                <Text className="text-center text-lg">{pt.icon}</Text>
                <Text className={`text-xs text-center mt-1 ${isSelected ? "text-sewa font-bold" : "text-grey-text"}`}>{pt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View className="mt-4">
          <Input label="Alamat (opsional)" placeholder="contoh: Jl. Melati No. 5" value={address} onChangeText={setAddress} />
        </View>
        {error ? <Text className="text-sm text-red-500 mt-3">{error}</Text> : null}
      </ScrollView>
      <View className="px-4 pb-8 pt-4">
        <Button title="Buat Properti" onPress={handleCreate} loading={loading} />
      </View>
    </SafeAreaView>
  );
}
