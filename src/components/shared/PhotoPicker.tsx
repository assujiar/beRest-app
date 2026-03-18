import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

interface PhotoPickerProps {
  label?: string;
  value: string | null;
  onChange: (uri: string) => void;
  placeholder?: string;
  aspect?: [number, number];
}

export function PhotoPicker({
  label,
  value,
  onChange,
  placeholder = "Tambah foto",
  aspect = [4, 3],
}: PhotoPickerProps) {
  const [_loading, setLoading] = useState(false);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Izin Diperlukan",
        "Izinkan Apick mengakses galeri untuk memilih foto."
      );
      return;
    }

    setLoading(true);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect,
      quality: 0.8,
    });

    setLoading(false);
    if (!result.canceled && result.assets[0]) {
      onChange(result.assets[0].uri);
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Izin Diperlukan",
        "Izinkan Apick mengakses kamera untuk mengambil foto."
      );
      return;
    }

    setLoading(true);
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect,
      quality: 0.8,
    });

    setLoading(false);
    if (!result.canceled && result.assets[0]) {
      onChange(result.assets[0].uri);
    }
  }

  function handlePress() {
    Alert.alert("Pilih Foto", "Mau ambil foto dari mana?", [
      { text: "Kamera", onPress: takePhoto },
      { text: "Galeri", onPress: pickImage },
      { text: "Batal", style: "cancel" },
    ]);
  }

  return (
    <View className="w-full">
      {label && (
        <Text className="text-sm font-medium text-dark-text mb-1.5">
          {label}
        </Text>
      )}
      <TouchableOpacity
        onPress={handlePress}
        className="border border-dashed border-border-color rounded-xl h-32 items-center justify-center overflow-hidden"
      >
        {value ? (
          <Image
            source={{ uri: value }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="items-center">
            <Text className="text-2xl mb-1">📷</Text>
            <Text className="text-sm text-grey-text">{placeholder}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
