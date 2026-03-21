import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { Badge } from "@components/ui/Badge";
import { UpgradeModal } from "@components/shared/UpgradeModal";
import { useAuthStore } from "@stores/auth.store";
import { useModulesStore } from "@stores/modules.store";
import { useRoleStore } from "@stores/role.store";
import { signOut, getProfile } from "@services/auth.service";
import { getTierLabel, getTierPrice, checkSubscription } from "@services/subscription.service";
import { formatDate, formatRupiah } from "@utils/format";
import { MODULE_LABELS, MODULE_COLORS } from "@utils/colors";
import type { ModuleKey, SubscriptionTier, BillingCycle } from "@app-types/shared.types";

export default function ProviderProfileScreen() {
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const reset = useAuthStore((s) => s.reset);
  const activeModules = useModulesStore((s) => s.activeModules);
  const role = useRoleStore((s) => s.role);
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [billingCycle, setBillingCycle] = useState<BillingCycle | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    if (session?.user.id) {
      checkSubscription(session.user.id).then((sub) => {
        setTier(sub.tier);
        setBillingCycle(sub.billingCycle);
        setExpiresAt(sub.expiresAt);
      });
    }
  }, [session?.user.id]);

  async function handleLogout() {
    Alert.alert(
      "Keluar",
      "Yakin ingin keluar dari akun?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Keluar",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            await signOut();
            reset();
            router.replace("/(auth)/welcome");
          },
        },
      ]
    );
  }

  async function refreshProfile() {
    if (!session?.user.id) return;
    const p = await getProfile(session.user.id);
    if (p) setProfile(p);
  }

  useEffect(() => {
    refreshProfile();
  }, [session?.user.id]);

  const tierColor = tier === "pro" ? "text-orange" : tier === "starter" ? "text-sewa" : "text-grey-text";

  return (
    <SafeAreaView className="flex-1 bg-light-bg" edges={["top"]}>
      <View className="px-4 py-3 border-b border-border-color bg-white">
        <Text className="text-lg font-bold text-dark-text">Profil</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-3">
        {/* Profile info */}
        <Card>
          <View className="items-center py-2">
            <View className="w-16 h-16 rounded-full bg-navy items-center justify-center mb-3">
              <Text className="text-2xl text-white font-bold">
                {(profile?.full_name ?? "?")[0].toUpperCase()}
              </Text>
            </View>
            <Text className="text-lg font-bold text-dark-text">
              {profile?.full_name ?? "Pengguna Apick"}
            </Text>
            {profile?.phone && (
              <Text className="text-sm text-grey-text mt-1">
                {profile.phone}
              </Text>
            )}
            <View className="flex-row mt-2">
              <Badge
                label={role === "both" ? "Pengelola & Pengguna" : role === "provider" ? "Pengelola" : "Pengguna"}
                variant="info"
              />
            </View>
          </View>
        </Card>

        {/* Subscription */}
        <Card>
          <Text className="text-xs text-grey-text mb-1">LANGGANAN</Text>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className={`text-lg font-bold ${tierColor}`}>
                {getTierLabel(tier)}
              </Text>
              {tier !== "free" && (
                <Text className="text-xs text-grey-text">
                  {formatRupiah(getTierPrice(tier, billingCycle ?? "monthly"))}
                  {billingCycle === "annual" ? "/tahun" : "/bulan"}
                </Text>
              )}
              {tier !== "free" && expiresAt && (
                <Text className="text-xs text-grey-text">
                  Berlaku hingga {formatDate(expiresAt)}
                </Text>
              )}
              {tier === "free" && (
                <Text className="text-xs text-grey-text">
                  Rp 0/bulan
                </Text>
              )}
            </View>
            <TouchableOpacity
              className="bg-orange/10 rounded-lg px-3 py-2"
              onPress={() => setShowUpgrade(true)}
            >
              <Text className="text-orange text-xs font-bold">
                {tier === "free" ? "Upgrade" : "Ganti Paket"}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Active modules */}
        <Card>
          <Text className="text-xs text-grey-text mb-2">MODUL AKTIF</Text>
          {activeModules.length === 0 ? (
            <Text className="text-sm text-grey-text">Belum ada modul aktif</Text>
          ) : (
            <View className="flex-row flex-wrap">
              {activeModules.map((mod: ModuleKey) => (
                <View
                  key={mod}
                  className="flex-row items-center mr-4 mb-2"
                >
                  <View
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: MODULE_COLORS[mod] }}
                  />
                  <Text className="text-sm text-dark-text font-medium">
                    {MODULE_LABELS[mod]}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Account info */}
        <Card>
          <Text className="text-xs text-grey-text mb-2">AKUN</Text>
          {profile?.created_at && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-grey-text">Bergabung</Text>
              <Text className="text-sm text-dark-text">
                {formatDate(profile.created_at)}
              </Text>
            </View>
          )}
          <View className="flex-row justify-between">
            <Text className="text-sm text-grey-text">User ID</Text>
            <Text className="text-xs text-grey-text font-mono">
              {session?.user.id.slice(0, 8)}...
            </Text>
          </View>
        </Card>

        {/* Logout */}
        <View className="mt-2 mb-8">
          <Button
            title="Keluar"
            variant="destructive"
            onPress={handleLogout}
            loading={loading}
          />
        </View>
      </ScrollView>

      <UpgradeModal
        visible={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        currentTier={tier}
      />
    </SafeAreaView>
  );
}
