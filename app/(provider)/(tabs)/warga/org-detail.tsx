import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Card } from "@components/ui/Card";
import { GRADIENTS, RADIUS, TYPO, SPACING } from "@utils/theme";
import { COLORS } from "@utils/colors";
import Svg, { Path, Circle, Rect } from "react-native-svg";

const MENU_ITEMS = [
  {
    label: "Anggota",
    route: "members",
    icon: (color: string) => (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Circle cx={9} cy={7} r={3} stroke={color} strokeWidth={1.8} />
        <Path d="M3 21V18C3 15.8 4.8 14 7 14H11C13.2 14 15 15.8 15 18V21" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Path d="M16 3.13C17.8 3.57 19 5.14 19 7C19 8.86 17.8 10.43 16 10.87" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Path d="M21 21V18C21 15.93 19.77 14.14 18 13.6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      </Svg>
    ),
  },
  {
    label: "Iuran",
    route: "dues",
    icon: (color: string) => (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Rect x={2} y={6} width={20} height={14} rx={2} stroke={color} strokeWidth={1.8} />
        <Path d="M2 10H22" stroke={color} strokeWidth={1.8} />
        <Path d="M6 14H10" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      </Svg>
    ),
  },
  {
    label: "Keuangan",
    route: "finance",
    icon: (color: string) => (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M12 2V22" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Path d="M17 5H9.5C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14H14.5C16.99 14 19 16.01 19 18.5S16.99 22 14.5 22H6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  },
  {
    label: "Pengumuman",
    route: "announcements",
    icon: (color: string) => (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M18 8C18 6.4 17.4 4.8 16.2 3.6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Path d="M6 8C6 6.4 6.6 4.8 7.8 3.6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Path d="M3.26 11.6C3.1 11.1 3 10.55 3 10C3 5.03 7.03 1 12 1C16.97 1 21 5.03 21 10C21 10.55 20.9 11.1 20.74 11.6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Path d="M12 17V21" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Path d="M5 14H19L17.5 19H6.5L5 14Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      </Svg>
    ),
  },
  {
    label: "Infaq/Donasi",
    route: "infaq",
    icon: (color: string) => (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      </Svg>
    ),
  },
  {
    label: "Penggalangan Dana",
    route: "fundraising",
    icon: (color: string) => (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={1.8} />
        <Path d="M12 6V12L16 14" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  },
] as const;

export default function OrgDetailScreen() {
  const insets = useSafeAreaInsets();
  const { orgId, orgName } = useLocalSearchParams<{
    orgId: string;
    orgName: string;
  }>();

  function navigateTo(route: string) {
    router.push({
      pathname: `/(provider)/(tabs)/warga/${route}`,
      params: { orgId, orgName },
    });
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
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Text style={{ ...TYPO.h3, color: "#FFFFFF" }}>{orgName}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.md, paddingBottom: SPACING.xxl }}
      >
        <Text
          style={{
            ...TYPO.small,
            color: "#94A3B8",
            textTransform: "uppercase",
            letterSpacing: 0.8,
            marginBottom: SPACING.sm,
          }}
        >
          KELOLA ORGANISASI
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -(SPACING.xs) }}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.route}
              onPress={() => navigateTo(item.route)}
              activeOpacity={0.7}
              style={{
                width: "50%",
                paddingHorizontal: SPACING.xs,
                marginBottom: SPACING.sm,
              }}
            >
              <Card variant="glass">
                <View style={{ alignItems: "center", paddingVertical: SPACING.sm }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: RADIUS.full,
                      backgroundColor: "rgba(251,143,103,0.12)",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: SPACING.sm,
                    }}
                  >
                    {item.icon(COLORS.warga)}
                  </View>
                  <Text style={{ ...TYPO.captionBold, color: COLORS.darkText, textAlign: "center" }}>
                    {item.label}
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
