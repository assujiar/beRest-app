import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@components/ui/Card";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Modal } from "@components/ui/Modal";
import { EmptyState } from "@components/shared/EmptyState";
import { UpgradeModal } from "@components/shared/UpgradeModal";
import {
  getMembers,
  addMember,
  removeMember,
} from "@services/warga.service";
import { useSubscription } from "@hooks/shared/useSubscription";
import { useUIStore } from "@stores/ui.store";
import type { OrgMember, MemberRole } from "@app-types/warga.types";

const ROLE_LABELS: Record<MemberRole, string> = {
  admin: "Admin",
  treasurer: "Bendahara",
  member: "Anggota",
};

export default function MembersScreen() {
  const { orgId, orgName } = useLocalSearchParams<{
    orgId: string;
    orgName: string;
  }>();
  const showToast = useUIStore((s) => s.showToast);
  const { tier, requireUpgrade, showUpgrade, setShowUpgrade, upgradeFeature } = useSubscription();
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    if (orgId) loadMembers();
  }, [orgId]);

  async function loadMembers() {
    try {
      const data = await getMembers(orgId!);
      setMembers(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  function handleOpenAdd() {
    if (requireUpgrade("maxMembers", "Tambah Anggota", members.length)) return;
    setShowAdd(true);
  }

  async function handleAddMember() {
    if (!newName.trim()) return;
    setAddLoading(true);
    try {
      await addMember(orgId!, orgName ?? "ORG", {
        name: newName.trim(),
        phone: newPhone.trim() || null,
        role: "member",
        contact_id: null,
        consumer_id: null,
      });
      showToast(`${newName} ditambahkan`, "success");
      setNewName("");
      setNewPhone("");
      setShowAdd(false);
      loadMembers();
    } catch {
      showToast("Gagal menambahkan anggota", "error");
    } finally {
      setAddLoading(false);
    }
  }

  function handleRemove(member: OrgMember) {
    Alert.alert(
      "Hapus Anggota?",
      `${member.name} akan dihapus dari organisasi.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await removeMember(member.id);
              showToast(`${member.name} dihapus`, "success");
              loadMembers();
            } catch {
              showToast("Gagal menghapus", "error");
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border-color bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Text className="text-lg text-navy">←</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-dark-text ml-3">
            Anggota ({members.length})
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleOpenAdd}
          className="bg-warga rounded-lg px-3 py-2"
        >
          <Text className="text-white text-xs font-bold">+ Tambah</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-3">
        {!loading && members.length === 0 ? (
          <EmptyState
            illustration="👥"
            title="Belum ada anggota"
            description="Tambahkan anggota organisasi"
            actionLabel="+ Tambah Anggota"
            onAction={handleOpenAdd}
          />
        ) : (
          members.map((m) => (
            <TouchableOpacity
              key={m.id}
              onLongPress={() => handleRemove(m)}
              activeOpacity={0.8}
            >
              <Card>
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-warga/10 items-center justify-center mr-3">
                    <Text className="text-base font-bold text-warga">
                      {m.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-dark-text">
                      {m.name}
                    </Text>
                    {m.phone && (
                      <Text className="text-xs text-grey-text">{m.phone}</Text>
                    )}
                    {m.member_code && (
                      <Text className="text-xs text-grey-text">
                        Kode: {m.member_code}
                      </Text>
                    )}
                  </View>
                  <Badge
                    label={ROLE_LABELS[m.role]}
                    variant={m.role === "admin" ? "info" : "neutral"}
                  />
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        title="Tambah Anggota"
      >
        <Input
          label="Nama"
          placeholder="contoh: Pak Budi"
          value={newName}
          onChangeText={setNewName}
        />
        <View className="mt-3">
          <Input
            label="Nomor HP (opsional)"
            placeholder="contoh: 08123456789"
            value={newPhone}
            onChangeText={setNewPhone}
            keyboardType="phone-pad"
          />
        </View>
        <View className="mt-4">
          <Button
            title="Tambah"
            onPress={handleAddMember}
            loading={addLoading}
          />
        </View>
      </Modal>

      <UpgradeModal visible={showUpgrade} onClose={() => setShowUpgrade(false)} currentTier={tier} featureName={upgradeFeature} />
    </SafeAreaView>
  );
}
