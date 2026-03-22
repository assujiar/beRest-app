/**
 * Glassmorphism Card - Semi-transparent card with blur backdrop
 * Core UI primitive for the new design system
 */
import React from 'react';
import { View, type ViewProps, Platform } from 'react-native';
import { GLASS, RADIUS } from '@utils/theme';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'solid' | 'elevated';
  noPadding?: boolean;
}

export function GlassCard({
  children,
  className,
  variant = 'default',
  noPadding = false,
  style,
  ...props
}: GlassCardProps) {
  const padding = noPadding ? {} : { padding: 16 };

  const variantStyles = {
    default: {
      backgroundColor: GLASS.card.background,
      borderWidth: 1,
      borderColor: GLASS.card.border,
      ...GLASS.shadow.sm,
    },
    solid: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: GLASS.card.border,
      ...GLASS.shadow.sm,
    },
    elevated: {
      backgroundColor: GLASS.card.background,
      borderWidth: 1,
      borderColor: GLASS.card.border,
      ...GLASS.shadow.md,
    },
  };

  return (
    <View
      className={className}
      style={[
        {
          borderRadius: RADIUS.xl,
          marginBottom: 12,
          overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
          ...padding,
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
