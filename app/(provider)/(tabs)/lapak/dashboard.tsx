import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Card } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import {
  getDailySummary,
  getSalesToday,
  getProducts,
  recordQuickSale,
} from "@services/lapak.service";
import { useUIStore } from "@stores/ui.store";
import { formatRupiah } from "@utils/format";
import { GRADIENTS, GLASS, RADIUS, TYPO, SPACING } from "@utils/theme";
import Svg, { Path } from "react-native-svg";
import type { Product, SalesEntry, DailySummary } from "@app-types/lapak.types";

function ArrowLeftIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BoxIcon({ size = 18, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function WalletIcon({ size = 18, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12V7H5a2 2 0 010-4h14v4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M3 5v14a2 2 0 002 2h16v-5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18 12a2 2 0 100 4h4v-4h-4z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function LapakDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { bizId, bizName } = useLocalSearchParams<{ bizId: string; bizName: string }>();
  const showToast = useUIStore((s) => s.showToast);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [salesToday, setSalesToday] = useState<SalesEntry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (bizId) loadData();
    }, [bizId])
  );

  async function loadData() {
    try {
      const [sum, sales, prods] = await Promise.all([
        getDailySummary(bizId!),
        getSalesToday(bizId!),
        getProducts(bizId!),
      ]);
      setSummary(sum);
      setSalesToday(sales);
      setProducts(prods);
    } catch {
      // silent
    }
  }

  async function handleQuickSale(product: Product) {
    try {
      await recordQuickSale(bizId!, product.id, product.name, product.price);
      showToast(`+1 ${product.name}`, "success");
      loadData();
    } catch {
      showToast("Gagal mencatat penjualan", "error");
    }
  }

  function navigateTo(route: string) {
    router.push({
      pathname: `/(provider)/(tabs)/lapak/${route}`,
      params: { bizId, bizName },
    });
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
            <ArrowLeftIcon size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ ...TYPO.h3, color: "#FFFFFF", marginLeft: SPACING.md }}>
            {bizName}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.md, paddingTop: SPACING.md }}
      >
        {/* Today's summary */}
        <Card variant="glass">
          <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8 }}>
            Hari ini
          </Text>
          <View style={{ flexDirection: "row", marginTop: SPACING.sm }}>
            <View style={{ flex: 1 }}>
              <Text style={{ ...TYPO.caption, color: "#64748B" }}>Omzet</Text>
              <Text style={{ ...TYPO.money, color: "#50BFC3" }}>
                {formatRupiah(summary?.totalSales ?? 0)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ ...TYPO.caption, color: "#64748B" }}>Profit</Text>
              <Text style={{ ...TYPO.money, color: "#1E293B" }}>
                {formatRupiah(summary?.profit ?? 0)}
              </Text>
            </View>
          </View>
          <Text style={{ ...TYPO.caption, color: "#64748B", marginTop: SPACING.sm }}>
            {summary?.transactionCount ?? 0} transaksi
          </Text>
        </Card>

        {/* Quick actions */}
        <View style={{ flexDirection: "row", marginBottom: SPACING.md }}>
          <View style={{ flex: 1, marginRight: SPACING.xs }}>
            <TouchableOpacity
              onPress={() => navigateTo("products")}
              activeOpacity={0.7}
              style={{
                backgroundColor: GLASS.card.background,
                borderWidth: 1,
                borderColor: GLASS.card.border,
                borderRadius: RADIUS.lg,
                paddingVertical: SPACING.md,
                paddingHorizontal: SPACING.md,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: SPACING.sm,
                ...GLASS.shadow.sm,
              }}
            >
              <BoxIcon size={18} color="#50BFC3" />
              <Text style={{ ...TYPO.captionBold, color: "#1E293B" }}>Produk</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, marginLeft: SPACING.xs }}>
            <TouchableOpacity
              onPress={() => navigateTo("expenses")}
              activeOpacity={0.7}
              style={{
                backgroundColor: GLASS.card.background,
                borderWidth: 1,
                borderColor: GLASS.card.border,
                borderRadius: RADIUS.lg,
                paddingVertical: SPACING.md,
                paddingHorizontal: SPACING.md,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: SPACING.sm,
                ...GLASS.shadow.sm,
              }}
            >
              <WalletIcon size={18} color="#50BFC3" />
              <Text style={{ ...TYPO.captionBold, color: "#1E293B" }}>Pengeluaran</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 1-Tap Sales */}
        <Text
          style={{
            ...TYPO.small,
            color: "#94A3B8",
            textTransform: "uppercase",
            letterSpacing: 0.8,
            marginBottom: SPACING.sm,
          }}
        >
          CATAT PENJUALAN (1 TAP)
        </Text>
        {products.length > 0 ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {products.map((p, idx) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => handleQuickSale(p)}
                style={{
                  width: "48%",
                  marginRight: idx % 2 === 0 ? "4%" : 0,
                  marginBottom: SPACING.sm,
                }}
                activeOpacity={0.6}
              >
                <Card variant="glass">
                  <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <Text style={{ ...TYPO.money, color: "#50BFC3", marginTop: SPACING.xs }}>
                    {formatRupiah(p.price)}
                  </Text>
                  <Text style={{ ...TYPO.caption, color: "#64748B", marginTop: SPACING.xs }}>
                    Tap = +1
                  </Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Card variant="glass">
            <Text style={{ ...TYPO.body, color: "#64748B", textAlign: "center" }}>
              Tambah produk dulu untuk 1-tap sales
            </Text>
            <View style={{ marginTop: SPACING.sm }}>
              <Button title="+ Tambah Produk" variant="secondary" onPress={() => navigateTo("products")} />
            </View>
          </Card>
        )}

        {/* Today's sales log */}
        {salesToday.length > 0 && (
          <>
            <Text
              style={{
                ...TYPO.small,
                color: "#94A3B8",
                textTransform: "uppercase",
                letterSpacing: 0.8,
                marginTop: SPACING.lg,
                marginBottom: SPACING.sm,
              }}
            >
              PENJUALAN HARI INI
            </Text>
            {salesToday.map((s) => (
              <Card key={s.id} variant="glass">
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>
                      {s.product_name}
                    </Text>
                    <Text style={{ ...TYPO.caption, color: "#64748B" }}>
                      {s.quantity}x {formatRupiah(s.price)}
                    </Text>
                  </View>
                  <Text style={{ ...TYPO.money, color: "#50BFC3" }}>
                    +{formatRupiah(s.total)}
                  </Text>
                </View>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
