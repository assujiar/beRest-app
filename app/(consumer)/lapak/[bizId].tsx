import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { getBusiness, getProducts } from "@services/lapak.service";
import { supabase } from "@services/supabase";
import { useAuthStore } from "@stores/auth.store";
import { formatRupiah } from "@utils/format";
import { GRADIENTS, RADIUS, TYPO, SPACING } from "@utils/theme";
import type { Business, Product, Order, OrderStatus } from "@app-types/lapak.types";

const MODULE_COLOR = "#50BFC3";

const STATUS_MAP: Record<OrderStatus, { label: string; variant: "success" | "info" | "warning" | "neutral" | "error" }> = {
  new: { label: "Baru", variant: "info" },
  confirmed: { label: "Dikonfirmasi", variant: "info" },
  in_progress: { label: "Diproses", variant: "warning" },
  ready: { label: "Siap", variant: "success" },
  completed: { label: "Selesai", variant: "neutral" },
  cancelled: { label: "Dibatalkan", variant: "error" },
};

function BackIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 19L8 12L15 5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function TagIcon({ size = 14, color = "#50BFC3" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20.59 13.41L13.42 20.58C13.2343 20.766 13.0137 20.9135 12.7709 21.0141C12.5281 21.1148 12.2678 21.1666 12.005 21.1666C11.7422 21.1666 11.4819 21.1148 11.2391 21.0141C10.9963 20.9135 10.7757 20.766 10.59 20.58L2 12V2H12L20.59 10.59C20.9625 10.9647 21.1716 11.4716 21.1716 12C21.1716 12.5284 20.9625 13.0353 20.59 13.41Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 7H7.01" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PackageIcon({ size = 14, color = "#64748B" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M16.5 9.4L7.55 4.24M21 16V8C20.9996 7.6493 20.9071 7.30483 20.7315 7.00017C20.556 6.69552 20.3037 6.44157 20 6.264L13 2.264C12.696 2.08624 12.3511 1.99316 12 1.99316C11.6489 1.99316 11.304 2.08624 11 2.264L4 6.264C3.69626 6.44157 3.44398 6.69552 3.26846 7.00017C3.09294 7.30483 3.00036 7.6493 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9998C3.44398 17.3045 3.69626 17.5584 4 17.736L11 21.736C11.304 21.9138 11.6489 22.0068 12 22.0068C12.3511 22.0068 12.696 21.9138 13 21.736L20 17.736C20.3037 17.5584 20.556 17.3045 20.7315 16.9998C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M3.27 6.96L12 12.01L20.73 6.96M12 22.08V12" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function ConsumerLapakScreen() {
  const insets = useSafeAreaInsets();
  const { bizId } = useLocalSearchParams<{ bizId: string }>();
  const profile = useAuthStore((s) => s.profile);
  const [biz, setBiz] = useState<Business | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (bizId) loadData();
  }, [bizId]);

  async function loadData() {
    try {
      const [bizData, prodsData] = await Promise.all([
        getBusiness(bizId!),
        getProducts(bizId!),
      ]);
      setBiz(bizData);
      setProducts(prodsData);

      if (profile?.id) {
        const { data: orderData } = await supabase
          .from("orders")
          .select("*")
          .eq("business_id", bizId!)
          .eq("consumer_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(10);
        setOrders((orderData ?? []) as Order[]);
      }
    } catch {
      // silent
    }
  }

  // Group products by category
  const categories = new Map<string, Product[]>();
  for (const p of products) {
    const cat = p.category ?? "Lainnya";
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(p);
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Gradient Header */}
      <LinearGradient
        colors={GRADIENTS.lapak}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + SPACING.sm, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.md }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.md }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <BackIcon size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ ...TYPO.h3, color: "#FFFFFF" }}>{biz?.name ?? "Usaha"}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={{ flex: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.md }}>
        {/* Catalog */}
        <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: SPACING.sm }}>KATALOG</Text>
        {Array.from(categories.entries()).map(([cat, prods]) => (
          <View key={cat} style={{ marginBottom: SPACING.lg }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.xs, marginBottom: SPACING.sm }}>
              <TagIcon size={12} color={MODULE_COLOR} />
              <Text style={{ ...TYPO.captionBold, color: MODULE_COLOR }}>{cat}</Text>
            </View>
            {prods.map((p) => (
              <Card key={p.id} variant="glass">
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>{p.name}</Text>
                    {p.description && (
                      <Text style={{ ...TYPO.caption, color: "#64748B", marginTop: 2 }}>{p.description}</Text>
                    )}
                  </View>
                  <Text style={{ ...TYPO.bodyBold, color: MODULE_COLOR }}>
                    {formatRupiah(p.price)}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        ))}

        {products.length === 0 && (
          <Card variant="glass">
            <Text style={{ ...TYPO.body, color: "#64748B", textAlign: "center" }}>Belum ada produk</Text>
          </Card>
        )}

        {/* Order history */}
        {orders.length > 0 && (
          <>
            <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, marginTop: SPACING.lg, marginBottom: SPACING.sm }}>
              RIWAYAT PESANAN
            </Text>
            {orders.map((o) => {
              const s = STATUS_MAP[o.status];
              return (
                <Card key={o.id} variant="glass">
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{
                      width: 36,
                      height: 36,
                      borderRadius: RADIUS.md,
                      backgroundColor: "rgba(80,191,195,0.1)",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: SPACING.md,
                    }}>
                      <PackageIcon size={18} color="#64748B" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ ...TYPO.captionBold, color: "#1E293B" }}>
                        #{o.order_code}
                      </Text>
                      <Text style={{ ...TYPO.caption, color: "#64748B" }}>
                        {o.items.length} item • {formatRupiah(o.total)}
                      </Text>
                    </View>
                    <Badge label={s.label} variant={s.variant} />
                  </View>
                </Card>
              );
            })}
          </>
        )}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </View>
  );
}
