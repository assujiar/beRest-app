import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Modal } from "@components/ui/Modal";
import { EmptyState } from "@components/shared/EmptyState";
import {
  getAnnouncements,
  createAnnouncement,
  getAnnouncementReadCount,
} from "@services/warga.service";
import { shareViaWhatsApp } from "@services/wa-share.service";
import { useUIStore } from "@stores/ui.store";
import { formatRelativeTime } from "@utils/format";
import { GRADIENTS, RADIUS, TYPO, SPACING } from "@utils/theme";
import { COLORS } from "@utils/colors";
import type { Announcement } from "@app-types/warga.types";
import Svg, { Path } from "react-native-svg";

export default function AnnouncementsScreen() {
  const insets = useSafeAreaInsets();
  const { orgId, orgName } = useLocalSearchParams<{ orgId: string; orgName: string }>();
  const showToast = useUIStore((s) => s.showToast);
  const [announcements, setAnnouncements] = useState<(Announcement & { readCount?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    if (orgId) loadData();
  }, [orgId]);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getAnnouncements(orgId!);
      // Fetch read counts
      const withCounts = await Promise.all(
        data.map(async (a) => ({
          ...a,
          readCount: await getAnnouncementReadCount(a.id),
        }))
      );
      setAnnouncements(withCounts);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!title.trim() || !body.trim()) return;
    setCreateLoading(true);
    try {
      await createAnnouncement(orgId!, {
        title: title.trim(),
        body: body.trim(),
        is_pinned: false,
      });
      showToast("Pengumuman dibuat!", "success");
      setTitle("");
      setBody("");
      setShowCreate(false);
      loadData();
    } catch {
      showToast("Gagal membuat pengumuman", "error");
    } finally {
      setCreateLoading(false);
    }
  }

  function handleShare(announcement: Announcement) {
    const message =
      `📢 *${announcement.title}*\n\n` +
      `${announcement.body}\n\n` +
      `- ${orgName ?? "Organisasi"} via Apick`;
    shareViaWhatsApp(message);
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.lightBg }}>
      {/* Gradient Header */}
      <LinearGradient
        colors={GRADIENTS.warga}
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
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={12}
              style={{
                width: 36,
                height: 36,
                borderRadius: RADIUS.full,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M15 18L9 12L15 6" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            <Text style={{ ...TYPO.h3, color: "#FFFFFF", marginLeft: SPACING.md }}>
              Pengumuman
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowCreate(true)}
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: RADIUS.md,
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.3)",
            }}
          >
            <Text style={{ ...TYPO.captionBold, color: "#FFFFFF" }}>+ Buat</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.md, paddingBottom: SPACING.xxl }}
      >
        {!loading && announcements.length === 0 ? (
          <EmptyState
            illustration="📢"
            title="Belum ada pengumuman"
            description="Buat pengumuman untuk anggota organisasi"
            actionLabel="+ Buat Pengumuman"
            onAction={() => setShowCreate(true)}
          />
        ) : (
          announcements.map((a) => (
            <Card key={a.id} variant="glass">
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  {a.is_pinned && (
                    <View style={{ marginBottom: SPACING.xs }}>
                      <Badge label="Disematkan" variant="warning" />
                    </View>
                  )}
                  <Text style={{ ...TYPO.bodyBold, color: COLORS.darkText, marginTop: SPACING.xs }}>
                    {a.title}
                  </Text>
                  <Text style={{ ...TYPO.body, color: COLORS.greyText, marginTop: SPACING.xs }} numberOfLines={3}>
                    {a.body}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: SPACING.sm }}>
                    <Text style={{ ...TYPO.caption, color: COLORS.greyText }}>
                      {formatRelativeTime(a.created_at)}
                    </Text>
                    <Text style={{ ...TYPO.caption, color: COLORS.greyText, marginHorizontal: SPACING.sm }}>
                      ·
                    </Text>
                    <Text style={{ ...TYPO.caption, color: COLORS.greyText }}>
                      Dibaca {a.readCount ?? 0} orang
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleShare(a)}
                  style={{
                    marginLeft: SPACING.md,
                    width: 36,
                    height: 36,
                    borderRadius: RADIUS.full,
                    backgroundColor: "rgba(251,143,103,0.12)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" stroke={COLORS.warga} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M16 6L12 2L8 6" stroke={COLORS.warga} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M12 2V15" stroke={COLORS.warga} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        title="Buat Pengumuman"
      >
        <Input
          label="Judul"
          placeholder="contoh: Jadwal Kerja Bakti"
          value={title}
          onChangeText={setTitle}
        />
        <View style={{ marginTop: SPACING.md }}>
          <Input
            label="Isi Pengumuman"
            placeholder="Tulis isi pengumuman..."
            value={body}
            onChangeText={setBody}
            multiline
            numberOfLines={4}
            style={{ height: 100, textAlignVertical: "top", paddingTop: 12 }}
          />
        </View>
        <View style={{ marginTop: SPACING.md }}>
          <Button
            title="Kirim Pengumuman"
            onPress={handleCreate}
            loading={createLoading}
          />
        </View>
      </Modal>
    </View>
  );
}
