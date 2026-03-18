import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { EmptyState } from "@components/shared/EmptyState";
import { getVacantUnits } from "@services/sewa.service";
import { shareViaWhatsApp } from "@services/wa-share.service";
import { formatRupiah } from "@utils/format";
import type { PropertyUnit } from "@app-types/sewa.types";

export default function VacantScreen() {
  const { propId, propName } = useLocalSearchParams<{ propId: string; propName: string }>();
  const [units, setUnits] = useState<PropertyUnit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (propId) loadData(); }, [propId]);

  async function loadData() {
    try { setUnits(await getVacantUnits(propId!)); } catch { /* silent */ } finally { setLoading(false); }
  }

  function handleShare(unit: PropertyUnit) {
    const msg = `🏠 *${propName} - ${unit.unit_name}*\n\nHarga sewa: ${formatRupiah(unit.monthly_rent)}/bulan\n\nHubungi untuk info lebih lanjut.\n\nDibuat dengan beRest`;
    shareViaWhatsApp(msg);
  }

  function handleShareAll() {
    const unitList = units.map((u) => `• ${u.unit_name}: ${formatRupiah(u.monthly_rent)}/bln`).join("\n");
    const msg = `🏠 *${propName}*\n\nUnit tersedia:\n${unitList}\n\nHubungi untuk info lebih lanjut.\n\nDibuat dengan beRest`;
    shareViaWhatsApp(msg);
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-border-color bg-white">
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}><Text className="text-lg text-navy">←</Text></TouchableOpacity>
        <Text className="text-lg font-bold text-dark-text ml-3">Unit Kosong</Text>
      </View>
      <ScrollView className="flex-1 px-4 pt-3">
        {!loading && units.length === 0 ? (
          <EmptyState illustration="🎉" title="Semua unit terisi!" description="Tidak ada unit kosong saat ini" />
        ) : (
          <>
            {units.length > 1 && <Button title="📤 Bagikan Semua via WA" variant="whatsapp" onPress={handleShareAll} />}
            <View className="mt-3">
              {units.map((u) => (
                <Card key={u.id}>
                  <View className="flex-row items-center">
                    <View className="flex-1">
                      <Text className="text-base font-bold text-dark-text">{u.unit_name}</Text>
                      <Text className="text-sm font-bold text-sewa">{formatRupiah(u.monthly_rent)}/bln</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleShare(u)} className="bg-[#25D366] rounded-lg px-3 py-2">
                      <Text className="text-white text-xs font-bold">📤 WA</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
