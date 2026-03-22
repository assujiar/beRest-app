import { View, TextInput } from 'react-native';
import { GLASS, RADIUS, TYPO } from '@utils/theme';
import Svg, { Path, Circle } from 'react-native-svg';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = 'Cari...' }: SearchBarProps) {
  return (
    <View
      style={{
        backgroundColor: GLASS.card.background,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: GLASS.card.border,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        height: 46,
      }}
    >
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Circle cx={11} cy={11} r={8} stroke="#94A3B8" strokeWidth={2} />
        <Path d="M21 21L16.65 16.65" stroke="#94A3B8" strokeWidth={2} strokeLinecap="round" />
      </Svg>
      <TextInput
        style={{ flex: 1, marginLeft: 10, ...TYPO.body, color: '#1E293B' }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        returnKeyType="search"
      />
    </View>
  );
}
