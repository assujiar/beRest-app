import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
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
import type { Announcement } from "@app-types/warga.types";

export default function AnnouncementsScreen() {
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
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border-color bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Text className="text-lg text-navy">←</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-dark-text ml-3">
            Pengumuman
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowCreate(true)}
          className="bg-warga rounded-lg px-3 py-2"
        >
          <Text className="text-white text-xs font-bold">+ Buat</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-3">
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
            <Card key={a.id}>
              <View className="flex-row items-start">
                <View className="flex-1">
                  {a.is_pinned && (
                    <Badge label="📌 Disematkan" variant="warning" />
                  )}
                  <Text className="text-base font-bold text-dark-text mt-1">
                    {a.title}
                  </Text>
                  <Text className="text-sm text-grey-text mt-1" numberOfLines={3}>
                    {a.body}
                  </Text>
                  <View className="flex-row items-center mt-2">
                    <Text className="text-xs text-grey-text">
                      {formatRelativeTime(a.created_at)}
                    </Text>
                    <Text className="text-xs text-grey-text mx-2">•</Text>
                    <Text className="text-xs text-grey-text">
                      Dibaca {a.readCount ?? 0} orang
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleShare(a)}
                  className="ml-3 p-2"
                >
                  <Text className="text-base">📤</Text>
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
        <View className="mt-3">
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
        <View className="mt-4">
          <Button
            title="Kirim Pengumuman"
            onPress={handleCreate}
            loading={createLoading}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}
