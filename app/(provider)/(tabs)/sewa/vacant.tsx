import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { Card } from "@components/ui/Card";
import { EmptyState } from "@components/shared/EmptyState";
import { getVacantUnits } from "@services/sewa.service";
import { shareViaWhatsApp } from "@services/wa-share.service";
import { formatRupiah } from "@utils/format";
import { GRADIENTS, GLASS, RADIUS, TYPO, SPACING } from "@utils/theme";
import type { PropertyUnit } from "@app-types/sewa.types";

function BackIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ShareIcon({ size = 14, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function VacantScreen() {
  const insets = useSafeAreaInsets();
  const { propId, propName } = useLocalSearchParams<{ propId: string; propName: string }>();
  const [units, setUnits] = useState<PropertyUnit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (propId) loadData(); }, [propId]);

  async function loadData() {
    try { setUnits(await getVacantUnits(propId!)); } catch { /* silent */ } finally { setLoading(false); }
  }

  function handleShare(unit: PropertyUnit) {
    const msg = `🏠 *${propName} - ${unit.unit_name}*\n\nHarga sewa: ${formatRupiah(unit.monthly_rent)}/bulan\n\nHubungi untuk info lebih lanjut.\n\nDibuat dengan Apick`;
    shareViaWhatsApp(msg);
  }

  function handleShareAll() {
    const unitList = units.map((u) => `• ${u.unit_name}: ${formatRupiah(u.monthly_rent)}/bln`).join("\n");
    const msg = `🏠 *${propName}*\n\nUnit tersedia:\n${unitList}\n\nHubungi untuk info lebih lanjut.\n\nDibuat dengan Apick`;
    shareViaWhatsApp(msg);
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
          <Text style={{ ...TYPO.h3, color: "#FFFFFF", marginLeft: SPACING.md }}>Unit Kosong</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.lg, paddingTop: SPACING.md }}
      >
        {!loading && units.length === 0 ? (
          <EmptyState illustration="🎉" title="Semua unit terisi!" description="Tidak ada unit kosong saat ini" />
        ) : (
          <>
            {units.length > 1 && (
              <TouchableOpacity
                onPress={handleShareAll}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: SPACING.sm,
                  backgroundColor: "#25D366",
                  borderRadius: RADIUS.lg,
                  paddingVertical: SPACING.md,
                  marginBottom: SPACING.md,
                  ...GLASS.shadow.sm,
                }}
              >
                <ShareIcon size={16} color="#FFFFFF" />
                <Text style={{ ...TYPO.captionBold, color: "#FFFFFF" }}>Bagikan Semua via WA</Text>
              </TouchableOpacity>
            )}
            {units.map((u) => (
              <Card key={u.id} variant="glass">
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>{u.unit_name}</Text>
                    <Text style={{ ...TYPO.bodyBold, color: "#00C49A", marginTop: 2 }}>{formatRupiah(u.monthly_rent)}/bln</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleShare(u)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#25D366",
                      borderRadius: RADIUS.md,
                      paddingHorizontal: SPACING.md,
                      paddingVertical: SPACING.sm,
                      gap: SPACING.xs,
                    }}
                  >
                    <ShareIcon size={12} color="#FFFFFF" />
                    <Text style={{ ...TYPO.captionBold, color: "#FFFFFF" }}>WA</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
