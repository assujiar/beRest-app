import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { EmptyState } from "@components/shared/EmptyState";
import { ModuleIcon } from "@components/ui/ModuleIcon";
import { getEvents } from "@services/hajat.service";
import { useAuthStore } from "@stores/auth.store";
import { formatDate } from "@utils/format";
import { GRADIENTS, RADIUS, TYPO, SPACING } from "@utils/theme";
import type { HajatEvent, EventType, EventStatus } from "@app-types/hajat.types";


const TYPE_LABELS: Record<EventType, string> = { nikah: "Nikahan", khitan: "Khitanan", aqiqah: "Aqiqah", ultah: "Ulang Tahun", syukuran: "Syukuran", duka: "Duka Cita", custom: "Lainnya" };
const STATUS_MAP: Record<EventStatus, { label: string; variant: "info" | "success" | "neutral" }> = { draft: { label: "Draft", variant: "info" }, published: { label: "Terbit", variant: "success" }, completed: { label: "Selesai", variant: "neutral" } };

function PlusIcon({ size = 16, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5V19M5 12H19" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

export default function HajatScreen() {
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((s) => s.profile);
  const [events, setEvents] = useState<HajatEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (profile?.id) loadData(); }, [profile?.id]);
  async function loadData() { try { setEvents(await getEvents(profile!.id)); } catch {} finally { setLoading(false); } }

  if (!loading && events.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F8FAFC", paddingTop: insets.top }}>
        <EmptyState illustration="🎉" title="Belum ada acara" description="Bikin undangan digital atau mulai catat amplop" actionLabel="+ Buat Acara" onAction={() => router.push("/(provider)/(tabs)/hajat/create-event")} />
      </View>
    );
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
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
            <ModuleIcon module="hajat" size={22} color="#FFFFFF" />
            <Text style={{ ...TYPO.h2, color: "#FFFFFF" }}>Hajat</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(provider)/(tabs)/hajat/create-event")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.25)",
              borderRadius: RADIUS.md,
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              gap: SPACING.xs,
            }}
          >
            <PlusIcon size={14} color="#FFFFFF" />
            <Text style={{ ...TYPO.captionBold, color: "#FFFFFF" }}>Buat</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={{ flex: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.md }}>
        {events.map((e) => {
          const s = STATUS_MAP[e.status];
          return (
            <TouchableOpacity key={e.id} onPress={() => router.push({ pathname: "/(provider)/(tabs)/hajat/event-detail", params: { eventId: e.id, eventTitle: e.title } })} activeOpacity={0.7}>
              <Card variant="glass">
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{
                    width: 48, height: 48, borderRadius: RADIUS.full,
                    backgroundColor: "rgba(217,88,119,0.1)",
                    alignItems: "center", justifyContent: "center", marginRight: SPACING.md,
                  }}>
                    <ModuleIcon module="hajat" size={24} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>{e.title}</Text>
                    <Text style={{ ...TYPO.caption, color: "#64748B" }}>{TYPE_LABELS[e.type]} • {formatDate(e.event_date)}</Text>
                  </View>
                  <Badge label={s.label} variant={s.variant} />
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
