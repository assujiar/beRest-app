import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@components/ui/Button';
import { ModuleIcon } from '@components/ui/ModuleIcon';
import { UpgradeModal } from '@components/shared/UpgradeModal';
import { useModulesStore } from '@stores/modules.store';
import { useRoleStore } from '@stores/role.store';
import { useAuthStore } from '@stores/auth.store';
import { useSubscription } from '@hooks/shared/useSubscription';
import { upsertProfile } from '@services/auth.service';
import { MODULE_COLORS, MODULE_LABELS } from '@utils/colors';
import { GRADIENTS, GLASS, RADIUS, TYPO, SPACING } from '@utils/theme';
import type { ModuleKey } from '@app-types/shared.types';

const MODULE_OPTIONS: { key: ModuleKey; description: string }[] = [
  { key: 'lapak', description: 'Jualan, laundry, les, jasa' },
  { key: 'sewa', description: 'Kos, kontrakan, rental barang' },
  { key: 'warga', description: 'RT/RW, mesjid, pengajian, klub' },
  { key: 'hajat', description: 'Undangan, kondangan, amplop' },
];

export default function ProviderOnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<ModuleKey[]>([]);
  const [saving, setSaving] = useState(false);
  const setActiveModules = useModulesStore((s) => s.setActiveModules);
  const setRole = useRoleStore((s) => s.setRole);
  const setActiveView = useRoleStore((s) => s.setActiveView);
  const session = useAuthStore((s) => s.session);
  const setProfile = useAuthStore((s) => s.setProfile);
  const { tier, limits, showUpgrade, setShowUpgrade } = useSubscription();

  function toggleModule(key: ModuleKey) {
    setSelected((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= limits.maxModules) { setShowUpgrade(true); return prev; }
      return [...prev, key];
    });
  }

  async function handleContinue() {
    setSaving(true);
    if (session?.user.id) {
      const { data } = await upsertProfile(session.user.id, { role: 'provider', active_modules: selected });
      if (data) setProfile(data);
    }
    setActiveModules(selected);
    setRole('provider');
    setActiveView('provider');
    setSaving(false);
    router.replace('/(provider)/(tabs)');
  }

  async function handleSkipToConsumer() {
    setSaving(true);
    if (session?.user.id) {
      const { data } = await upsertProfile(session.user.id, { role: 'consumer' });
      if (data) setProfile(data);
    }
    setRole('consumer');
    setActiveView('consumer');
    setSaving(false);
    router.replace('/(consumer)/(tabs)');
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Gradient header */}
      <LinearGradient
        colors={GRADIENTS.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + SPACING.lg,
          paddingBottom: SPACING.xl,
          paddingHorizontal: SPACING.lg,
          borderBottomLeftRadius: RADIUS.xxl,
          borderBottomRightRadius: RADIUS.xxl,
        }}
      >
        <Text style={{ ...TYPO.h1, color: '#FFFFFF' }}>Mau apik-in apa?</Text>
        <Text style={{ ...TYPO.body, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
          Pilih minimal 1 modul. Bisa tambah nanti.
        </Text>
        {tier === 'free' && (
          <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.sm, paddingHorizontal: 12, paddingVertical: 6, marginTop: SPACING.sm, alignSelf: 'flex-start' }}>
            <Text style={{ ...TYPO.small, color: 'rgba(255,255,255,0.9)' }}>Paket Gratis: 1 modul. Upgrade untuk lebih.</Text>
          </View>
        )}
        {tier === 'starter' && (
          <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.sm, paddingHorizontal: 12, paddingVertical: 6, marginTop: SPACING.sm, alignSelf: 'flex-start' }}>
            <Text style={{ ...TYPO.small, color: 'rgba(255,255,255,0.9)' }}>Paket Starter: 2 modul.</Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: SPACING.lg, paddingTop: SPACING.lg }}>
        {MODULE_OPTIONS.map((mod) => {
          const isSelected = selected.includes(mod.key);
          const moduleColor = MODULE_COLORS[mod.key];

          return (
            <TouchableOpacity
              key={mod.key}
              onPress={() => toggleModule(mod.key)}
              activeOpacity={0.8}
              style={{ marginBottom: 12 }}
            >
              <View
                style={{
                  borderRadius: RADIUS.xl,
                  borderWidth: 2,
                  borderColor: isSelected ? moduleColor : GLASS.card.border,
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.95)' : GLASS.card.background,
                  overflow: 'hidden',
                  ...(isSelected ? GLASS.shadow.md : GLASS.shadow.sm),
                }}
              >
                {/* Colored top accent */}
                {isSelected && (
                  <LinearGradient
                    colors={GRADIENTS[mod.key]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ height: 4 }}
                  />
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
                  <ModuleIcon module={mod.key} size={28} withBackground />
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={{ ...TYPO.bodyBold, color: '#1E293B' }}>
                      {MODULE_LABELS[mod.key]}
                    </Text>
                    <Text style={{ ...TYPO.caption, color: '#64748B', marginTop: 2 }}>
                      {mod.description}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      borderWidth: 2,
                      borderColor: isSelected ? moduleColor : '#E2E8F0',
                      backgroundColor: isSelected ? moduleColor : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isSelected && <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>✓</Text>}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={{ paddingHorizontal: SPACING.lg, paddingBottom: insets.bottom + SPACING.lg, paddingTop: SPACING.sm }}>
        <Button title="Lanjut" onPress={handleContinue} disabled={selected.length === 0} loading={saving} />
        <TouchableOpacity onPress={handleSkipToConsumer} style={{ marginTop: SPACING.md, alignItems: 'center', paddingVertical: 8 }}>
          <Text style={{ ...TYPO.caption, color: '#64748B' }}>Saya cuma pengguna, bukan pengelola</Text>
        </TouchableOpacity>
      </View>

      <UpgradeModal visible={showUpgrade} onClose={() => setShowUpgrade(false)} currentTier={tier} featureName="Tambah modul" />
    </View>
  );
}
