import React, { useEffect, useRef } from 'react';
import { Animated, View, type ViewProps } from 'react-native';
import { RADIUS } from '@utils/theme';

interface SkeletonProps extends ViewProps {
  width?: number | string;
  height?: number;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

const roundedMap = {
  sm: RADIUS.sm,
  md: RADIUS.md,
  lg: RADIUS.lg,
  full: RADIUS.full,
};

export function Skeleton({
  width,
  height = 20,
  rounded = 'md',
  style,
  ...props
}: SkeletonProps) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  return (
    <View
      style={[
        {
          width: width as number | undefined,
          height,
          borderRadius: roundedMap[rounded],
          overflow: 'hidden',
          backgroundColor: '#E2E8F0',
        },
        style,
      ]}
      {...props}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: '#F1F5F9',
          opacity,
        }}
      />
    </View>
  );
}
