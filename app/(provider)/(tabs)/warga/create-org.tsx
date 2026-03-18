import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { createOrganization } from "@services/warga.service";
import { useAuthStore } from "@stores/auth.store";
import { useUIStore } from "@stores/ui.store";
import type { OrgType } from "@app-types/warga.types";

const ORG_TYPES: { key: OrgType; label: string; icon: string }[] = [
  { key: "rt_rw", label: "RT/RW", icon: "🏘️" },
  { key: "komplek", label: "Komplek", icon: "🏢" },
  { key: "mesjid", label: "Mesjid", icon: "🕌" },
  { key: "pengajian", label: "Pengajian", icon: "📖" },
  { key: "klub", label: "Klub/Komunitas", icon: "⚽" },
  { key: "sekolah", label: "Sekolah", icon: "🎓" },
  { key: "alumni", label: "Alumni", icon: "🎓" },
  { key: "other", label: "Lainnya", icon: "📋" },
];

export default function CreateOrgScreen() {
  const profile = useAuthStore((s) => s.profile);
  const showToast = useUIStore((s) => s.showToast);
  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState<OrgType | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!name.trim()) {
      setError("Nama organisasi wajib diisi");
      return;
    }
    if (!selectedType) {
      setError("Pilih jenis organisasi");
      return;
    }
    if (!profile?.id) return;

    setLoading(true);
    setError("");
    try {
      const org = await createOrganization(profile.id, {
        name: name.trim(),
        type: selectedType,
        description: description.trim() || null,
        logo_url: null,
      });
      showToast(`${org.name} berhasil dibuat!`, "success");
      router.back();
    } catch {
      setError("Gagal membuat organisasi. Coba lagi.");
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
        <Text className="text-lg font-bold text-dark-text ml-3">
          Buat Organisasi
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        <Input
          label="Nama Organisasi"
          placeholder="contoh: RT 05 RW 03 Cempaka"
          value={name}
          onChangeText={(t) => {
            setName(t);
            setError("");
          }}
        />

        <Text className="text-sm font-medium text-dark-text mt-5 mb-2">
          Jenis Organisasi
        </Text>
        <View className="flex-row flex-wrap">
          {ORG_TYPES.map((ot) => {
            const isSelected = selectedType === ot.key;
            return (
              <TouchableOpacity
                key={ot.key}
                onPress={() => {
                  setSelectedType(ot.key);
                  setError("");
                }}
                className={`
                  mr-2 mb-2 px-4 py-3 rounded-xl border
                  ${isSelected ? "border-warga bg-warga/10" : "border-border-color bg-white"}
                `}
              >
                <Text className="text-center text-lg">{ot.icon}</Text>
                <Text
                  className={`text-xs text-center mt-1 ${isSelected ? "text-warga font-bold" : "text-grey-text"}`}
                >
                  {ot.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="mt-4">
          <Input
            label="Deskripsi (opsional)"
            placeholder="contoh: RT 05 RW 03 Kelurahan Cempaka Putih"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {error ? (
          <Text className="text-sm text-red-500 mt-3">{error}</Text>
        ) : null}
      </ScrollView>

      <View className="px-4 pb-8 pt-4">
        <Button title="Buat Organisasi" onPress={handleCreate} loading={loading} />
      </View>
    </SafeAreaView>
  );
}
