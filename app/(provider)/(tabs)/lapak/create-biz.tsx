import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { ModuleIcon } from "@components/ui/ModuleIcon";
import { createBusiness } from "@services/lapak.service";
import { useAuthStore } from "@stores/auth.store";
import { useUIStore } from "@stores/ui.store";
import { GRADIENTS, GLASS, RADIUS, TYPO, SPACING } from "@utils/theme";
import Svg, { Path } from "react-native-svg";
import type { BusinessType } from "@app-types/lapak.types";

function LaundryIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 5C3 3.9 3.9 3 5 3H19C20.1 3 21 3.9 21 5V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5Z" stroke={color} strokeWidth={1.8} />
      <Path d="M12 17C14.2 17 16 15.2 16 13C16 10.8 14.2 9 12 9C9.8 9 8 10.8 8 13C8 15.2 9.8 17 12 17Z" stroke={color} strokeWidth={1.8} />
      <Path d="M3 7H21" stroke={color} strokeWidth={1.8} />
      <Path d="M7 5H7.01" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function GuruIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 19.5V15.5C4 14.4 4.9 13.5 6 13.5H18C19.1 13.5 20 14.4 20 15.5V19.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M12 13.5V7" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M2 10L12 5L22 10L12 15L2 10Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function ToolIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M14.7 6.3C14 5 12.8 4 11.4 3.6C10 3.1 8.4 3.3 7.1 4.1L10.5 7.5L9.1 8.9L5.7 5.5C4.3 7.5 4.7 10.3 6.7 11.8C8 12.8 9.7 13.1 11.2 12.6L17.5 18.9C18.1 19.5 19 19.5 19.6 18.9C20.2 18.3 20.2 17.4 19.6 16.8L13.3 10.5C13.8 9 13.5 7.4 14.7 6.3Z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const BIZ_TYPES: { key: BusinessType; label: string; icon: React.ReactNode }[] = [
  { key: "pedagang", label: "Pedagang/Warung", icon: <ModuleIcon module="lapak" size={28} /> },
  { key: "laundry", label: "Laundry", icon: <LaundryIcon size={28} color="#50BFC3" /> },
  { key: "guru", label: "Guru/Pelatih", icon: <GuruIcon size={28} color="#50BFC3" /> },
  { key: "jasa_umum", label: "Jasa Umum", icon: <ToolIcon size={28} color="#50BFC3" /> },
];

export default function CreateBizScreen() {
  const insets = useSafeAreaInsets();
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
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Gradient Header */}
      <LinearGradient
        colors={[...GRADIENTS.lapak]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + SPACING.sm,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.md,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Text style={{ ...TYPO.h3, color: "#FFFFFF" }}>{"\u2190"}</Text>
          </TouchableOpacity>
          <Text style={{ ...TYPO.h3, color: "#FFFFFF", marginLeft: SPACING.md }}>
            Tambah Usaha
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.md, paddingTop: SPACING.lg }}
      >
        <Input
          label="Nama Usaha"
          placeholder="contoh: Warung Bu Tini"
          value={name}
          onChangeText={(t) => { setName(t); setError(""); }}
        />

        <Text
          style={{
            ...TYPO.small,
            color: "#94A3B8",
            textTransform: "uppercase",
            letterSpacing: 0.8,
            marginTop: SPACING.xl,
            marginBottom: SPACING.sm,
          }}
        >
          JENIS USAHA
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {BIZ_TYPES.map((bt) => {
            const isSelected = selectedType === bt.key;
            return (
              <TouchableOpacity
                key={bt.key}
                onPress={() => { setSelectedType(bt.key); setError(""); }}
                style={{
                  marginRight: SPACING.sm,
                  marginBottom: SPACING.sm,
                  paddingHorizontal: SPACING.md,
                  paddingVertical: SPACING.md,
                  borderRadius: RADIUS.xl,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? "#50BFC3" : GLASS.card.border,
                  backgroundColor: isSelected ? "rgba(80,191,195,0.08)" : GLASS.card.background,
                  ...GLASS.shadow.sm,
                  alignItems: "center",
                  width: "47%",
                }}
              >
                {bt.icon}
                <Text
                  style={{
                    ...(isSelected ? TYPO.captionBold : TYPO.caption),
                    color: isSelected ? "#50BFC3" : "#64748B",
                    marginTop: SPACING.sm,
                    textAlign: "center",
                  }}
                >
                  {bt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {error ? (
          <Text style={{ ...TYPO.caption, color: "#EF4444", marginTop: SPACING.md }}>
            {error}
          </Text>
        ) : null}
      </ScrollView>

      <View
        style={{
          paddingHorizontal: SPACING.md,
          paddingBottom: insets.bottom + SPACING.lg,
          paddingTop: SPACING.md,
        }}
      >
        <Button title="Buat Usaha" onPress={handleCreate} loading={loading} />
      </View>
    </View>
  );
}
