import { Tabs } from 'expo-router';
import { useModulesStore } from '@stores/modules.store';
import { MODULE_COLORS, MODULE_LABELS } from '@utils/colors';
import { ModuleIcon } from '@components/ui/ModuleIcon';
import { GLASS } from '@utils/theme';
import Svg, { Path, Circle } from 'react-native-svg';

function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.6 5.4 21 6 21H9M19 10L21 12M19 10V20C19 20.6 18.6 21 18 21H15M9 21C9 21 9 15 12 15C15 15 15 21 15 21M9 21H15" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
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

function TabModuleIcon({ module, color }: { module: string; color: string }) {
  return <ModuleIcon module={module as any} size={22} color={color} />;
}

export default function ProviderTabsLayout() {
  const activeModules = useModulesStore((s) => s.activeModules);

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
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="lapak"
        options={{
          title: MODULE_LABELS.lapak,
          tabBarActiveTintColor: MODULE_COLORS.lapak,
          tabBarIcon: ({ color }) => <TabModuleIcon module="lapak" color={color} />,
          href: activeModules.includes('lapak') ? '/(provider)/(tabs)/lapak' : null,
        }}
      />
      <Tabs.Screen
        name="sewa"
        options={{
          title: MODULE_LABELS.sewa,
          tabBarActiveTintColor: MODULE_COLORS.sewa,
          tabBarIcon: ({ color }) => <TabModuleIcon module="sewa" color={color} />,
          href: activeModules.includes('sewa') ? '/(provider)/(tabs)/sewa' : null,
        }}
      />
      <Tabs.Screen
        name="warga"
        options={{
          title: MODULE_LABELS.warga,
          tabBarActiveTintColor: MODULE_COLORS.warga,
          tabBarIcon: ({ color }) => <TabModuleIcon module="warga" color={color} />,
          href: activeModules.includes('warga') ? '/(provider)/(tabs)/warga' : null,
        }}
      />
      <Tabs.Screen
        name="hajat"
        options={{
          title: MODULE_LABELS.hajat,
          tabBarActiveTintColor: MODULE_COLORS.hajat,
          tabBarIcon: ({ color }) => <TabModuleIcon module="hajat" color={color} />,
          href: activeModules.includes('hajat') ? '/(provider)/(tabs)/hajat' : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <ProfileIcon color={color} />,
        }}
      />
    </Tabs>
  );
}
