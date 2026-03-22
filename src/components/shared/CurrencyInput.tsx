import { useState } from 'react';
import { View, TextInput, Text } from 'react-native';
import { GLASS, RADIUS, TYPO } from '@utils/theme';

interface CurrencyInputProps {
  label?: string;
  value: number;
  onChangeValue: (value: number) => void;
  error?: string;
  placeholder?: string;
}

function formatDisplay(num: number): string {
  if (num === 0) return '';
  return num.toLocaleString('id-ID');
}

export function CurrencyInput({
  label,
  value,
  onChangeValue,
  error,
  placeholder = 'contoh: 50.000',
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState(value > 0 ? formatDisplay(value) : '');
  const [isFocused, setIsFocused] = useState(false);

  function handleChange(text: string) {
    const digits = text.replace(/\D/g, '');
    const num = digits ? parseInt(digits, 10) : 0;
    setDisplayValue(digits ? formatDisplay(num) : '');
    onChangeValue(num);
  }

  const borderColor = error ? '#EF4444' : isFocused ? '#2C7695' : GLASS.card.border;

  return (
    <View style={{ width: '100%' }}>
      {label && (
        <Text style={{ ...TYPO.captionBold, color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 52,
          borderRadius: RADIUS.lg,
          borderWidth: 1.5,
          borderColor,
          backgroundColor: isFocused ? 'rgba(255,255,255,0.95)' : GLASS.card.background,
          paddingHorizontal: 16,
          ...(isFocused ? { shadowColor: '#2C7695', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 2 } : {}),
        }}
      >
        <View style={{ backgroundColor: '#F1F5F9', borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 4, marginRight: 10 }}>
          <Text style={{ ...TYPO.captionBold, color: '#64748B' }}>Rp</Text>
        </View>
        <TextInput
          style={{ flex: 1, ...TYPO.bodyBold, color: '#1E293B', height: '100%' }}
          keyboardType="numeric"
          value={displayValue}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
      {error && <Text style={{ ...TYPO.caption, color: '#EF4444', marginTop: 4 }}>{error}</Text>}
    </View>
  );
}
