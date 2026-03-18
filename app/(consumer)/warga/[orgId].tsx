import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
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
import type { Organization, OrgDues, Announcement, DuesStatus } from "@app-types/warga.types";

const STATUS_MAP: Record<DuesStatus, { label: string; variant: "success" | "error" | "warning" | "neutral" }> = {
  paid: { label: "Lunas", variant: "success" },
  unpaid: { label: "Belum Bayar", variant: "error" },
  partial: { label: "Sebagian", variant: "warning" },
  exempt: { label: "Dibebaskan", variant: "neutral" },
};

export default function ConsumerWargaScreen() {
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

      // Get my dues via member lookup
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
    // Get member id
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
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-border-color bg-white">
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text className="text-lg text-navy">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-dark-text ml-3">
          {org?.name ?? "Organisasi"}
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-3">
        {/* My dues */}
        <Text className="text-sm font-bold text-grey-text mb-2">
          STATUS IURAN
        </Text>
        {myDues.length > 0 ? (
          myDues.map((d) => {
            const s = STATUS_MAP[d.status];
            return (
              <Card key={d.id}>
                <View className="flex-row items-center">
                  <View className="flex-1">
                    <Text className="text-sm text-grey-text">{d.period}</Text>
                    <Text className="text-lg font-bold text-dark-text">
                      {formatRupiah(d.amount)}
                    </Text>
                    {d.paid_date && (
                      <Text className="text-xs text-grey-text">
                        Dibayar {formatDate(d.paid_date)}
                      </Text>
                    )}
                  </View>
                  <View className="items-end">
                    <Badge label={s.label} variant={s.variant} />
                    {d.status === "unpaid" && (
                      <TouchableOpacity
                        onPress={() => setShowUpload(d.id)}
                        className="mt-2"
                      >
                        <Text className="text-xs text-warga font-bold">
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
          <Card>
            <Text className="text-sm text-grey-text text-center">
              Belum ada data iuran
            </Text>
          </Card>
        )}

        {/* Announcements */}
        <Text className="text-sm font-bold text-grey-text mt-6 mb-2">
          PENGUMUMAN
        </Text>
        {announcements.length > 0 ? (
          announcements.map((a) => (
            <TouchableOpacity
              key={a.id}
              onPress={() => handleReadAnnouncement(a)}
              activeOpacity={0.8}
            >
              <Card>
                {a.is_pinned && (
                  <Badge label="📌 Disematkan" variant="warning" />
                )}
                <Text className="text-base font-bold text-dark-text mt-1">
                  {a.title}
                </Text>
                <Text className="text-sm text-grey-text mt-1">
                  {a.body}
                </Text>
                <Text className="text-xs text-grey-text mt-2">
                  {formatRelativeTime(a.created_at)}
                </Text>
              </Card>
            </TouchableOpacity>
          ))
        ) : (
          <Card>
            <Text className="text-sm text-grey-text text-center">
              Belum ada pengumuman
            </Text>
          </Card>
        )}
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
        <View className="mt-4">
          <Button
            title="Kirim Bukti"
            onPress={handleUploadProof}
            loading={uploadLoading}
            disabled={!proofPhoto}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}
