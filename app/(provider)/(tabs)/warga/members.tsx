import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
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
import { GRADIENTS, RADIUS, TYPO, SPACING } from "@utils/theme";
import { COLORS } from "@utils/colors";
import type { OrgMember, MemberRole } from "@app-types/warga.types";
import Svg, { Path } from "react-native-svg";

const ROLE_LABELS: Record<MemberRole, string> = {
  admin: "Admin",
  treasurer: "Bendahara",
  member: "Anggota",
};

export default function MembersScreen() {
  const insets = useSafeAreaInsets();
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
              Anggota ({members.length})
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleOpenAdd}
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: RADIUS.md,
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.3)",
            }}
          >
            <Text style={{ ...TYPO.captionBold, color: "#FFFFFF" }}>+ Tambah</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.md, paddingBottom: SPACING.xxl }}
      >
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
              <Card variant="glass">
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: RADIUS.full,
                      backgroundColor: "rgba(251,143,103,0.12)",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: SPACING.md,
                    }}
                  >
                    <Text style={{ ...TYPO.bodyBold, color: COLORS.warga }}>
                      {m.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...TYPO.bodyBold, color: COLORS.darkText }}>
                      {m.name}
                    </Text>
                    {m.phone && (
                      <Text style={{ ...TYPO.caption, color: COLORS.greyText }}>{m.phone}</Text>
                    )}
                    {m.member_code && (
                      <Text style={{ ...TYPO.caption, color: COLORS.greyText }}>
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
        <View style={{ marginTop: SPACING.md }}>
          <Input
            label="Nomor HP (opsional)"
            placeholder="contoh: 08123456789"
            value={newPhone}
            onChangeText={setNewPhone}
            keyboardType="phone-pad"
          />
        </View>
        <View style={{ marginTop: SPACING.md }}>
          <Button
            title="Tambah"
            onPress={handleAddMember}
            loading={addLoading}
          />
        </View>
      </Modal>

      <UpgradeModal visible={showUpgrade} onClose={() => setShowUpgrade(false)} currentTier={tier} featureName={upgradeFeature} />
    </View>
  );
}
