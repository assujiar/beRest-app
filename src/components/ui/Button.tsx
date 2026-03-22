import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENTS, GLASS, RADIUS, TYPO } from '@utils/theme';

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'whatsapp' | 'ghost';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: { height: 40, px: 16, text: TYPO.captionBold },
  md: { height: 48, px: 20, text: TYPO.bodyBold },
  lg: { height: 56, px: 24, text: { ...TYPO.bodyBold, fontSize: 16 } },
};

export function Button({
  title,
  variant = 'primary',
  loading = false,
  fullWidth = true,
  icon,
  size = 'lg',
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const cfg = sizeConfig[size];

  // Primary uses gradient
  if (variant === 'primary') {
    return (
      <TouchableOpacity
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[
          {
            width: fullWidth ? '100%' : undefined,
            borderRadius: RADIUS.lg,
            overflow: 'hidden',
            opacity: isDisabled ? 0.5 : 1,
            ...GLASS.shadow.glow('#156064'),
          },
          style,
        ]}
        {...props}
      >
        <LinearGradient
          colors={GRADIENTS.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            height: cfg.height,
            paddingHorizontal: cfg.px,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              {icon}
              <Text style={{ ...cfg.text, color: '#FFFFFF' }}>{title}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // WhatsApp uses gradient
  if (variant === 'whatsapp') {
    return (
      <TouchableOpacity
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[
          {
            width: fullWidth ? '100%' : undefined,
            borderRadius: RADIUS.lg,
            overflow: 'hidden',
            opacity: isDisabled ? 0.5 : 1,
            ...GLASS.shadow.glow('#25D366'),
          },
          style,
        ]}
        {...props}
      >
        <LinearGradient
          colors={['#25D366', '#128C7E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            height: cfg.height,
            paddingHorizontal: cfg.px,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              {icon}
              <Text style={{ ...cfg.text, color: '#FFFFFF' }}>{title}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Other variants
  const variantConfig = {
    secondary: {
      bg: GLASS.card.background,
      border: GLASS.card.border,
      textColor: '#1E293B',
      loaderColor: '#1E293B',
    },
    destructive: {
      bg: '#FEE2E2',
      border: '#FECACA',
      textColor: '#DC2626',
      loaderColor: '#DC2626',
    },
    ghost: {
      bg: 'transparent',
      border: 'transparent',
      textColor: '#2C7695',
      loaderColor: '#2C7695',
    },
  };

  const cfg2 = variantConfig[variant as keyof typeof variantConfig];

  return (
    <TouchableOpacity
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        {
          width: fullWidth ? '100%' : undefined,
          height: cfg.height,
          borderRadius: RADIUS.lg,
          backgroundColor: cfg2.bg,
          borderWidth: 1,
          borderColor: cfg2.border,
          paddingHorizontal: cfg.px,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={cfg2.loaderColor} />
      ) : (
        <>
          {icon}
          <Text style={{ ...cfg.text, color: cfg2.textColor }}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
