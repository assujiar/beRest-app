import { View, Text } from "react-native";

type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: "bg-green-100", text: "text-green-700" },
  error: { bg: "bg-red-100", text: "text-red-700" },
  warning: { bg: "bg-yellow-100", text: "text-yellow-700" },
  info: { bg: "bg-blue-100", text: "text-blue-700" },
  neutral: { bg: "bg-gray-100", text: "text-gray-700" },
};

export function Badge({ label, variant = "neutral" }: BadgeProps) {
  const styles = variantStyles[variant];

  return (
    <View className={`${styles.bg} rounded-full px-3 py-1`}>
      <Text className={`${styles.text} text-xs font-bold`}>{label}</Text>
    </View>
  );
}
