import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { UpgradeModal } from "@components/shared/UpgradeModal";
import { createEvent, getEvents } from "@services/hajat.service";
import { useSubscription } from "@hooks/shared/useSubscription";
import { useAuthStore } from "@stores/auth.store";
import { useUIStore } from "@stores/ui.store";
import { GRADIENTS, GLASS, RADIUS, TYPO, SPACING } from "@utils/theme";
import type { EventType } from "@app-types/hajat.types";

const MODULE_COLOR = "#D95877";

const EVENT_TYPES: { key: EventType; label: string; icon: string }[] = [
  { key: "nikah", label: "Nikahan", icon: "💍" }, { key: "khitan", label: "Khitanan", icon: "👦" },
  { key: "aqiqah", label: "Aqiqah", icon: "👶" }, { key: "ultah", label: "Ulang Tahun", icon: "🎂" },
  { key: "syukuran", label: "Syukuran", icon: "🙏" }, { key: "duka", label: "Duka Cita", icon: "🕊️" },
  { key: "custom", label: "Lainnya", icon: "📋" },
];

function BackIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 19L8 12L15 5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function CreateEventScreen() {
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((s) => s.profile);
  const showToast = useUIStore((s) => s.showToast);
  const { tier, requireUpgrade, showUpgrade, setShowUpgrade, upgradeFeature } = useSubscription();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EventType | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [eventCount, setEventCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (profile?.id) {
        getEvents(profile.id).then((data) => setEventCount(data.length)).catch(() => {});
      }
    }, [profile?.id])
  );

  async function handleCreate() {
    if (!title.trim()) { setError("Nama acara wajib diisi"); return; }
    if (!type) { setError("Pilih jenis acara"); return; }
    if (!date.trim()) { setError("Tanggal wajib diisi"); return; }
    if (!profile?.id) return;
    if (requireUpgrade("maxEvents", "Buat Acara", eventCount)) return;
    setLoading(true);
    try {
      await createEvent(profile.id, { title: title.trim(), type, event_date: date, event_time: time || null, location_name: location.trim() || null, location_address: null, location_maps_url: null, cover_photo: null, custom_message: null });
      showToast("Acara berhasil dibuat!", "success"); router.back();
    } catch { setError("Gagal membuat acara"); } finally { setLoading(false); }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Gradient Header */}
      <LinearGradient
        colors={GRADIENTS.hajat}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + SPACING.sm, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.md }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.md }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <BackIcon size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ ...TYPO.h3, color: "#FFFFFF" }}>Buat Acara</Text>
        </View>
      </LinearGradient>

      <ScrollView style={{ flex: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.md }}>
        <Input label="Nama Acara" placeholder="contoh: Pernikahan Budi & Ani" value={title} onChangeText={(t: string) => { setTitle(t); setError(""); }} />

        <Text style={{ ...TYPO.bodyBold, color: "#1E293B", marginTop: SPACING.lg, marginBottom: SPACING.sm }}>Jenis Acara</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {EVENT_TYPES.map((et) => {
            const sel = type === et.key;
            return (
              <TouchableOpacity
                key={et.key}
                onPress={() => { setType(et.key); setError(""); }}
                style={{
                  marginRight: SPACING.sm,
                  marginBottom: SPACING.sm,
                  paddingHorizontal: SPACING.md,
                  paddingVertical: SPACING.sm,
                  borderRadius: RADIUS.lg,
                  borderWidth: 1.5,
                  borderColor: sel ? MODULE_COLOR : "#E2E8F0",
                  backgroundColor: sel ? "rgba(217,88,119,0.08)" : GLASS.card.background,
                  ...GLASS.shadow.sm,
                }}
              >
                <Text style={{ textAlign: "center", fontSize: 18 }}>{et.icon}</Text>
                <Text style={{ ...TYPO.caption, textAlign: "center", color: sel ? MODULE_COLOR : "#64748B", fontWeight: sel ? "700" : "400" }}>{et.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ marginTop: SPACING.md }}>
          <Input label="Tanggal (YYYY-MM-DD)" placeholder="contoh: 2026-05-15" value={date} onChangeText={(t: string) => { setDate(t); setError(""); }} />
        </View>
        <View style={{ marginTop: SPACING.md }}>
          <Input label="Waktu (opsional)" placeholder="contoh: 10:00" value={time} onChangeText={setTime} />
        </View>
        <View style={{ marginTop: SPACING.md }}>
          <Input label="Tempat (opsional)" placeholder="contoh: Gedung Serbaguna" value={location} onChangeText={setLocation} />
        </View>
        {error ? <Text style={{ ...TYPO.caption, color: "#EF4444", marginTop: SPACING.md }}>{error}</Text> : null}
      </ScrollView>

      <View style={{ paddingHorizontal: SPACING.md, paddingBottom: insets.bottom + SPACING.lg, paddingTop: SPACING.md }}>
        <Button title="Buat Acara" onPress={handleCreate} loading={loading} />
      </View>

      <UpgradeModal visible={showUpgrade} onClose={() => setShowUpgrade(false)} currentTier={tier} featureName={upgradeFeature} />
    </View>
  );
}
