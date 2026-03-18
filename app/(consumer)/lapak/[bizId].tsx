import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { getBusiness, getProducts } from "@services/lapak.service";
import { supabase } from "@services/supabase";
import { useAuthStore } from "@stores/auth.store";
import { formatRupiah } from "@utils/format";
import type { Business, Product, Order, OrderStatus } from "@app-types/lapak.types";

const STATUS_MAP: Record<OrderStatus, { label: string; variant: "success" | "info" | "warning" | "neutral" | "error" }> = {
  new: { label: "Baru", variant: "info" },
  confirmed: { label: "Dikonfirmasi", variant: "info" },
  in_progress: { label: "Diproses", variant: "warning" },
  ready: { label: "Siap", variant: "success" },
  completed: { label: "Selesai", variant: "neutral" },
  cancelled: { label: "Dibatalkan", variant: "error" },
};

export default function ConsumerLapakScreen() {
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
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-border-color bg-white">
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text className="text-lg text-navy">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-dark-text ml-3">
          {biz?.name ?? "Usaha"}
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-3">
        {/* Catalog */}
        <Text className="text-sm font-bold text-grey-text mb-2">KATALOG</Text>
        {Array.from(categories.entries()).map(([cat, prods]) => (
          <View key={cat} className="mb-4">
            <Text className="text-xs font-bold text-lapak mb-1">{cat}</Text>
            {prods.map((p) => (
              <Card key={p.id}>
                <View className="flex-row items-center">
                  <View className="flex-1">
                    <Text className="text-base font-bold text-dark-text">{p.name}</Text>
                    {p.description && (
                      <Text className="text-xs text-grey-text">{p.description}</Text>
                    )}
                  </View>
                  <Text className="text-base font-bold text-lapak">
                    {formatRupiah(p.price)}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        ))}

        {products.length === 0 && (
          <Card>
            <Text className="text-sm text-grey-text text-center">Belum ada produk</Text>
          </Card>
        )}

        {/* Order history */}
        {orders.length > 0 && (
          <>
            <Text className="text-sm font-bold text-grey-text mt-4 mb-2">
              RIWAYAT PESANAN
            </Text>
            {orders.map((o) => {
              const s = STATUS_MAP[o.status];
              return (
                <Card key={o.id}>
                  <View className="flex-row items-center">
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-dark-text">
                        #{o.order_code}
                      </Text>
                      <Text className="text-xs text-grey-text">
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
      </ScrollView>
    </SafeAreaView>
  );
}
