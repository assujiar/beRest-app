import { View, Text } from "react-native";
import { Button } from "@components/ui/Button";

interface EmptyStateProps {
  illustration?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  illustration = "📋",
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <Text className="text-6xl mb-4">{illustration}</Text>
      <Text className="text-base font-bold text-dark-text text-center mb-2">
        {title}
      </Text>
      {description && (
        <Text className="text-sm text-grey-text text-center mb-6">
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          fullWidth={false}
          style={{ paddingHorizontal: 32 }}
        />
      )}
    </View>
  );
}
