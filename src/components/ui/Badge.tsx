import React from 'react';
import { View, Text } from 'react-native';
import { RADIUS, TYPO } from '@utils/theme';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  success: { bg: '#DCFCE7', text: '#15803D', dot: '#22C55E' },
  error: { bg: '#FEE2E2', text: '#DC2626', dot: '#EF4444' },
  warning: { bg: '#FEF3C7', text: '#B45309', dot: '#F59E0B' },
  info: { bg: '#E0F2FE', text: '#0369A1', dot: '#2C7695' },
  neutral: { bg: '#F1F5F9', text: '#64748B', dot: '#94A3B8' },
};

export function Badge({ label, variant = 'neutral', size = 'sm', dot = false }: BadgeProps) {
  const styles = variantStyles[variant];
  const isSmall = size === 'sm';

  return (
    <View
      style={{
        backgroundColor: styles.bg,
        borderRadius: RADIUS.full,
        paddingHorizontal: isSmall ? 10 : 14,
        paddingVertical: isSmall ? 4 : 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {dot && (
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: styles.dot,
          }}
        />
      )}
      <Text
        style={{
          ...(isSmall ? TYPO.small : TYPO.captionBold),
          color: styles.text,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
