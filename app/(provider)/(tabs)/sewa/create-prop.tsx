import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Rect } from "react-native-svg";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { UpgradeModal } from "@components/shared/UpgradeModal";
import { createProperty, getProperties } from "@services/sewa.service";
import { useSubscription } from "@hooks/shared/useSubscription";
import { useAuthStore } from "@stores/auth.store";
import { useUIStore } from "@stores/ui.store";
import { GRADIENTS, GLASS, RADIUS, TYPO, SPACING } from "@utils/theme";
import type { PropertyType } from "@app-types/sewa.types";

function BackIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function KosIcon({ size = 28, color = "#00C49A" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 21H21" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M5 21V7L12 3L19 7V21" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Rect x={8} y={10} width={3} height={4} rx={0.5} stroke={color} strokeWidth={1.5} />
      <Rect x={13} y={10} width={3} height={4} rx={0.5} stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

function KontrakanIcon({ size = 28, color = "#00C49A" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 12L12 4L21 12" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 10V20H19V10" stroke={color} strokeWidth={1.8} />
      <Rect x={9} y={14} width={6} height={6} stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

function RumahIcon({ size = 28, color = "#00C49A" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 12L12 4L21 12" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 10V20H19V10" stroke={color} strokeWidth={1.8} />
      <Path d="M10 20V15H14V20" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function ApartmentIcon({ size = 28, color = "#00C49A" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={4} y={3} width={16} height={18} rx={1} stroke={color} strokeWidth={1.8} />
      <Rect x={7} y={6} width={3} height={3} stroke={color} strokeWidth={1.2} />
      <Rect x={14} y={6} width={3} height={3} stroke={color} strokeWidth={1.2} />
      <Rect x={7} y={12} width={3} height={3} stroke={color} strokeWidth={1.2} />
      <Rect x={14} y={12} width={3} height={3} stroke={color} strokeWidth={1.2} />
      <Path d="M10 21V18H14V21" stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

const PROP_TYPES: { key: PropertyType; label: string; Icon: React.FC<{ size?: number; color?: string }> }[] = [
  { key: "kos", label: "Kos", Icon: KosIcon },
  { key: "kontrakan", label: "Kontrakan", Icon: KontrakanIcon },
  { key: "rumah_sewa", label: "Rumah Sewa", Icon: RumahIcon },
  { key: "apartment", label: "Apartment", Icon: ApartmentIcon },
];

export default function CreatePropertyScreen() {
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((s) => s.profile);
  const showToast = useUIStore((s) => s.showToast);
  const { tier, requireUpgrade, showUpgrade, setShowUpgrade, upgradeFeature } = useSubscription();
  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState<PropertyType | null>(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [propCount, setPropCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (profile?.id) {
        getProperties(profile.id).then((data) => setPropCount(data.length)).catch(() => {});
      }
    }, [profile?.id])
  );

  async function handleCreate() {
    if (!name.trim()) { setError("Nama properti wajib diisi"); return; }
    if (!selectedType) { setError("Pilih jenis properti"); return; }
    if (!profile?.id) return;
    if (requireUpgrade("maxUnits", "Tambah Properti", propCount)) return;
    setLoading(true);
    try {
      await createProperty(profile.id, { name: name.trim(), type: selectedType, address: address.trim() || null, total_units: null });
      showToast("Properti berhasil dibuat!", "success");
      router.back();
    } catch { setError("Gagal membuat properti"); } finally { setLoading(false); }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Gradient Header */}
      <LinearGradient
        colors={GRADIENTS.sewa}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + SPACING.sm,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.lg,
          borderBottomLeftRadius: RADIUS.xxl,
          borderBottomRightRadius: RADIUS.xxl,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={{ ...TYPO.h3, color: "#FFFFFF", marginLeft: SPACING.md }}>Tambah Properti</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.lg, paddingTop: SPACING.md }}
      >
        <Input label="Nama Properti" placeholder="contoh: Kos Bu Ani" value={name} onChangeText={(t) => { setName(t); setError(""); }} />

        <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, marginTop: SPACING.lg, marginBottom: SPACING.sm }}>
          JENIS PROPERTI
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm }}>
          {PROP_TYPES.map((pt) => {
            const isSelected = selectedType === pt.key;
            return (
              <TouchableOpacity
                key={pt.key}
                onPress={() => { setSelectedType(pt.key); setError(""); }}
                style={{
                  paddingHorizontal: SPACING.md,
                  paddingVertical: SPACING.md,
                  borderRadius: RADIUS.lg,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? "#00C49A" : GLASS.card.border,
                  backgroundColor: isSelected ? "rgba(0,196,154,0.08)" : GLASS.card.background,
                  alignItems: "center",
                  minWidth: 80,
                  ...GLASS.shadow.sm,
                }}
              >
                <pt.Icon size={28} color={isSelected ? "#00C49A" : "#94A3B8"} />
                <Text style={{ ...TYPO.captionBold, color: isSelected ? "#00C49A" : "#64748B", marginTop: SPACING.xs, textAlign: "center" }}>{pt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ marginTop: SPACING.lg }}>
          <Input label="Alamat (opsional)" placeholder="contoh: Jl. Melati No. 5" value={address} onChangeText={setAddress} />
        </View>

        {error ? <Text style={{ ...TYPO.caption, color: "#EF4444", marginTop: SPACING.md }}>{error}</Text> : null}
      </ScrollView>

      <View style={{ paddingHorizontal: SPACING.lg, paddingBottom: insets.bottom + SPACING.lg, paddingTop: SPACING.md }}>
        <Button title="Buat Properti" onPress={handleCreate} loading={loading} />
      </View>

      <UpgradeModal visible={showUpgrade} onClose={() => setShowUpgrade(false)} currentTier={tier} featureName={upgradeFeature} />
    </View>
  );
}
