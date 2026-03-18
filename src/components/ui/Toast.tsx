import { useEffect } from "react";
import { Text, TouchableOpacity, Animated } from "react-native";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onDismiss: () => void;
  undoLabel?: string;
  onUndo?: () => void;
  duration?: number;
}

export function Toast({
  message,
  type = "success",
  onDismiss,
  undoLabel,
  onUndo,
  duration = 3000,
}: ToastProps) {
  const opacity = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => onDismiss());
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss, opacity]);

  const bgColor =
    type === "error"
      ? "bg-red-800"
      : type === "info"
        ? "bg-navy"
        : "bg-gray-800";

  return (
    <Animated.View
      style={{ opacity }}
      className={`${bgColor} rounded-lg mx-4 mb-2 px-4 py-3 flex-row items-center justify-between`}
    >
      <Text className="text-white text-sm flex-1 mr-2">{message}</Text>
      {undoLabel && onUndo && (
        <TouchableOpacity onPress={onUndo} hitSlop={8}>
          <Text className="text-orange font-bold text-sm">{undoLabel}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}
