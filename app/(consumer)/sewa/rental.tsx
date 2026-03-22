import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { getRentalByCode } from "@services/rental.service";
import { formatRupiah, formatDate } from "@utils/format";
import { GRADIENTS, TYPO, SPACING } from "@utils/theme";
import type { RentalTransaction, RentalStatus } from "@app-types/sewa.types";

const MODULE_COLOR = "#00C49A";

const STATUS_MAP: Record<RentalStatus, { label: string; variant: "success" | "error" | "warning" }> = {
  active: { label: "Dipinjam", variant: "warning" },
  returned: { label: "Dikembalikan", variant: "success" },
  overdue: { label: "Terlambat", variant: "error" },
};

function BackIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 19L8 12L15 5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SearchIcon({ size = 48, color = "#94A3B8" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19ZM21 21L16.65 16.65" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function ConsumerRentalScreen() {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState("");
  const [rental, setRental] = useState<(RentalTransaction & { rental_items?: { name: string } }) | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!code.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await getRentalByCode(code.trim());
      setRental(data);
    } catch {
      setRental(null);
    } finally {
      setLoading(false);
    }
  }, [code]);

  const days = rental
    ? Math.max(
        1,
        Math.ceil(
          (new Date(rental.actual_return ?? Date.now()).getTime() -
            new Date(rental.start_date).getTime()) /
            86400000
        )
      )
    : 0;

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Gradient Header */}
      <LinearGradient
        colors={GRADIENTS.sewa}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + SPACING.sm, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.md }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.md }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <BackIcon size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ ...TYPO.h3, color: "#FFFFFF" }}>Status Rental</Text>
        </View>
      </LinearGradient>

      <ScrollView style={{ flex: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.md }}>
        {/* Search by code */}
        <Card variant="elevated">
          <Text style={{ ...TYPO.caption, color: "#64748B", marginBottom: SPACING.sm }}>
            Masukkan kode rental untuk cek status
          </Text>
          <Input
            placeholder="contoh: RNT-15ABCD"
            value={code}
            onChangeText={(t: string) => setCode(t.toUpperCase())}
            autoCapitalize="characters"
          />
          <View style={{ marginTop: SPACING.md }}>
            <Button
              title="Cek Status"
              onPress={handleSearch}
              loading={loading}
              disabled={!code.trim()}
            />
          </View>
        </Card>

        {/* Result */}
        {searched && !rental && !loading && (
          <View style={{ alignItems: "center", paddingVertical: SPACING.xxl }}>
            <SearchIcon size={48} color="#94A3B8" />
            <Text style={{ ...TYPO.bodyBold, color: "#64748B", marginTop: SPACING.md }}>
              Kode tidak ditemukan
            </Text>
            <Text style={{ ...TYPO.caption, color: "#64748B", marginTop: SPACING.xs }}>
              Pastikan kode rental yang dimasukkan benar
            </Text>
          </View>
        )}

        {rental && (
          <>
            <Card variant="glass">
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACING.md }}>
                <Text style={{ ...TYPO.caption, color: "#64748B", fontFamily: "monospace" }}>
                  {rental.rental_code}
                </Text>
                <Badge
                  label={STATUS_MAP[rental.status].label}
                  variant={STATUS_MAP[rental.status].variant}
                />
              </View>

              <Text style={{ ...TYPO.h3, color: "#1E293B" }}>
                {rental.rental_items?.name ?? "Barang rental"}
              </Text>
              <Text style={{ ...TYPO.caption, color: "#64748B", marginTop: SPACING.xs }}>
                Peminjam: {rental.borrower_name}
              </Text>

              <View style={{
                flexDirection: "row",
                marginTop: SPACING.md,
                paddingTop: SPACING.md,
                borderTopWidth: 1,
                borderTopColor: "#E2E8F0",
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8 }}>Mulai</Text>
                  <Text style={{ ...TYPO.bodyBold, color: "#1E293B", marginTop: 2 }}>
                    {formatDate(rental.start_date)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8 }}>
                    {rental.status === "returned" ? "Dikembalikan" : "Diharapkan"}
                  </Text>
                  <Text style={{ ...TYPO.bodyBold, color: "#1E293B", marginTop: 2 }}>
                    {rental.actual_return
                      ? formatDate(rental.actual_return)
                      : rental.expected_return
                        ? formatDate(rental.expected_return)
                        : "-"}
                  </Text>
                </View>
              </View>
            </Card>

            <Card variant="glass">
              <View style={{ flexDirection: "row" }}>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8 }}>Jumlah</Text>
                  <Text style={{ ...TYPO.h3, color: "#1E293B", marginTop: SPACING.xs }}>
                    {rental.quantity}x
                  </Text>
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8 }}>Durasi</Text>
                  <Text style={{ ...TYPO.h3, color: "#1E293B", marginTop: SPACING.xs }}>
                    {days} hari
                  </Text>
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8 }}>Biaya</Text>
                  <Text style={{ ...TYPO.h3, color: MODULE_COLOR, marginTop: SPACING.xs }}>
                    {rental.total_cost
                      ? formatRupiah(rental.total_cost)
                      : formatRupiah(days * rental.daily_rate * rental.quantity)}
                  </Text>
                </View>
              </View>
            </Card>

            {rental.deposit_collected > 0 && (
              <Card variant="glass">
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={{ ...TYPO.body, color: "#64748B" }}>Deposit</Text>
                  <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>
                    {formatRupiah(rental.deposit_collected)}
                  </Text>
                </View>
              </Card>
            )}

            {rental.notes && (
              <Card variant="glass">
                <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: SPACING.xs }}>Catatan</Text>
                <Text style={{ ...TYPO.body, color: "#1E293B" }}>{rental.notes}</Text>
              </Card>
            )}
          </>
        )}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </View>
  );
}
