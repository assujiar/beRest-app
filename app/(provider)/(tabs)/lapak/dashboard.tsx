import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
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
import type { Product, SalesEntry, DailySummary } from "@app-types/lapak.types";

export default function LapakDashboardScreen() {
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
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-border-color bg-white">
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text className="text-lg text-navy">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-dark-text ml-3">{bizName}</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-3">
        {/* Today's summary */}
        <Card>
          <Text className="text-xs text-grey-text">Hari ini</Text>
          <View className="flex-row mt-2">
            <View className="flex-1">
              <Text className="text-xs text-grey-text">Omzet</Text>
              <Text className="text-xl font-bold text-lapak">
                {formatRupiah(summary?.totalSales ?? 0)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-grey-text">Profit</Text>
              <Text className="text-xl font-bold text-dark-text">
                {formatRupiah(summary?.profit ?? 0)}
              </Text>
            </View>
          </View>
          <Text className="text-xs text-grey-text mt-2">
            {summary?.transactionCount ?? 0} transaksi
          </Text>
        </Card>

        {/* Quick actions */}
        <View className="flex-row mb-3">
          <View className="flex-1 mr-1">
            <Button title="📦 Produk" variant="secondary" onPress={() => navigateTo("products")} />
          </View>
          <View className="flex-1 mx-1">
            <Button title="💸 Pengeluaran" variant="secondary" onPress={() => navigateTo("expenses")} />
          </View>
        </View>

        {/* 1-Tap Sales */}
        <Text className="text-sm font-bold text-grey-text mb-2">
          CATAT PENJUALAN (1 TAP)
        </Text>
        {products.length > 0 ? (
          <View className="flex-row flex-wrap">
            {products.map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => handleQuickSale(p)}
                className="w-[48%] mr-[4%] mb-2"
                style={{ marginRight: products.indexOf(p) % 2 === 1 ? 0 : "4%" }}
                activeOpacity={0.6}
              >
                <Card>
                  <Text className="text-sm font-bold text-dark-text" numberOfLines={1}>
                    {p.name}
                  </Text>
                  <Text className="text-base font-bold text-lapak mt-1">
                    {formatRupiah(p.price)}
                  </Text>
                  <Text className="text-xs text-grey-text mt-1">Tap = +1</Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Card>
            <Text className="text-sm text-grey-text text-center">
              Tambah produk dulu untuk 1-tap sales
            </Text>
            <View className="mt-2">
              <Button title="+ Tambah Produk" variant="secondary" onPress={() => navigateTo("products")} />
            </View>
          </Card>
        )}

        {/* Today's sales log */}
        {salesToday.length > 0 && (
          <>
            <Text className="text-sm font-bold text-grey-text mt-4 mb-2">
              PENJUALAN HARI INI
            </Text>
            {salesToday.map((s) => (
              <Card key={s.id}>
                <View className="flex-row items-center">
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-dark-text">
                      {s.product_name}
                    </Text>
                    <Text className="text-xs text-grey-text">
                      {s.quantity}x {formatRupiah(s.price)}
                    </Text>
                  </View>
                  <Text className="text-base font-bold text-lapak">
                    +{formatRupiah(s.total)}
                  </Text>
                </View>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
