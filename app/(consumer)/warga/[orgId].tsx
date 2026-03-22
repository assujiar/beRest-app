import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { PhotoPicker } from "@components/shared/PhotoPicker";
import { Modal } from "@components/ui/Modal";
import {
  getOrganization,
  getAnnouncements,
  markAnnouncementRead,
} from "@services/warga.service";
import { supabase } from "@services/supabase";
import { useAuthStore } from "@stores/auth.store";
import { useUIStore } from "@stores/ui.store";
import { formatRupiah, formatRelativeTime, formatDate } from "@utils/format";
import { GRADIENTS, TYPO, SPACING } from "@utils/theme";
import type { Organization, OrgDues, Announcement, DuesStatus } from "@app-types/warga.types";

const MODULE_COLOR = "#FB8F67";

const STATUS_MAP: Record<DuesStatus, { label: string; variant: "success" | "error" | "warning" | "neutral" }> = {
  paid: { label: "Lunas", variant: "success" },
  unpaid: { label: "Belum Bayar", variant: "error" },
  partial: { label: "Sebagian", variant: "warning" },
  exempt: { label: "Dibebaskan", variant: "neutral" },
};

function BackIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 19L8 12L15 5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PinIcon({ size = 12, color = "#FB8F67" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Use GLASS in card styling to prevent linter from removing the import
// const _glassRef = GLASS;

export default function ConsumerWargaScreen() {
  const insets = useSafeAreaInsets();
  const { orgId } = useLocalSearchParams<{ orgId: string }>();
  const profile = useAuthStore((s) => s.profile);
  const showToast = useUIStore((s) => s.showToast);
  const [org, setOrg] = useState<Organization | null>(null);
  const [myDues, setMyDues] = useState<OrgDues[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [_loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState<string | null>(null);
  const [proofPhoto, setProofPhoto] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    if (orgId) loadData();
  }, [orgId]);

  async function loadData() {
    setLoading(true);
    try {
      const [orgData, announcementsData] = await Promise.all([
        getOrganization(orgId!),
        getAnnouncements(orgId!),
      ]);
      setOrg(orgData);
      setAnnouncements(announcementsData);

      if (profile?.id) {
        const { data: memberData } = await supabase
          .from("org_members")
          .select("id")
          .eq("org_id", orgId!)
          .eq("consumer_id", profile.id)
          .single();

        if (memberData) {
          const { data: duesData } = await supabase
            .from("org_dues")
            .select("*")
            .eq("member_id", memberData.id)
            .order("period", { ascending: false })
            .limit(6);

          setMyDues((duesData ?? []) as OrgDues[]);
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function handleUploadProof() {
    if (!proofPhoto || !showUpload) return;
    setUploadLoading(true);
    try {
      await supabase
        .from("org_dues")
        .update({ proof_photo: proofPhoto, status: "paid", paid_date: new Date().toISOString() })
        .eq("id", showUpload);

      showToast("Bukti bayar terkirim!", "success");
      setShowUpload(null);
      setProofPhoto(null);
      loadData();
    } catch {
      showToast("Gagal upload bukti bayar", "error");
    } finally {
      setUploadLoading(false);
    }
  }

  async function handleReadAnnouncement(a: Announcement) {
    if (!profile?.id) return;
    const { data: memberData } = await supabase
      .from("org_members")
      .select("id")
      .eq("org_id", orgId!)
      .eq("consumer_id", profile.id)
      .single();

    if (memberData) {
      await markAnnouncementRead(a.id, memberData.id);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Gradient Header */}
      <LinearGradient
        colors={GRADIENTS.warga}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + SPACING.sm, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.md }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.md }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <BackIcon size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ ...TYPO.h3, color: "#FFFFFF" }}>{org?.name ?? "Organisasi"}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={{ flex: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.md }}>
        {/* My dues */}
        <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: SPACING.sm }}>
          STATUS IURAN
        </Text>
        {myDues.length > 0 ? (
          myDues.map((d) => {
            const s = STATUS_MAP[d.status];
            return (
              <Card key={d.id} variant="glass">
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...TYPO.caption, color: "#64748B" }}>{d.period}</Text>
                    <Text style={{ ...TYPO.h3, color: "#1E293B", marginTop: 2 }}>
                      {formatRupiah(d.amount)}
                    </Text>
                    {d.paid_date && (
                      <Text style={{ ...TYPO.caption, color: "#64748B", marginTop: 2 }}>
                        Dibayar {formatDate(d.paid_date)}
                      </Text>
                    )}
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Badge label={s.label} variant={s.variant} />
                    {d.status === "unpaid" && (
                      <TouchableOpacity
                        onPress={() => setShowUpload(d.id)}
                        style={{ marginTop: SPACING.sm }}
                      >
                        <Text style={{ ...TYPO.captionBold, color: MODULE_COLOR }}>
                          Upload Bukti
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </Card>
            );
          })
        ) : (
          <Card variant="glass">
            <Text style={{ ...TYPO.body, color: "#64748B", textAlign: "center" }}>
              Belum ada data iuran
            </Text>
          </Card>
        )}

        {/* Announcements */}
        <Text style={{ ...TYPO.small, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, marginTop: SPACING.xl, marginBottom: SPACING.sm }}>
          PENGUMUMAN
        </Text>
        {announcements.length > 0 ? (
          announcements.map((a) => (
            <TouchableOpacity
              key={a.id}
              onPress={() => handleReadAnnouncement(a)}
              activeOpacity={0.8}
            >
              <Card variant="glass">
                {a.is_pinned && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.xs, marginBottom: SPACING.xs }}>
                    <PinIcon size={12} color={MODULE_COLOR} />
                    <Text style={{ ...TYPO.captionBold, color: MODULE_COLOR }}>Disematkan</Text>
                  </View>
                )}
                <Text style={{ ...TYPO.bodyBold, color: "#1E293B", marginTop: SPACING.xs }}>
                  {a.title}
                </Text>
                <Text style={{ ...TYPO.body, color: "#64748B", marginTop: SPACING.xs }}>
                  {a.body}
                </Text>
                <Text style={{ ...TYPO.caption, color: "#94A3B8", marginTop: SPACING.sm }}>
                  {formatRelativeTime(a.created_at)}
                </Text>
              </Card>
            </TouchableOpacity>
          ))
        ) : (
          <Card variant="glass">
            <Text style={{ ...TYPO.body, color: "#64748B", textAlign: "center" }}>
              Belum ada pengumuman
            </Text>
          </Card>
        )}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      {/* Upload proof modal */}
      <Modal
        visible={!!showUpload}
        onClose={() => {
          setShowUpload(null);
          setProofPhoto(null);
        }}
        title="Upload Bukti Bayar"
      >
        <PhotoPicker
          label="Foto Bukti Transfer"
          value={proofPhoto}
          onChange={setProofPhoto}
        />
        <View style={{ marginTop: SPACING.lg }}>
          <Button
            title="Kirim Bukti"
            onPress={handleUploadProof}
            loading={uploadLoading}
            disabled={!proofPhoto}
          />
        </View>
      </Modal>
    </View>
  );
}
