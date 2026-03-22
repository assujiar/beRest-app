import React from 'react';
import { View, type ViewProps, Platform } from 'react-native';
import { GLASS, RADIUS } from '@utils/theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'glass' | 'solid' | 'elevated' | 'outline';
  noPadding?: boolean;
}

const variantStyles = {
  glass: {
    backgroundColor: GLASS.card.background,
    borderWidth: 1,
    borderColor: GLASS.card.border,
    ...GLASS.shadow.sm,
  },
  solid: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...GLASS.shadow.sm,
  },
  elevated: {
    backgroundColor: GLASS.card.background,
    borderWidth: 1,
    borderColor: GLASS.card.border,
    ...GLASS.shadow.md,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
};

export function Card({
  children,
  className,
  variant = 'glass',
  noPadding = false,
  style,
  ...props
}: CardProps) {
  return (
    <View
      className={className}
      style={[
        {
          borderRadius: RADIUS.xl,
          marginBottom: 12,
          overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
          padding: noPadding ? 0 : 16,
          ...variantStyles[variant],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
