import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Input } from "@components/ui/Input";
import { Button } from "@components/ui/Button";
import { useAuthStore } from "@stores/auth.store";
import { upsertProfile } from "@services/auth.service";
import { supabase } from "@services/supabase";
import { useUIStore } from "@stores/ui.store";

export default function EditProfileScreen() {
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const showToast = useUIStore((s) => s.showToast);

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [avatarUri, setAvatarUri] = useState(profile?.avatar_url ?? "");
  const [loading, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setAvatarUri(profile.avatar_url ?? "");
    }
  }, [profile]);

  async function pickAvatar() {
    Alert.alert("Foto Profil", "Pilih sumber foto", [
      {
        text: "Kamera",
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Izin Diperlukan", "Izinkan akses kamera untuk mengambil foto.");
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });
          if (!result.canceled && result.assets[0]) {
            await uploadAvatar(result.assets[0].uri);
          }
        },
      },
      {
        text: "Galeri",
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Izin Diperlukan", "Izinkan akses galeri untuk memilih foto.");
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });
          if (!result.canceled && result.assets[0]) {
            await uploadAvatar(result.assets[0].uri);
          }
        },
      },
      { text: "Batal", style: "cancel" },
    ]);
  }

  async function uploadAvatar(uri: string) {
    if (!session?.user.id) return;
    setUploading(true);

    try {
      const ext = uri.split(".").pop() ?? "jpg";
      const fileName = `${session.user.id}/avatar.${ext}`;

      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, arrayBuffer, {
          contentType: `image/${ext}`,
          upsert: true,
        });

      if (uploadError) {
        // If bucket doesn't exist or upload fails, just use local URI
        setAvatarUri(uri);
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      setAvatarUri(urlData.publicUrl);
    } catch {
      // Fallback to local URI
      setAvatarUri(uri);
    }

    setUploading(false);
  }

  async function handleSave() {
    if (!session?.user.id) return;

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      showToast("Nama tidak boleh kosong", "error");
      return;
    }

    setSaving(true);

    const { data, error } = await upsertProfile(session.user.id, {
      full_name: trimmedName,
      avatar_url: avatarUri || null,
    });

    setSaving(false);

    if (error) {
      showToast("Gagal menyimpan profil. Coba lagi ya.", "error");
      return;
    }

    if (data) setProfile(data);
    showToast("Profil berhasil disimpan!", "success");
    router.back();
  }

  const initial = (fullName || profile?.full_name || "?")[0].toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      {/* Header */}
      <View className="px-4 py-3 border-b border-border-color bg-white flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 py-1">
          <Text className="text-navy text-base font-bold">{"< Kembali"}</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-dark-text">Edit Profil</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6" keyboardShouldPersistTaps="handled">
        {/* Avatar */}
        <View className="items-center mb-6">
          <TouchableOpacity onPress={pickAvatar} disabled={uploading}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                className="w-24 h-24 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-navy items-center justify-center">
                <Text className="text-3xl text-white font-bold">{initial}</Text>
              </View>
            )}
            <View className="absolute bottom-0 right-0 bg-white rounded-full w-8 h-8 items-center justify-center border border-border-color">
              <Text className="text-sm">
                {uploading ? "..." : "Edit"}
              </Text>
            </View>
          </TouchableOpacity>
          <Text className="text-xs text-grey-text mt-2">
            Ketuk untuk ganti foto
          </Text>
        </View>

        {/* Name */}
        <Input
          label="Nama Lengkap"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Masukkan nama kamu"
        />

        {/* Read-only info */}
        {profile?.phone && (
          <View className="mt-4">
            <Text className="text-sm font-medium text-dark-text mb-1.5">Nomor HP</Text>
            <View className="h-[52px] rounded-lg border border-border-color px-4 justify-center bg-gray-50">
              <Text className="text-base text-grey-text">{profile.phone}</Text>
            </View>
            <Text className="text-xs text-grey-text mt-1">
              Ubah di Metode Login
            </Text>
          </View>
        )}

        {profile?.email && (
          <View className="mt-4">
            <Text className="text-sm font-medium text-dark-text mb-1.5">Email</Text>
            <View className="h-[52px] rounded-lg border border-border-color px-4 justify-center bg-gray-50">
              <Text className="text-base text-grey-text">{profile.email}</Text>
            </View>
            <Text className="text-xs text-grey-text mt-1">
              Ubah di Metode Login
            </Text>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>

      {/* Save button - thumb zone */}
      <View className="px-4 pb-8 pt-2 bg-light-bg">
        <Button
          title="Simpan"
          onPress={handleSave}
          loading={loading}
        />
      </View>
    </SafeAreaView>
  );
}
