import { useEffect, useRef } from "react";
import { Animated, View, type ViewProps } from "react-native";

interface SkeletonProps extends ViewProps {
  width?: number;
  height?: number;
  rounded?: "sm" | "md" | "lg" | "full";
}

const roundedMap = {
  sm: "rounded",
  md: "rounded-lg",
  lg: "rounded-xl",
  full: "rounded-full",
};

export function Skeleton({
  width,
  height = 20,
  rounded = "md",
  style,
  ...props
}: SkeletonProps) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View
      className={`${roundedMap[rounded]} overflow-hidden`}
      style={[{ width, height }, style]}
      {...props}
    >
      <Animated.View
        className="flex-1 bg-[#F1F5F9]"
        style={{ opacity }}
      />
    </View>
  );
}
