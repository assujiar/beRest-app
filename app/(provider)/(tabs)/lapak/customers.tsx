import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Modal } from "@components/ui/Modal";
import { SearchBar } from "@components/shared/SearchBar";
import { EmptyState } from "@components/shared/EmptyState";
import { getCustomers, searchCustomers, upsertCustomer } from "@services/lapak-advanced.service";
import { useUIStore } from "@stores/ui.store";
import { formatRupiah } from "@utils/format";
import type { CustomerRecord } from "@app-types/lapak.types";

export default function CustomersScreen() {
  const { bizId } = useLocalSearchParams<{ bizId: string }>();
  const showToast = useUIStore((s) => s.showToast);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { if (bizId) loadData(); }, [bizId]);

  async function loadData() {
    try { setCustomers(await getCustomers(bizId!)); } catch {} finally { setLoading(false); }
  }

  async function handleSearch(q: string) {
    setSearch(q);
    if (q.length >= 2) {
      try { setCustomers(await searchCustomers(bizId!, q)); } catch {}
    } else { loadData(); }
  }

  async function handleAdd() {
    if (!newName.trim()) return;
    setActionLoading(true);
    try {
      await upsertCustomer(bizId!, { name: newName.trim(), phone: newPhone.trim() || null, tags: [], notes: null });
      showToast("Pelanggan ditambahkan!", "success"); setNewName(""); setNewPhone(""); setShowAdd(false); loadData();
    } catch { showToast("Gagal", "error"); } finally { setActionLoading(false); }
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border-color bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}><Text className="text-lg text-navy">←</Text></TouchableOpacity>
          <Text className="text-lg font-bold text-dark-text ml-3">Pelanggan</Text>
        </View>
        <TouchableOpacity onPress={() => setShowAdd(true)} className="bg-lapak rounded-lg px-3 py-2">
          <Text className="text-white text-xs font-bold">+ Tambah</Text>
        </TouchableOpacity>
      </View>
      <View className="px-4 pt-3"><SearchBar value={search} onChangeText={handleSearch} placeholder="Cari pelanggan..." /></View>
      <ScrollView className="flex-1 px-4 pt-3">
        {!loading && customers.length === 0 ? (
          <EmptyState illustration="👤" title="Belum ada pelanggan" actionLabel="+ Tambah Pelanggan" onAction={() => setShowAdd(true)} />
        ) : (
          customers.map((c) => (
            <Card key={c.id}>
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-lapak/10 items-center justify-center mr-3">
                  <Text className="text-base font-bold text-lapak">{c.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-dark-text">{c.name}</Text>
                  {c.phone && <Text className="text-xs text-grey-text">{c.phone}</Text>}
                  <Text className="text-xs text-grey-text">{c.total_orders} order • {formatRupiah(c.total_spent)}</Text>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
      <Modal visible={showAdd} onClose={() => setShowAdd(false)} title="Tambah Pelanggan">
        <Input label="Nama" placeholder="contoh: Pak Andi" value={newName} onChangeText={setNewName} />
        <View className="mt-3"><Input label="No HP (opsional)" placeholder="08123456789" value={newPhone} onChangeText={setNewPhone} keyboardType="phone-pad" /></View>
        <View className="mt-4"><Button title="Tambah" onPress={handleAdd} loading={actionLoading} /></View>
      </Modal>
    </SafeAreaView>
  );
}
