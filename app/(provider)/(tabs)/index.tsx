import { View, Text, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@components/ui/Card';
import { ModuleIcon } from '@components/ui/ModuleIcon';
import { RoleSwitcher } from '@components/shared/RoleSwitcher';
import { useModulesStore } from '@stores/modules.store';
import { useAuthStore } from '@stores/auth.store';
import { MODULE_COLORS, MODULE_LABELS } from '@utils/colors';
import { formatRupiah } from '@utils/format';
import { GRADIENTS, RADIUS, TYPO, SPACING } from '@utils/theme';
import type { ModuleKey } from '@app-types/shared.types';

interface ModuleSummary {
  key: ModuleKey;
  stats: { label: string; value: string }[];
}

const MODULE_EMPTY_STATS: Record<ModuleKey, { label: string; value: string }[]> = {
  lapak: [
    { label: 'Omzet hari ini', value: formatRupiah(0) },
    { label: 'Order aktif', value: '0' },
  ],
  sewa: [
    { label: 'Unit terisi', value: '0/0' },
    { label: 'Tagihan pending', value: '0' },
  ],
  warga: [
    { label: 'Anggota', value: '0' },
    { label: 'Iuran terkumpul', value: formatRupiah(0) },
  ],
  hajat: [
    { label: 'Acara aktif', value: '0' },
    { label: 'Tamu konfirmasi', value: '0' },
  ],
};

export default function ProviderHomeScreen() {
  const insets = useSafeAreaInsets();
  const activeModules = useModulesStore((s) => s.activeModules);
  const profile = useAuthStore((s) => s.profile);
  const name = profile?.full_name ?? 'Pengelola';

  const summaries: ModuleSummary[] = activeModules.map((key) => ({
    key,
    stats: MODULE_EMPTY_STATS[key],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Gradient header */}
      <LinearGradient
        colors={GRADIENTS.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + SPACING.sm,
          paddingBottom: SPACING.xl,
          paddingHorizontal: SPACING.lg,
          borderBottomLeftRadius: RADIUS.xxl,
          borderBottomRightRadius: RADIUS.xxl,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ ...TYPO.caption, color: 'rgba(255,255,255,0.7)' }}>Halo,</Text>
            <Text style={{ ...TYPO.h2, color: '#FFFFFF' }}>{name}</Text>
          </View>
          <RoleSwitcher />
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.lg, paddingTop: SPACING.md }}
      >
        {/* Module summary cards */}
        {summaries.map((mod) => {
          const moduleColor = MODULE_COLORS[mod.key];
          return (
            <Card key={mod.key} variant="elevated">
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                <ModuleIcon module={mod.key} size={22} withBackground />
                <Text style={{ ...TYPO.bodyBold, color: moduleColor, marginLeft: 12 }}>
                  {MODULE_LABELS[mod.key]}
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                {mod.stats.map((stat) => (
                  <View key={stat.label} style={{ flex: 1 }}>
                    <Text style={{ ...TYPO.small, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {stat.label}
                    </Text>
                    <Text style={{ ...TYPO.h2, color: '#1E293B', marginTop: 4 }}>
                      {stat.value}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          );
        })}

        {/* Empty state */}
        {activeModules.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: SPACING.xxl }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#E0F4F4',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: SPACING.lg,
              }}
            >
              <Text style={{ fontSize: 36 }}>📋</Text>
            </View>
            <Text style={{ ...TYPO.h3, color: '#1E293B', textAlign: 'center' }}>
              Belum ada module aktif
            </Text>
            <Text style={{ ...TYPO.body, color: '#64748B', textAlign: 'center', marginTop: SPACING.sm }}>
              Aktifkan module di Profil untuk mulai mengelola
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
