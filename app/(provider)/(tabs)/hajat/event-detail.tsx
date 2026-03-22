import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Modal } from "@components/ui/Modal";
import { EmptyState } from "@components/shared/EmptyState";
import { getGuests, addGuest, getRsvpSummary, markInvitationSent, markCheckedIn, updateEventStatus, getGiftsByEvent, addGift } from "@services/hajat.service";
import { shareToWhatsApp, generateInvitationMessage } from "@services/wa-share.service";
import { generateDeepLink } from "@services/deep-link.service";
import { useAuthStore } from "@stores/auth.store";
import { useUIStore } from "@stores/ui.store";
import { formatRupiah } from "@utils/format";
import { CurrencyInput } from "@components/shared/CurrencyInput";
import { GRADIENTS, GLASS, RADIUS, TYPO, SPACING } from "@utils/theme";
import type { EventGuest, GiftRecord, RsvpStatus } from "@app-types/hajat.types";

const MODULE_COLOR = "#D95877";

const RSVP_MAP: Record<RsvpStatus, { label: string; variant: "success" | "error" | "warning" | "info" }> = {
  pending: { label: "Pending", variant: "warning" }, attending: { label: "Hadir", variant: "success" },
  not_attending: { label: "Tidak Hadir", variant: "error" }, maybe: { label: "Mungkin", variant: "info" },
};

type Tab = "guests" | "rsvp" | "checkin" | "amplop";

function BackIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 19L8 12L15 5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CheckIcon({ size = 12, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SendIcon({ size = 14, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function UsersIcon({ size = 20, color = "#D95877" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17 21V19C17 16.79 15.21 15 13 15H5C2.79 15 1 16.79 1 19V21M9 11C11.21 11 13 9.21 13 7C13 4.79 11.21 3 9 3C6.79 3 5 4.79 5 7C5 9.21 6.79 11 9 11ZM23 21V19C22.99 17.18 21.73 15.59 20 15.13M16 3.13C17.73 3.6 19 5.18 19 7C19 8.82 17.73 10.4 16 10.87" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function GiftIcon({ size = 20, color = "#D95877" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20 12V22H4V12M22 7H2V12H22V7ZM12 22V7M12 7H7.5C6.83696 7 6.20107 6.73661 5.73223 6.26777C5.26339 5.79893 5 5.16304 5 4.5C5 3.83696 5.26339 3.20107 5.73223 2.73223C6.20107 2.26339 6.83696 2 7.5 2C11 2 12 7 12 7ZM12 7H16.5C17.163 7 17.7989 6.73661 18.2678 6.26777C18.7366 5.79893 19 5.16304 19 4.5C19 3.83696 18.7366 3.20107 18.2678 2.73223C17.7989 2.26339 17.163 2 16.5 2C13 2 12 7 12 7Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function EventDetailScreen() {
  const insets = useSafeAreaInsets();
  const { eventId, eventTitle } = useLocalSearchParams<{ eventId: string; eventTitle: string }>();
  const profile = useAuthStore((s) => s.profile);
  const showToast = useUIStore((s) => s.showToast);
  const [tab, setTab] = useState<Tab>("guests");
  const [guests, setGuests] = useState<EventGuest[]>([]);
  const [gifts, setGifts] = useState<GiftRecord[]>([]);
  const [summary, setSummary] = useState({ total: 0, attending: 0, notAttending: 0, pending: 0, totalPax: 0, checkedIn: 0 });
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [showAddGift, setShowAddGift] = useState(false);
  const [gName, setGName] = useState("");
  const [gPhone, setGPhone] = useState("");
  const [giftName, setGiftName] = useState("");
  const [giftAmount, setGiftAmount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { if (eventId) loadAll(); }, [eventId, tab]);

  async function loadAll() {
    try {
      const [g, s] = await Promise.all([getGuests(eventId!), getRsvpSummary(eventId!)]);
      setGuests(g); setSummary(s);
      if (tab === "amplop") setGifts(await getGiftsByEvent(eventId!));
    } catch {}
  }

  async function handleAddGuest() {
    if (!gName.trim()) return;
    setActionLoading(true);
    try { await addGuest(eventId!, { name: gName.trim(), phone: gPhone.trim() || null, contact_id: null, consumer_id: null }); showToast("Tamu ditambahkan!", "success"); setGName(""); setGPhone(""); setShowAddGuest(false); loadAll(); }
    catch { showToast("Gagal", "error"); } finally { setActionLoading(false); }
  }

  async function handleSendInvitation(guest: EventGuest) {
    if (!guest.phone) { showToast("Tamu tidak punya nomor HP", "error"); return; }
    const url = generateDeepLink("hj", "event", guest.guest_code ?? "");
    const msg = generateInvitationMessage(eventTitle ?? "Acara", guest.name, url);
    await shareToWhatsApp(guest.phone, msg);
    await markInvitationSent(guest.id);
    loadAll();
  }

  async function handleCheckIn(guest: EventGuest) {
    try { await markCheckedIn(guest.id); showToast(`${guest.name} checked in!`, "success"); loadAll(); }
    catch { showToast("Gagal", "error"); }
  }

  async function handleAddGift() {
    if (!giftName.trim() || giftAmount <= 0 || !profile?.id) return;
    setActionLoading(true);
    try { await addGift(profile.id, { event_id: eventId!, contact_id: null, person_name: giftName.trim(), direction: "received", amount: giftAmount, event_type: null, event_description: eventTitle ?? null, event_date: null }); showToast("Amplop dicatat!", "success"); setGiftName(""); setGiftAmount(0); setShowAddGift(false); loadAll(); }
    catch { showToast("Gagal", "error"); } finally { setActionLoading(false); }
  }

  async function handlePublish() {
    try { await updateEventStatus(eventId!, "published"); showToast("Undangan dipublish!", "success"); }
    catch { showToast("Gagal", "error"); }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "guests", label: "Tamu" }, { key: "rsvp", label: "RSVP" },
    { key: "checkin", label: "Check-in" }, { key: "amplop", label: "Amplop" },
  ];

  const totalAmplop = gifts.reduce((s, g) => s + (g.amount ?? 0), 0);

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Gradient Header */}
      <LinearGradient
        colors={GRADIENTS.hajat}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + SPACING.sm, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.md }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.md }}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
              <BackIcon size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={{ ...TYPO.h3, color: "#FFFFFF", flex: 1 }} numberOfLines={1}>{eventTitle}</Text>
          </View>
          <TouchableOpacity
            onPress={handlePublish}
            style={{
              backgroundColor: "rgba(255,255,255,0.25)",
              borderRadius: RADIUS.md,
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
            }}
          >
            <Text style={{ ...TYPO.captionBold, color: "#FFFFFF" }}>Publish</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Summary Cards */}
      <View style={{ flexDirection: "row", paddingHorizontal: SPACING.md, paddingTop: SPACING.md, gap: SPACING.sm }}>
        <Card variant="glass" style={{ flex: 1 }}>
          <View style={{ alignItems: "center" }}>
            <UsersIcon size={18} color="#64748B" />
            <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, marginTop: SPACING.xs }}>Tamu</Text>
            <Text style={{ ...TYPO.h2, color: "#1E293B" }}>{summary.total}</Text>
          </View>
        </Card>
        <Card variant="glass" style={{ flex: 1 }}>
          <View style={{ alignItems: "center" }}>
            <CheckIcon size={18} color={MODULE_COLOR} />
            <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, marginTop: SPACING.xs }}>Hadir</Text>
            <Text style={{ ...TYPO.h2, color: MODULE_COLOR }}>{summary.attending}</Text>
          </View>
        </Card>
        <Card variant="glass" style={{ flex: 1 }}>
          <View style={{ alignItems: "center" }}>
            <CheckIcon size={18} color="#64748B" />
            <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, marginTop: SPACING.xs }}>Check-in</Text>
            <Text style={{ ...TYPO.h2, color: "#1E293B" }}>{summary.checkedIn}</Text>
          </View>
        </Card>
      </View>

      {/* Tabs */}
      <View style={{
        flexDirection: "row",
        backgroundColor: GLASS.card.background,
        borderBottomWidth: 1,
        borderBottomColor: GLASS.card.border,
        marginTop: SPACING.sm,
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
        {tab === "guests" && (
          <>
            <Button title="+ Tambah Tamu" variant="secondary" onPress={() => setShowAddGuest(true)} />
            <View style={{ marginTop: SPACING.md }}>{guests.map((g) => (
              <Card key={g.id} variant="glass">
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>{g.name}</Text>
                    {g.phone && <Text style={{ ...TYPO.caption, color: "#64748B" }}>{g.phone}</Text>}
                  </View>
                  {!g.invitation_sent && g.phone ? (
                    <TouchableOpacity
                      onPress={() => handleSendInvitation(g)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: SPACING.xs,
                        backgroundColor: "#25D366",
                        borderRadius: RADIUS.md,
                        paddingHorizontal: SPACING.md,
                        paddingVertical: SPACING.sm,
                      }}
                    >
                      <SendIcon size={12} color="#FFFFFF" />
                      <Text style={{ ...TYPO.captionBold, color: "#FFFFFF" }}>Kirim</Text>
                    </TouchableOpacity>
                  ) : g.invitation_sent ? <Badge label="Terkirim" variant="success" /> : <Badge label="No HP" variant="neutral" />}
                </View>
              </Card>
            ))}{guests.length === 0 && <EmptyState illustration="👥" title="Belum ada tamu" />}</View>
          </>
        )}

        {tab === "rsvp" && guests.map((g) => {
          const r = RSVP_MAP[g.rsvp_status];
          return (
            <Card key={g.id} variant="glass">
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>{g.name}</Text>
                  <Text style={{ ...TYPO.caption, color: "#64748B" }}>{g.rsvp_count} orang</Text>
                </View>
                <Badge label={r.label} variant={r.variant} />
              </View>
            </Card>
          );
        })}

        {tab === "checkin" && guests.filter((g) => g.rsvp_status === "attending").map((g) => (
          <TouchableOpacity key={g.id} onPress={() => !g.checked_in && handleCheckIn(g)} activeOpacity={g.checked_in ? 1 : 0.7}>
            <Card variant="glass">
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{
                  width: 28,
                  height: 28,
                  borderRadius: RADIUS.sm,
                  borderWidth: 2,
                  borderColor: g.checked_in ? MODULE_COLOR : "#E2E8F0",
                  backgroundColor: g.checked_in ? MODULE_COLOR : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: SPACING.md,
                }}>
                  {g.checked_in && <CheckIcon size={14} color="#FFFFFF" />}
                </View>
                <Text style={{ ...TYPO.bodyBold, color: "#1E293B", flex: 1 }}>{g.name}</Text>
                <Text style={{ ...TYPO.caption, color: "#64748B" }}>{g.rsvp_count} pax</Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        {tab === "amplop" && (
          <>
            <Card variant="elevated">
              <View style={{ alignItems: "center", paddingVertical: SPACING.sm }}>
                <GiftIcon size={24} color={MODULE_COLOR} />
                <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, marginTop: SPACING.sm }}>Total Amplop</Text>
                <Text style={{ ...TYPO.money, color: MODULE_COLOR, marginTop: SPACING.xs }}>{formatRupiah(totalAmplop)}</Text>
                <Text style={{ ...TYPO.caption, color: "#64748B", marginTop: SPACING.xs }}>{gifts.length} amplop</Text>
              </View>
            </Card>
            <Button title="+ Catat Amplop" variant="secondary" onPress={() => setShowAddGift(true)} />
            <View style={{ marginTop: SPACING.md }}>{gifts.map((g) => (
              <Card key={g.id} variant="glass">
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...TYPO.bodyBold, color: "#1E293B" }}>{g.person_name}</Text>
                  </View>
                  <Text style={{ ...TYPO.bodyBold, color: MODULE_COLOR }}>{formatRupiah(g.amount ?? 0)}</Text>
                </View>
              </Card>
            ))}</View>
          </>
        )}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      <Modal visible={showAddGuest} onClose={() => setShowAddGuest(false)} title="Tambah Tamu">
        <Input label="Nama" placeholder="contoh: Pak Andi" value={gName} onChangeText={setGName} />
        <View style={{ marginTop: SPACING.md }}>
          <Input label="No HP (untuk kirim undangan)" placeholder="08123456789" value={gPhone} onChangeText={setGPhone} keyboardType="phone-pad" />
        </View>
        <View style={{ marginTop: SPACING.lg }}>
          <Button title="Tambah" onPress={handleAddGuest} loading={actionLoading} />
        </View>
      </Modal>

      <Modal visible={showAddGift} onClose={() => setShowAddGift(false)} title="Catat Amplop">
        <Input label="Dari" placeholder="contoh: Pak Andi" value={giftName} onChangeText={setGiftName} />
        <View style={{ marginTop: SPACING.md }}>
          <CurrencyInput label="Jumlah" value={giftAmount} onChangeValue={setGiftAmount} />
        </View>
        <View style={{ marginTop: SPACING.lg }}>
          <Button title="Simpan" onPress={handleAddGift} loading={actionLoading} />
        </View>
      </Modal>
    </View>
  );
}
