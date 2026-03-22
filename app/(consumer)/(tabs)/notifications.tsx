import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@components/ui/Card';
import { useAuthStore } from '@stores/auth.store';
import { getNotifications, markAsRead, markAllAsRead } from '@services/notification.service';
import { formatRelativeTime } from '@utils/format';
import { MODULE_LABELS } from '@utils/colors';
import { GRADIENTS, RADIUS, TYPO, SPACING } from '@utils/theme';
import type { Notification } from '@app-types/consumer.types';
import Svg, { Path } from 'react-native-svg';

function NotifIcon({ type }: { type: string }) {
  const icons: Record<string, { color: string; d: string }> = {
    order_update: { color: '#2C7695', d: 'M20 12V22H4V12M22 7H2V12H22V7ZM12 22V7M12 7H7.5C6.8 7 6 6.5 6 5.5S6.8 4 7.5 4C9 4 12 7 12 7ZM12 7H16.5C17.2 7 18 6.5 18 5.5S17.2 4 16.5 4C15 4 12 7 12 7Z' },
    payment_due: { color: '#F59E0B', d: 'M12 2V22M17 5H9.5C8.6 5 7.7 5.4 7.1 6C6.4 6.6 6 7.5 6 8.5C6 9.5 6.4 10.4 7.1 11C7.7 11.6 8.6 12 9.5 12H14.5C15.4 12 16.3 12.4 16.9 13C17.6 13.6 18 14.5 18 15.5C18 16.5 17.6 17.4 16.9 18C16.3 18.6 15.4 19 14.5 19H6' },
    announcement: { color: '#FB8F67', d: 'M18 8C19.3 9.3 20 11.1 20 13M22 8C24.2 10.2 24.2 13.8 22 16M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.97 16.97 21 12 21C10.5 21 9.08 20.6 7.78 19.9L3 21L4.1 16.2C3.4 14.9 3 13.5 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z' },
    default: { color: '#94A3B8', d: 'M18 8C18 6.4 17.4 4.9 16.2 3.8C15.1 2.6 13.6 2 12 2C10.4 2 8.9 2.6 7.8 3.8C6.6 4.9 6 6.4 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8ZM13.7 21C13.5 21.3 13.2 21.6 12.9 21.8C12.5 21.9 12.3 22 12 22C11.7 22 11.5 21.9 11.1 21.8C10.8 21.6 10.5 21.3 10.3 21' },
  };
  const cfg = icons[type] ?? icons.default;
  return (
    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${cfg.color}15`, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d={cfg.d} stroke={cfg.color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const session = useAuthStore((s) => s.session);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!session?.user.id) return;
    try {
      const data = await getNotifications(session.user.id);
      setNotifications(data);
    } catch {}
  }, [session?.user.id]);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  async function onRefresh() { setRefreshing(true); await loadNotifications(); setRefreshing(false); }

  async function handleMarkRead(id: string) {
    try { await markAsRead(id); setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))); } catch {}
  }

  async function handleMarkAllRead() {
    if (!session?.user.id) return;
    try { await markAllAsRead(session.user.id); setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true }))); } catch {}
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const grouped = notifications.reduce<Record<string, Notification[]>>((acc, n) => {
    const dateKey = new Date(n.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(n);
    return acc;
  }, {});

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Header */}
      <LinearGradient
        colors={GRADIENTS.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + SPACING.sm,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.lg,
          borderBottomLeftRadius: RADIUS.xxl,
          borderBottomRightRadius: RADIUS.xxl,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ ...TYPO.h2, color: '#FFFFFF' }}>Notifikasi</Text>
            {unreadCount > 0 && (
              <View style={{ marginLeft: 10, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ ...TYPO.small, color: '#FFFFFF', fontWeight: '700' }}>{unreadCount}</Text>
              </View>
            )}
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllRead}>
              <Text style={{ ...TYPO.captionBold, color: 'rgba(255,255,255,0.9)' }}>Tandai semua dibaca</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.lg, paddingTop: SPACING.md }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {notifications.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: SPACING.xxl }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#E0F4F4', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg }}>
              <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                <Path d="M18 8C18 6.4 17.4 4.9 16.2 3.8C15.1 2.6 13.6 2 12 2C10.4 2 8.9 2.6 7.8 3.8C6.6 4.9 6 6.4 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="#2C7695" strokeWidth={1.8} strokeLinecap="round" />
                <Path d="M13.7 21C13.5 21.3 13.2 21.6 12.9 21.8C12.5 21.9 12.3 22 12 22C11.7 22 11.5 21.9 11.1 21.8C10.8 21.6 10.5 21.3 10.3 21" stroke="#2C7695" strokeWidth={1.8} strokeLinecap="round" />
              </Svg>
            </View>
            <Text style={{ ...TYPO.h3, color: '#64748B' }}>Belum ada notifikasi</Text>
            <Text style={{ ...TYPO.body, color: '#94A3B8', textAlign: 'center', marginTop: SPACING.xs }}>
              Notifikasi dari pengelola akan muncul di sini
            </Text>
          </View>
        ) : (
          Object.entries(grouped).map(([date, items]) => (
            <View key={date} style={{ marginBottom: SPACING.lg }}>
              <Text style={{ ...TYPO.small, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: SPACING.sm }}>
                {date}
              </Text>
              {items.map((n) => (
                <TouchableOpacity key={n.id} activeOpacity={0.8} onPress={() => { if (!n.is_read) handleMarkRead(n.id); }}>
                  <Card
                    variant={n.is_read ? 'glass' : 'elevated'}
                    style={{
                      opacity: n.is_read ? 0.65 : 1,
                      borderLeftWidth: n.is_read ? 0 : 3,
                      borderLeftColor: n.is_read ? 'transparent' : '#2C7695',
                    }}
                  >
                    <View style={{ flexDirection: 'row' }}>
                      <NotifIcon type={n.type} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                          <Text style={{ ...TYPO.bodyBold, color: '#1E293B', flex: 1 }}>{n.title}</Text>
                          {!n.is_read && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#2C7695', marginLeft: 8 }} />}
                        </View>
                        {n.body && <Text style={{ ...TYPO.caption, color: '#64748B', marginBottom: 4 }} numberOfLines={2}>{n.body}</Text>}
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={{ ...TYPO.small, color: '#94A3B8' }}>{formatRelativeTime(n.created_at)}</Text>
                          <Text style={{ ...TYPO.small, color: '#CBD5E1', marginHorizontal: 6 }}> · </Text>
                          <Text style={{ ...TYPO.small, color: '#94A3B8' }}>{MODULE_LABELS[n.module]}</Text>
                        </View>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
