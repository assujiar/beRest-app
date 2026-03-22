import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { Card } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Modal } from "@components/ui/Modal";
import { CurrencyInput } from "@components/shared/CurrencyInput";
import { EmptyState } from "@components/shared/EmptyState";
import { ModuleIcon } from "@components/ui/ModuleIcon";
import { getGifts, addGift, getGiftSummary } from "@services/hajat.service";
import { useAuthStore } from "@stores/auth.store";
import { useUIStore } from "@stores/ui.store";
import { formatRupiah, formatDate } from "@utils/format";
import { GRADIENTS, GLASS, RADIUS, TYPO, SPACING } from "@utils/theme";
import type { GiftRecord, GiftDirection } from "@app-types/hajat.types";

const MODULE_COLOR = "#D95877";

type Tab = "invitations" | "amplop" | "calendar";

function ArrowUpIcon({ size = 14, color = "#EF4444" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 19V5M5 12L12 5L19 12" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ArrowDownIcon({ size = 14, color = "#D95877" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5V19M19 12L12 19L5 12" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function ConsumerHajatScreen() {
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((s) => s.profile);
  const showToast = useUIStore((s) => s.showToast);
  const [tab, setTab] = useState<Tab>("invitations");
  const [gifts, setGifts] = useState<GiftRecord[]>([]);
  const [summary, setSummary] = useState({ totalGiven: 0, totalReceived: 0, balance: 0, givenCount: 0, receivedCount: 0 });
  const [showAddGift, setShowAddGift] = useState(false);
  const [giftName, setGiftName] = useState("");
  const [giftAmount, setGiftAmount] = useState(0);
  const [giftDir, setGiftDir] = useState<GiftDirection>("given");
  const [giftEventDesc, setGiftEventDesc] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { if (profile?.id) loadData(); }, [profile?.id, tab]);

  async function loadData() {
    if (!profile?.id) return;
    try {
      const [g, s] = await Promise.all([getGifts(profile.id), getGiftSummary(profile.id)]);
      setGifts(g); setSummary(s);
    } catch {}
  }

  async function handleAddGift() {
    if (!giftName.trim() || giftAmount <= 0 || !profile?.id) return;
    setActionLoading(true);
    try {
      await addGift(profile.id, { event_id: null, contact_id: null, person_name: giftName.trim(), direction: giftDir, amount: giftAmount, event_type: null, event_description: giftEventDesc.trim() || null, event_date: new Date().toISOString().split("T")[0] });
      showToast("Amplop dicatat!", "success"); setGiftName(""); setGiftAmount(0); setGiftEventDesc(""); setShowAddGift(false); loadData();
    } catch { showToast("Gagal", "error"); } finally { setActionLoading(false); }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "invitations", label: "Undangan" }, { key: "amplop", label: "Amplop" }, { key: "calendar", label: "Kalender" },
  ];

  // Reference GLASS to keep import
  const tabBg = GLASS.card.background;
  const tabBorder = GLASS.card.border;

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Gradient Header */}
      <LinearGradient
        colors={GRADIENTS.hajat}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + SPACING.sm, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.md }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
          <ModuleIcon module="hajat" size={22} color="#FFFFFF" />
          <Text style={{ ...TYPO.h2, color: "#FFFFFF" }}>Hajat</Text>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={{
        flexDirection: "row",
        backgroundColor: tabBg,
        borderBottomWidth: 1,
        borderBottomColor: tabBorder,
      }}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setTab(t.key)}
            style={{
              flex: 1,
              paddingVertical: SPACING.md,
              alignItems: "center",
              borderBottomWidth: 2,
              borderBottomColor: tab === t.key ? MODULE_COLOR : "transparent",
            }}
          >
            <Text style={{ ...TYPO.captionBold, color: tab === t.key ? MODULE_COLOR : "#64748B" }}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.md }}>
        {tab === "invitations" && (
          <EmptyState illustration="💌" title="Belum ada undangan masuk" description="Undangan dari penyelenggara acara akan muncul di sini" />
        )}

        {tab === "amplop" && (
          <>
            <Card variant="elevated">
              <View style={{ flexDirection: "row" }}>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8 }}>Diberikan</Text>
                  <Text style={{ ...TYPO.h3, color: "#EF4444", marginTop: SPACING.xs }}>{formatRupiah(summary.totalGiven)}</Text>
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8 }}>Diterima</Text>
                  <Text style={{ ...TYPO.h3, color: MODULE_COLOR, marginTop: SPACING.xs }}>{formatRupiah(summary.totalReceived)}</Text>
                </View>
              </View>
              <View style={{ marginTop: SPACING.md, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: "#E2E8F0", alignItems: "center" }}>
                <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8 }}>Selisih</Text>
                <Text style={{ ...TYPO.money, color: "#1E293B", marginTop: SPACING.xs }}>{formatRupiah(summary.balance)}</Text>
              </View>
            </Card>
            <Button title="+ Catat Amplop" variant="secondary" onPress={() => setShowAddGift(true)} />
            <View style={{ marginTop: SPACING.md }}>
              {gifts.map((g) => (
                <Card key={g.id} variant="glass">
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{
                      width: 36,
                      height: 36,
                      borderRadius: RADIUS.full,
                      backgroundColor: g.direction === "given" ? "rgba(239,68,68,0.1)" : "rgba(217,88,119,0.1)",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: SPACING.md,
                    }}>
                      {g.direction === "given" ? <ArrowUpIcon size={16} color="#EF4444" /> : <ArrowDownIcon size={16} color={MODULE_COLOR} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>{g.person_name}</Text>
                      {g.event_description && <Text style={{ ...TYPO.caption, color: "#64748B" }}>{g.event_description}</Text>}
                      {g.event_date && <Text style={{ ...TYPO.caption, color: "#94A3B8" }}>{formatDate(g.event_date)}</Text>}
                    </View>
                    <Text style={{ ...TYPO.bodyBold, color: g.direction === "given" ? "#EF4444" : MODULE_COLOR }}>
                      {g.direction === "given" ? "-" : "+"}{formatRupiah(g.amount ?? 0)}
                    </Text>
                  </View>
                </Card>
              ))}
              {gifts.length === 0 && <EmptyState illustration="💰" title="Belum ada catatan amplop" />}
            </View>
          </>
        )}

        {tab === "calendar" && (
          <EmptyState illustration="📅" title="Kalender Hajatan" description="Acara yang kamu diundang akan muncul di kalender" />
        )}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      <Modal visible={showAddGift} onClose={() => setShowAddGift(false)} title="Catat Amplop">
        <View style={{ flexDirection: "row", marginBottom: SPACING.md, gap: SPACING.sm }}>
          {(["given", "received"] as GiftDirection[]).map((d) => (
            <TouchableOpacity
              key={d}
              onPress={() => setGiftDir(d)}
              style={{
                flex: 1,
                paddingVertical: SPACING.sm,
                borderRadius: RADIUS.md,
                alignItems: "center",
                backgroundColor: giftDir === d ? MODULE_COLOR : "#F1F5F9",
              }}
            >
              <Text style={{ ...TYPO.captionBold, color: giftDir === d ? "#FFFFFF" : "#64748B" }}>{d === "given" ? "Kasih" : "Terima"}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Input label={giftDir === "given" ? "Untuk siapa" : "Dari siapa"} placeholder="contoh: Pak Andi" value={giftName} onChangeText={setGiftName} />
        <View style={{ marginTop: SPACING.md }}>
          <CurrencyInput label="Jumlah" value={giftAmount} onChangeValue={setGiftAmount} />
        </View>
        <View style={{ marginTop: SPACING.md }}>
          <Input label="Acara (opsional)" placeholder="contoh: Nikahan Budi" value={giftEventDesc} onChangeText={setGiftEventDesc} />
        </View>
        <View style={{ marginTop: SPACING.lg }}>
          <Button title="Simpan" onPress={handleAddGift} loading={actionLoading} />
        </View>
      </Modal>
    </View>
  );
}
