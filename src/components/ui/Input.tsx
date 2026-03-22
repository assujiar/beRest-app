import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  Platform,
  type TextInputProps,
} from 'react-native';
import { GLASS, RADIUS, TYPO } from '@utils/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  hint,
  icon,
  style,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? '#EF4444'
    : isFocused
      ? '#2C7695'
      : GLASS.card.border;

  const bgColor = isFocused
    ? 'rgba(255,255,255,0.95)'
    : GLASS.card.background;

  return (
    <View style={{ width: '100%' }}>
      {label && (
        <Text
          style={{
            ...TYPO.captionBold,
            color: '#64748B',
            marginBottom: 6,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
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
          backgroundColor: bgColor,
          paddingHorizontal: 16,
          gap: 10,
          ...(isFocused && Platform.OS === 'ios' ? {
            shadowColor: '#2C7695',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
          } : {}),
        }}
      >
        {icon}
        <TextInput
          style={[
            {
              flex: 1,
              ...TYPO.body,
              color: '#1E293B',
              height: '100%',
            },
            style,
          ]}
          placeholderTextColor="#94A3B8"
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
      </View>
      {error && (
        <Text style={{ ...TYPO.caption, color: '#EF4444', marginTop: 4 }}>
          {error}
        </Text>
      )}
      {hint && !error && (
        <Text style={{ ...TYPO.caption, color: '#94A3B8', marginTop: 4 }}>
          {hint}
        </Text>
      )}
    </View>
  );
}
