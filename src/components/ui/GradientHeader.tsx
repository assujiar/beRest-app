/**
 * Gradient Header - Top section with gradient background
 * Used for screen headers with visual depth
 */
import React from 'react';
import { View, Text, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GRADIENTS, TYPO, SPACING, RADIUS } from '@utils/theme';

interface GradientHeaderProps {
  title?: string;
  subtitle?: string;
  gradient?: [string, string, ...string[]];
  children?: React.ReactNode;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  large?: boolean;
}

export function GradientHeader({
  title,
  subtitle,
  gradient,
  children,
  leftAction,
  rightAction,
  large = false,
}: GradientHeaderProps) {
  const insets = useSafeAreaInsets();
  const colors = gradient ?? GRADIENTS.primary;
  const topPad = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 8 : insets.top;

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        paddingTop: topPad,
        paddingBottom: large ? SPACING.xl : SPACING.md,
        paddingHorizontal: SPACING.md,
        borderBottomLeftRadius: large ? RADIUS.xxl : 0,
        borderBottomRightRadius: large ? RADIUS.xxl : 0,
      }}
    >
      {/* Nav bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: title ? 4 : 0 }}>
        {leftAction ?? <View style={{ width: 40 }} />}
        {!large && title ? (
          <Text style={{ ...TYPO.h3, color: '#FFFFFF', textAlign: 'center', flex: 1 }}>{title}</Text>
        ) : null}
        {rightAction ?? <View style={{ width: 40 }} />}
      </View>

      {/* Large title */}
      {large && title ? (
        <View style={{ marginTop: SPACING.sm }}>
          <Text style={{ ...TYPO.h1, color: '#FFFFFF' }}>{title}</Text>
          {subtitle ? (
            <Text style={{ ...TYPO.body, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{subtitle}</Text>
          ) : null}
        </View>
      ) : null}

      {children}
    </LinearGradient>
  );
}
