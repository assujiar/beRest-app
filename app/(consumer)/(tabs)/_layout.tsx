import { Tabs } from 'expo-router';
import { GLASS } from '@utils/theme';
import Svg, { Path, Circle } from 'react-native-svg';

function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.6 5.4 21 6 21H9M19 10L21 12M19 10V20C19 20.6 18.6 21 18 21H15M9 21C9 21 9 15 12 15C15 15 15 21 15 21M9 21H15" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BellIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8C18 6.4 17.4 4.9 16.2 3.8C15.1 2.6 13.6 2 12 2C10.4 2 8.9 2.6 7.8 3.8C6.6 4.9 6 6.4 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M13.7 21C13.5 21.3 13.2 21.6 12.9 21.8C12.5 21.9 12.3 22 12 22C11.7 22 11.5 21.9 11.1 21.8C10.8 21.6 10.5 21.3 10.3 21" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ProfileIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={1.8} />
      <Path d="M5 20C5 17 8 14.5 12 14.5C16 14.5 19 17 19 20" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export default function ConsumerTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 68,
          paddingBottom: 10,
          paddingTop: 6,
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(226,232,240,0.6)',
          ...GLASS.shadow.sm,
        },
        tabBarActiveTintColor: '#156064',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <HomeIcon color={color} /> }} />
      <Tabs.Screen name="notifications" options={{ title: 'Notifikasi', tabBarIcon: ({ color }) => <BellIcon color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: ({ color }) => <ProfileIcon color={color} /> }} />
    </Tabs>
  );
}
