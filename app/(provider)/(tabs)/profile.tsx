import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { ModuleIcon } from '@components/ui/ModuleIcon';
import { UpgradeModal } from '@components/shared/UpgradeModal';
import { useAuthStore } from '@stores/auth.store';
import { useModulesStore } from '@stores/modules.store';
import { useRoleStore } from '@stores/role.store';
import { signOut, getProfile } from '@services/auth.service';
import { getTierLabel, getTierPrice, checkSubscription } from '@services/subscription.service';
import { formatDate, formatRupiah } from '@utils/format';
import { MODULE_LABELS, MODULE_COLORS } from '@utils/colors';
import { GRADIENTS, RADIUS, TYPO, SPACING } from '@utils/theme';
import type { ModuleKey, SubscriptionTier, BillingCycle } from '@app-types/shared.types';
import Svg, { Path } from 'react-native-svg';

export default function ProviderProfileScreen() {
  const insets = useSafeAreaInsets();
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const reset = useAuthStore((s) => s.reset);
  const activeModules = useModulesStore((s) => s.activeModules);
  const role = useRoleStore((s) => s.role);
  const [tier, setTier] = useState<SubscriptionTier>('free');
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
    Alert.alert('Keluar', 'Yakin ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          await signOut();
          reset();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  }

  useEffect(() => {
    if (session?.user.id) {
      getProfile(session.user.id).then((p) => { if (p) setProfile(p); });
    }
  }, [session?.user.id]);

  const tierColors: Record<SubscriptionTier, string> = { pro: '#156064', starter: '#00C49A', free: '#64748B' };
  const initial = (profile?.full_name ?? '?')[0].toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Profile header with gradient */}
      <LinearGradient
        colors={GRADIENTS.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + SPACING.md,
          paddingBottom: SPACING.xxl,
          paddingHorizontal: SPACING.lg,
          alignItems: 'center',
          borderBottomLeftRadius: RADIUS.xxl,
          borderBottomRightRadius: RADIUS.xxl,
        }}
      >
        {/* Avatar */}
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderWidth: 3,
            borderColor: 'rgba(255,255,255,0.4)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: SPACING.sm,
          }}
        >
          <Text style={{ fontSize: 32, fontWeight: '700', color: '#FFFFFF' }}>{initial}</Text>
        </View>
        <Text style={{ ...TYPO.h2, color: '#FFFFFF' }}>
          {profile?.full_name ?? 'Pengguna Apick'}
        </Text>
        {profile?.phone && (
          <Text style={{ ...TYPO.caption, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{profile.phone}</Text>
        )}
        {profile?.email && (
          <Text style={{ ...TYPO.caption, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{profile.email}</Text>
        )}
        <View style={{ marginTop: SPACING.sm }}>
          <Badge
            label={role === 'both' ? 'Pengelola & Pengguna' : role === 'provider' ? 'Pengelola' : 'Pengguna'}
            variant="info"
          />
        </View>
        <TouchableOpacity
          onPress={() => router.push('/edit-profile')}
          style={{
            marginTop: SPACING.md,
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: RADIUS.md,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.3)',
          }}
        >
          <Text style={{ ...TYPO.captionBold, color: '#FFFFFF' }}>Edit Profil</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: SPACING.lg, paddingTop: SPACING.md }}>
        {/* Subscription */}
        <Card variant="elevated">
          <Text style={{ ...TYPO.small, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Langganan</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ ...TYPO.h3, color: tierColors[tier] }}>{getTierLabel(tier)}</Text>
              <Text style={{ ...TYPO.caption, color: '#94A3B8', marginTop: 2 }}>
                {tier === 'free'
                  ? 'Rp 0/bulan'
                  : `${formatRupiah(getTierPrice(tier, billingCycle ?? 'monthly'))}${billingCycle === 'annual' ? '/tahun' : '/bulan'}`}
              </Text>
              {tier !== 'free' && expiresAt && (
                <Text style={{ ...TYPO.caption, color: '#94A3B8' }}>Berlaku hingga {formatDate(expiresAt)}</Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => setShowUpgrade(true)}
              style={{
                borderRadius: RADIUS.md,
                overflow: 'hidden',
              }}
            >
              <LinearGradient
                colors={GRADIENTS.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: RADIUS.md }}
              >
                <Text style={{ ...TYPO.captionBold, color: '#FFFFFF' }}>
                  {tier === 'free' ? 'Upgrade' : 'Ganti Paket'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Active modules */}
        <Card variant="glass">
          <Text style={{ ...TYPO.small, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Modul Aktif</Text>
          {activeModules.length === 0 ? (
            <Text style={{ ...TYPO.body, color: '#94A3B8' }}>Belum ada modul aktif</Text>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {activeModules.map((mod: ModuleKey) => (
                <View
                  key={mod}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: `${MODULE_COLORS[mod]}10`,
                    borderRadius: RADIUS.full,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                  }}
                >
                  <ModuleIcon module={mod} size={16} />
                  <Text style={{ ...TYPO.captionBold, color: MODULE_COLORS[mod], marginLeft: 8 }}>
                    {MODULE_LABELS[mod]}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Account info */}
        <Card variant="glass">
          <Text style={{ ...TYPO.small, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Akun</Text>
          {profile?.created_at && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ ...TYPO.caption, color: '#64748B' }}>Bergabung</Text>
              <Text style={{ ...TYPO.captionBold, color: '#1E293B' }}>{formatDate(profile.created_at)}</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ ...TYPO.caption, color: '#64748B' }}>User ID</Text>
            <Text style={{ ...TYPO.caption, color: '#94A3B8' }}>{session?.user.id.slice(0, 8)}...</Text>
          </View>
        </Card>

        {/* Linked accounts */}
        <TouchableOpacity onPress={() => router.push('/linked-accounts')}>
          <Card variant="glass">
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ ...TYPO.bodyBold, color: '#1E293B' }}>Metode Login</Text>
                <Text style={{ ...TYPO.caption, color: '#64748B', marginTop: 2 }}>Kelola cara masuk ke akun kamu</Text>
              </View>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M9 18L15 12L9 6" stroke="#94A3B8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Logout */}
        <View style={{ marginTop: SPACING.sm, marginBottom: SPACING.xl }}>
          <Button title="Keluar" variant="destructive" onPress={handleLogout} loading={loading} />
        </View>
      </ScrollView>

      <UpgradeModal visible={showUpgrade} onClose={() => setShowUpgrade(false)} currentTier={tier} />
    </View>
  );
}
