import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@components/ui/Card';
import { Badge } from '@components/ui/Badge';
import { ModuleIcon } from '@components/ui/ModuleIcon';
import { RoleSwitcher } from '@components/shared/RoleSwitcher';
import { EmptyState } from '@components/shared/EmptyState';
import { useConnectionsStore } from '@stores/connections.store';
import { useAuthStore } from '@stores/auth.store';
import { MODULE_COLORS, MODULE_LABELS } from '@utils/colors';
import { GRADIENTS, RADIUS, TYPO, SPACING } from '@utils/theme';
import type { ConsumerConnection } from '@app-types/shared.types';

function ConnectionCard({ connection }: { connection: ConsumerConnection }) {
  const moduleColor = MODULE_COLORS[connection.module];

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(consumer)/${connection.module}/${connection.id}`)}
      activeOpacity={0.8}
    >
      <Card variant="elevated">
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ModuleIcon module={connection.module} size={22} withBackground />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={{ ...TYPO.bodyBold, color: '#1E293B' }}>
              {connection.notes ?? 'Provider'}
            </Text>
            <Text style={{ ...TYPO.small, color: moduleColor, marginTop: 2 }}>
              {MODULE_LABELS[connection.module]}
            </Text>
          </View>
          <Badge
            label={connection.status === 'active' ? 'Aktif' : 'Pending'}
            variant={connection.status === 'active' ? 'success' : 'warning'}
            dot
          />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export default function ConsumerHomeScreen() {
  const insets = useSafeAreaInsets();
  const connections = useConnectionsStore((s) => s.connections);
  const profile = useAuthStore((s) => s.profile);
  const name = profile?.full_name ?? 'Pengguna';

  const activeConnections = connections.filter(
    (c) => c.status === 'active' || c.status === 'pending'
  );

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

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: SPACING.lg, paddingTop: SPACING.md }}>
        {activeConnections.length > 0 ? (
          <>
            <Text style={{ ...TYPO.small, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: SPACING.sm }}>
              Terhubung dengan
            </Text>
            {activeConnections.map((conn) => (
              <ConnectionCard key={conn.id} connection={conn} />
            ))}
          </>
        ) : (
          <EmptyState
            illustration="🔗"
            title="Belum terhubung dengan siapapun"
            description="Masukkan kode koneksi atau scan QR dari pengelola"
            actionLabel="Hubungkan"
            onAction={() => router.push('/connect/code')}
          />
        )}
      </ScrollView>
    </View>
  );
}
