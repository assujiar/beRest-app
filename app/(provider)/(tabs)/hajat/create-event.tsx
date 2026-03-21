import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { UpgradeModal } from "@components/shared/UpgradeModal";
import { createEvent, getEvents } from "@services/hajat.service";
import { useSubscription } from "@hooks/shared/useSubscription";
import { useAuthStore } from "@stores/auth.store";
import { useUIStore } from "@stores/ui.store";
import type { EventType } from "@app-types/hajat.types";

const EVENT_TYPES: { key: EventType; label: string; icon: string }[] = [
  { key: "nikah", label: "Nikahan", icon: "💍" }, { key: "khitan", label: "Khitanan", icon: "👦" },
  { key: "aqiqah", label: "Aqiqah", icon: "👶" }, { key: "ultah", label: "Ulang Tahun", icon: "🎂" },
  { key: "syukuran", label: "Syukuran", icon: "🙏" }, { key: "duka", label: "Duka Cita", icon: "🕊️" },
  { key: "custom", label: "Lainnya", icon: "📋" },
];

export default function CreateEventScreen() {
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

  useEffect(() => {
    if (profile?.id) {
      getEvents(profile.id).then((data) => setEventCount(data.length)).catch(() => {});
    }
  }, [profile?.id]);

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
    <SafeAreaView className="flex-1 bg-light-bg">
      <View className="flex-row items-center px-4 py-3 border-b border-border-color bg-white">
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}><Text className="text-lg text-navy">←</Text></TouchableOpacity>
        <Text className="text-lg font-bold text-dark-text ml-3">Buat Acara</Text>
      </View>
      <ScrollView className="flex-1 px-4 pt-4">
        <Input label="Nama Acara" placeholder="contoh: Pernikahan Budi & Ani" value={title} onChangeText={(t) => { setTitle(t); setError(""); }} />
        <Text className="text-sm font-medium text-dark-text mt-5 mb-2">Jenis Acara</Text>
        <View className="flex-row flex-wrap">
          {EVENT_TYPES.map((et) => {
            const sel = type === et.key;
            return (
              <TouchableOpacity key={et.key} onPress={() => { setType(et.key); setError(""); }} className={`mr-2 mb-2 px-3 py-2 rounded-xl border ${sel ? "border-hajat bg-hajat/10" : "border-border-color bg-white"}`}>
                <Text className="text-center">{et.icon}</Text>
                <Text className={`text-xs text-center ${sel ? "text-hajat font-bold" : "text-grey-text"}`}>{et.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View className="mt-4"><Input label="Tanggal (YYYY-MM-DD)" placeholder="contoh: 2026-05-15" value={date} onChangeText={(t) => { setDate(t); setError(""); }} /></View>
        <View className="mt-3"><Input label="Waktu (opsional)" placeholder="contoh: 10:00" value={time} onChangeText={setTime} /></View>
        <View className="mt-3"><Input label="Tempat (opsional)" placeholder="contoh: Gedung Serbaguna" value={location} onChangeText={setLocation} /></View>
        {error ? <Text className="text-sm text-red-500 mt-3">{error}</Text> : null}
      </ScrollView>
      <View className="px-4 pb-8 pt-4"><Button title="Buat Acara" onPress={handleCreate} loading={loading} /></View>

      <UpgradeModal visible={showUpgrade} onClose={() => setShowUpgrade(false)} currentTier={tier} featureName={upgradeFeature} />
    </SafeAreaView>
  );
}
