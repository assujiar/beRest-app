import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Card } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Modal } from "@components/ui/Modal";
import { CurrencyInput } from "@components/shared/CurrencyInput";
import { EmptyState } from "@components/shared/EmptyState";
import { UpgradeModal } from "@components/shared/UpgradeModal";
import { getProducts, createProduct, deleteProduct } from "@services/lapak.service";
import { useSubscription } from "@hooks/shared/useSubscription";
import { useUIStore } from "@stores/ui.store";
import { formatRupiah } from "@utils/format";
import { GRADIENTS, RADIUS, TYPO, SPACING } from "@utils/theme";
import Svg, { Path } from "react-native-svg";
import type { Product } from "@app-types/lapak.types";

function ArrowLeftIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function ProductsScreen() {
  const insets = useSafeAreaInsets();
  const { bizId } = useLocalSearchParams<{ bizId: string }>();
  const showToast = useUIStore((s) => s.showToast);
  const { tier, requireUpgrade, showUpgrade, setShowUpgrade, upgradeFeature } = useSubscription();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState(0);
  const [newCategory, setNewCategory] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (bizId) loadData();
    }, [bizId])
  );

  async function loadData() {
    try {
      const data = await getProducts(bizId!, false);
      setProducts(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  function handleOpenAdd() {
    if (requireUpgrade("maxProducts", "Tambah Produk", products.length)) return;
    setShowAdd(true);
  }

  async function handleAdd() {
    if (!newName.trim() || newPrice <= 0) return;
    setAddLoading(true);
    try {
      await createProduct(bizId!, {
        name: newName.trim(),
        price: newPrice,
        category: newCategory.trim() || null,
        description: null,
        photo_url: null,
      });
      showToast("Produk ditambahkan!", "success");
      setNewName(""); setNewPrice(0); setNewCategory("");
      setShowAdd(false);
      loadData();
    } catch {
      showToast("Gagal menambah produk", "error");
    } finally {
      setAddLoading(false);
    }
  }

  function handleDelete(p: Product) {
    Alert.alert("Hapus Produk?", `${p.name} akan dihapus.`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProduct(p.id);
            showToast("Produk dihapus", "success");
            loadData();
          } catch { showToast("Gagal menghapus", "error"); }
        },
      },
    ]);
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
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
              <ArrowLeftIcon size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={{ ...TYPO.h3, color: "#FFFFFF", marginLeft: SPACING.md }}>Produk</Text>
          </View>
          <TouchableOpacity
            onPress={handleOpenAdd}
            style={{
              backgroundColor: "rgba(255,255,255,0.25)",
              borderRadius: RADIUS.md,
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.35)",
            }}
          >
            <Text style={{ ...TYPO.captionBold, color: "#FFFFFF" }}>+ Tambah</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.md, paddingTop: SPACING.md }}
      >
        {!loading && products.length === 0 ? (
          <EmptyState
            illustration="📦"
            title="Belum ada produk"
            description="Tambah produk untuk mulai catat penjualan"
            actionLabel="+ Tambah Produk"
            onAction={handleOpenAdd}
          />
        ) : (
          products.map((p) => (
            <TouchableOpacity key={p.id} onLongPress={() => handleDelete(p)} activeOpacity={0.8}>
              <Card variant="glass">
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>{p.name}</Text>
                    {p.category && (
                      <Text style={{ ...TYPO.caption, color: "#64748B" }}>{p.category}</Text>
                    )}
                  </View>
                  <Text style={{ ...TYPO.money, color: "#50BFC3" }}>{formatRupiah(p.price)}</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal visible={showAdd} onClose={() => setShowAdd(false)} title="Tambah Produk">
        <Input label="Nama Produk" placeholder="contoh: Nasi Goreng" value={newName} onChangeText={setNewName} />
        <View style={{ marginTop: SPACING.md }}>
          <CurrencyInput label="Harga" value={newPrice} onChangeValue={setNewPrice} />
        </View>
        <View style={{ marginTop: SPACING.md }}>
          <Input label="Kategori (opsional)" placeholder="contoh: Makanan" value={newCategory} onChangeText={setNewCategory} />
        </View>
        <View style={{ marginTop: SPACING.lg }}>
          <Button title="Tambah" onPress={handleAdd} loading={addLoading} />
        </View>
      </Modal>

      <UpgradeModal visible={showUpgrade} onClose={() => setShowUpgrade(false)} currentTier={tier} featureName={upgradeFeature} />
    </View>
  );
}
