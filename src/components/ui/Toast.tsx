import React, { useEffect, useRef } from 'react';
import { Text, TouchableOpacity, Animated, View } from 'react-native';
import { GLASS, RADIUS, TYPO } from '@utils/theme';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onDismiss: () => void;
  undoLabel?: string;
  onUndo?: () => void;
  duration?: number;
}

const typeConfig = {
  success: {
    bg: '#156064',
    icon: '✓',
    iconBg: 'rgba(255,255,255,0.2)',
  },
  error: {
    bg: '#DC2626',
    icon: '!',
    iconBg: 'rgba(255,255,255,0.2)',
  },
  info: {
    bg: '#2C7695',
    icon: 'i',
    iconBg: 'rgba(255,255,255,0.2)',
  },
};

export function Toast({
  message,
  type = 'success',
  onDismiss,
  undoLabel,
  onUndo,
  duration = 3000,
}: ToastProps) {
  const translateY = useRef(new Animated.Value(60)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const cfg = typeConfig[type];

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 15,
        stiffness: 150,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 60,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => onDismiss());
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
        backgroundColor: cfg.bg,
        borderRadius: RADIUS.lg,
        marginHorizontal: 16,
        marginBottom: 8,
        paddingVertical: 14,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        ...GLASS.shadow.md,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: cfg.iconBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>{cfg.icon}</Text>
      </View>
      <Text style={{ ...TYPO.bodyBold, color: '#FFFFFF', flex: 1 }}>{message}</Text>
      {undoLabel && onUndo && (
        <TouchableOpacity onPress={onUndo} hitSlop={8} style={{ marginLeft: 8 }}>
          <Text style={{ ...TYPO.captionBold, color: 'rgba(255,255,255,0.8)' }}>{undoLabel}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}
