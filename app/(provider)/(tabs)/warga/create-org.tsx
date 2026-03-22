import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { createOrganization } from "@services/warga.service";
import { useAuthStore } from "@stores/auth.store";
import { useUIStore } from "@stores/ui.store";
import { GRADIENTS, GLASS, RADIUS, TYPO, SPACING } from "@utils/theme";
import { COLORS } from "@utils/colors";
import type { OrgType } from "@app-types/warga.types";
import Svg, { Path, Rect, Circle } from "react-native-svg";

const ORG_TYPES: { key: OrgType; label: string; icon: (color: string) => React.ReactNode }[] = [
  {
    key: "rt_rw",
    label: "RT/RW",
    icon: (color) => (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M3 21H21" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Path d="M5 21V10L12 5L19 10V21" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
        <Rect x={9} y={14} width={6} height={7} rx={0.5} stroke={color} strokeWidth={1.5} />
      </Svg>
    ),
  },
  {
    key: "komplek",
    label: "Komplek",
    icon: (color) => (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Rect x={3} y={6} width={8} height={15} rx={1} stroke={color} strokeWidth={1.8} />
        <Rect x={13} y={3} width={8} height={18} rx={1} stroke={color} strokeWidth={1.8} />
        <Rect x={5} y={9} width={2} height={2} rx={0.5} fill={color} />
        <Rect x={5} y={13} width={2} height={2} rx={0.5} fill={color} />
        <Rect x={15} y={6} width={2} height={2} rx={0.5} fill={color} />
        <Rect x={15} y={10} width={2} height={2} rx={0.5} fill={color} />
        <Rect x={15} y={14} width={2} height={2} rx={0.5} fill={color} />
      </Svg>
    ),
  },
  {
    key: "mesjid",
    label: "Mesjid",
    icon: (color) => (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M4 21V13C4 10 8 7 12 7C16 7 20 10 20 13V21" stroke={color} strokeWidth={1.8} />
        <Path d="M12 7V4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Circle cx={12} cy={3} r={1} fill={color} />
        <Path d="M4 21H20" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Rect x={10} y={16} width={4} height={5} rx={0.5} stroke={color} strokeWidth={1.5} />
      </Svg>
    ),
  },
  {
    key: "pengajian",
    label: "Pengajian",
    icon: (color) => (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M4 19.5V4.5C4 3.7 4.7 3 5.5 3H18.5C19.3 3 20 3.7 20 4.5V19.5C20 20.3 19.3 21 18.5 21H5.5C4.7 21 4 20.3 4 19.5Z" stroke={color} strokeWidth={1.8} />
        <Path d="M8 7H16" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        <Path d="M8 11H16" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        <Path d="M8 15H13" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      </Svg>
    ),
  },
  {
    key: "klub",
    label: "Klub/Komunitas",
    icon: (color) => (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8} />
        <Path d="M12 3C12 3 8 8 8 12C8 16 12 21 12 21" stroke={color} strokeWidth={1.5} />
        <Path d="M12 3C12 3 16 8 16 12C16 16 12 21 12 21" stroke={color} strokeWidth={1.5} />
        <Path d="M3.5 10H20.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        <Path d="M3.5 14H20.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      </Svg>
    ),
  },
  {
    key: "sekolah",
    label: "Sekolah",
    icon: (color) => (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M2 10L12 5L22 10L12 15L2 10Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
        <Path d="M6 12V18L12 21L18 18V12" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
        <Path d="M22 10V16" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      </Svg>
    ),
  },
  {
    key: "alumni",
    label: "Alumni",
    icon: (color) => (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M2 10L12 5L22 10L12 15L2 10Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
        <Path d="M6 12V18L12 21L18 18V12" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
        <Path d="M22 10V16" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      </Svg>
    ),
  },
  {
    key: "other",
    label: "Lainnya",
    icon: (color) => (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Rect x={3} y={3} width={18} height={18} rx={2} stroke={color} strokeWidth={1.8} />
        <Path d="M8 7H16" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        <Path d="M8 11H16" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        <Path d="M8 15H12" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      </Svg>
    ),
  },
];

export default function CreateOrgScreen() {
  const insets = useSafeAreaInsets();
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
    <View style={{ flex: 1, backgroundColor: COLORS.lightBg }}>
      {/* Gradient Header */}
      <LinearGradient
        colors={GRADIENTS.warga}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + SPACING.sm,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.md,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={12}
            style={{
              width: 36,
              height: 36,
              borderRadius: RADIUS.full,
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M15 18L9 12L15 6" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <Text style={{ ...TYPO.h3, color: "#FFFFFF", marginLeft: SPACING.md }}>
            Buat Organisasi
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.md, paddingBottom: SPACING.xxl }}
      >
        <Input
          label="Nama Organisasi"
          placeholder="contoh: RT 05 RW 03 Cempaka"
          value={name}
          onChangeText={(t) => {
            setName(t);
            setError("");
          }}
        />

        <Text style={{ ...TYPO.bodyBold, color: COLORS.darkText, marginTop: SPACING.lg, marginBottom: SPACING.sm }}>
          Jenis Organisasi
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {ORG_TYPES.map((ot) => {
            const isSelected = selectedType === ot.key;
            return (
              <TouchableOpacity
                key={ot.key}
                onPress={() => {
                  setSelectedType(ot.key);
                  setError("");
                }}
                style={{
                  marginRight: SPACING.sm,
                  marginBottom: SPACING.sm,
                  paddingHorizontal: SPACING.md,
                  paddingVertical: SPACING.md,
                  borderRadius: RADIUS.lg,
                  borderWidth: 1.5,
                  borderColor: isSelected ? COLORS.warga : COLORS.border,
                  backgroundColor: isSelected ? "rgba(251,143,103,0.1)" : GLASS.card.background,
                  alignItems: "center",
                  minWidth: 80,
                  ...GLASS.shadow.sm,
                }}
              >
                <View style={{ marginBottom: SPACING.xs }}>
                  {ot.icon(isSelected ? COLORS.warga : COLORS.greyText)}
                </View>
                <Text
                  style={{
                    ...TYPO.caption,
                    fontWeight: isSelected ? "700" : "400",
                    color: isSelected ? COLORS.warga : COLORS.greyText,
                    textAlign: "center",
                  }}
                >
                  {ot.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ marginTop: SPACING.md }}>
          <Input
            label="Deskripsi (opsional)"
            placeholder="contoh: RT 05 RW 03 Kelurahan Cempaka Putih"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {error ? (
          <Text style={{ ...TYPO.caption, color: COLORS.red, marginTop: SPACING.md }}>
            {error}
          </Text>
        ) : null}
      </ScrollView>

      <View
        style={{
          paddingHorizontal: SPACING.md,
          paddingBottom: insets.bottom + SPACING.md,
          paddingTop: SPACING.md,
          backgroundColor: GLASS.card.background,
          borderTopWidth: 1,
          borderTopColor: GLASS.card.border,
        }}
      >
        <Button title="Buat Organisasi" onPress={handleCreate} loading={loading} />
      </View>
    </View>
  );
}
