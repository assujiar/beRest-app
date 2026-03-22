/**
 * Flat vector SVG icons for each module
 * Replaces emoji icons with clean, modern SVGs
 */
import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENTS, RADIUS } from '@utils/theme';
import { COLORS } from '@utils/colors';
import type { ModuleKey } from '@app-types/shared.types';

interface ModuleIconProps {
  module: ModuleKey;
  size?: number;
  withBackground?: boolean;
  color?: string;
}

function LapakIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9L4.5 4.5C4.7 3.9 5.3 3.5 5.9 3.5H18.1C18.7 3.5 19.3 3.9 19.5 4.5L21 9"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M3 9V19C3 19.6 3.4 20 4 20H20C20.6 20 21 19.6 21 19V9"
        stroke={color}
        strokeWidth={1.8}
      />
      <Path d="M3 9H21" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path
        d="M9 20V14H15V20"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SewaIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 21H21"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M5 21V7L12 3L19 7V21"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Rect x={8} y={10} width={3} height={4} rx={0.5} stroke={color} strokeWidth={1.5} />
      <Rect x={13} y={10} width={3} height={4} rx={0.5} stroke={color} strokeWidth={1.5} />
      <Path d="M10 21V17H14V21" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function WargaIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={3.5} stroke={color} strokeWidth={1.8} />
      <Path
        d="M5.5 19.5C5.5 16.5 8.5 14 12 14C15.5 14 18.5 16.5 18.5 19.5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Circle cx={19} cy={9} r={2.5} stroke={color} strokeWidth={1.5} />
      <Path
        d="M20 14.5C21.5 15.2 22.5 16.5 22.5 18"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Circle cx={5} cy={9} r={2.5} stroke={color} strokeWidth={1.5} />
      <Path
        d="M4 14.5C2.5 15.2 1.5 16.5 1.5 18"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function HajatIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 8C4 5.8 5.8 4 8 4H16C18.2 4 20 5.8 20 8V8H4V8Z"
        stroke={color}
        strokeWidth={1.8}
      />
      <Path d="M4 8H20V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18V8Z" stroke={color} strokeWidth={1.8} />
      <Path d="M12 4V2" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M8 12L11 15L16 10" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const ICON_MAP: Record<ModuleKey, React.FC<{ size: number; color: string }>> = {
  lapak: LapakIcon,
  sewa: SewaIcon,
  warga: WargaIcon,
  hajat: HajatIcon,
};

export function ModuleIcon({ module, size = 24, withBackground = false, color }: ModuleIconProps) {
  const IconComponent = ICON_MAP[module];
  const iconColor = color ?? COLORS[module];

  if (!withBackground) {
    return <IconComponent size={size} color={iconColor} />;
  }

  const gradients = GRADIENTS[`${module}Light`];
  const bgSize = size * 1.8;

  return (
    <View style={{ width: bgSize, height: bgSize, borderRadius: RADIUS.lg, overflow: 'hidden' }}>
      <LinearGradient
        colors={gradients}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconComponent size={size} color={iconColor} />
      </LinearGradient>
    </View>
  );
}
