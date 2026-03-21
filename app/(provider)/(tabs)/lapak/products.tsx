import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
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
import type { Product } from "@app-types/lapak.types";

export default function ProductsScreen() {
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

  useEffect(() => {
    if (bizId) loadData();
  }, [bizId]);

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
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border-color bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Text className="text-lg text-navy">←</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-dark-text ml-3">Produk</Text>
        </View>
        <TouchableOpacity onPress={handleOpenAdd} className="bg-lapak rounded-lg px-3 py-2">
          <Text className="text-white text-xs font-bold">+ Tambah</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-3">
        {!loading && products.length === 0 ? (
          <EmptyState illustration="📦" title="Belum ada produk" description="Tambah produk untuk mulai catat penjualan" actionLabel="+ Tambah Produk" onAction={handleOpenAdd} />
        ) : (
          products.map((p) => (
            <TouchableOpacity key={p.id} onLongPress={() => handleDelete(p)} activeOpacity={0.8}>
              <Card>
                <View className="flex-row items-center">
                  <View className="flex-1">
                    <Text className="text-base font-bold text-dark-text">{p.name}</Text>
                    {p.category && <Text className="text-xs text-grey-text">{p.category}</Text>}
                  </View>
                  <Text className="text-base font-bold text-lapak">{formatRupiah(p.price)}</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal visible={showAdd} onClose={() => setShowAdd(false)} title="Tambah Produk">
        <Input label="Nama Produk" placeholder="contoh: Nasi Goreng" value={newName} onChangeText={setNewName} />
        <View className="mt-3">
          <CurrencyInput label="Harga" value={newPrice} onChangeValue={setNewPrice} />
        </View>
        <View className="mt-3">
          <Input label="Kategori (opsional)" placeholder="contoh: Makanan" value={newCategory} onChangeText={setNewCategory} />
        </View>
        <View className="mt-4">
          <Button title="Tambah" onPress={handleAdd} loading={addLoading} />
        </View>
      </Modal>

      <UpgradeModal visible={showUpgrade} onClose={() => setShowUpgrade(false)} currentTier={tier} featureName={upgradeFeature} />
    </SafeAreaView>
  );
}
