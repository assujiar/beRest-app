import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useRoleStore } from '@stores/role.store';
import { GLASS, RADIUS, TYPO } from '@utils/theme';

export function RoleSwitcher() {
  const { role, activeView, toggleView } = useRoleStore();

  if (role !== 'both') return null;

  function handleToggle() {
    toggleView();
    if (activeView === 'provider') {
      router.replace('/(consumer)/(tabs)');
    } else {
      router.replace('/(provider)/(tabs)');
    }
  }

  return (
    <TouchableOpacity
      onPress={handleToggle}
      activeOpacity={0.85}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: RADIUS.full,
        padding: 3,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
      }}
    >
      <View
        style={{
          borderRadius: RADIUS.full,
          paddingHorizontal: 14,
          paddingVertical: 7,
          ...(activeView === 'provider'
            ? { backgroundColor: '#FFFFFF', ...GLASS.shadow.sm }
            : {}),
        }}
      >
        <Text
          style={{
            ...TYPO.small,
            fontWeight: '700',
            color: activeView === 'provider' ? '#156064' : 'rgba(255,255,255,0.7)',
          }}
        >
          Pengelola
        </Text>
      </View>
      <View
        style={{
          borderRadius: RADIUS.full,
          paddingHorizontal: 14,
          paddingVertical: 7,
          ...(activeView === 'consumer'
            ? { backgroundColor: '#FFFFFF', ...GLASS.shadow.sm }
            : {}),
        }}
      >
        <Text
          style={{
            ...TYPO.small,
            fontWeight: '700',
            color: activeView === 'consumer' ? '#156064' : 'rgba(255,255,255,0.7)',
          }}
        >
          Pengguna
        </Text>
      </View>
    </TouchableOpacity>
  );
}
