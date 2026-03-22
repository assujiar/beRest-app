/**
 * Glassmorphism + Flat Vector Design System
 * Apick - "Life, well arranged."
 */

export const GLASS = {
  // Glass card backgrounds
  card: {
    background: 'rgba(255, 255, 255, 0.72)',
    backgroundDark: 'rgba(255, 255, 255, 0.55)',
    border: 'rgba(255, 255, 255, 0.35)',
    borderLight: 'rgba(255, 255, 255, 0.18)',
  },
  // Blur intensities
  blur: {
    light: 12,
    medium: 20,
    heavy: 40,
  },
  // Shadows for depth
  shadow: {
    sm: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    md: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 4,
    },
    lg: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 8,
    },
    glow: (color: string) => ({
      shadowColor: color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    }),
  },
} as const;

// Gradient color type for expo-linear-gradient
type GradientColors = [string, string, ...string[]];

// Gradient presets per module
export const GRADIENTS: Record<string, GradientColors> = {
  // Primary app gradient
  primary: ['#2C7695', '#156064'],
  primaryLight: ['#E0F4F4', '#F0FAFA'],

  // Module gradients
  lapak: ['#50BFC3', '#3DA8AC'],
  lapakLight: ['#E8FAFA', '#F0FDFD'],
  sewa: ['#00C49A', '#00A882'],
  sewaLight: ['#E6FBF5', '#F0FDF9'],
  warga: ['#FB8F67', '#E87A52'],
  wargaLight: ['#FFF0EB', '#FFF7F4'],
  hajat: ['#D95877', '#C44363'],
  hajatLight: ['#FDE8EE', '#FFF0F4'],

  // UI gradients
  card: ['rgba(255,255,255,0.85)', 'rgba(255,255,255,0.65)'],
  overlay: ['rgba(15,23,42,0)', 'rgba(15,23,42,0.6)'],
  hero: ['#0F2027', '#203A43', '#2C7695'],
  heroLight: ['#F8FAFC', '#E0F4F4', '#F0FAFA'],
};

// Spacing system (8pt grid)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Border radius
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
} as const;

// Typography
export const TYPO = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
  h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyBold: { fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  captionBold: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
  small: { fontSize: 11, fontWeight: '500' as const, lineHeight: 16 },
  money: { fontSize: 24, fontWeight: '800' as const, lineHeight: 32 },
} as const;
