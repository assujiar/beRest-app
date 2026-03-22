import { View, Text } from 'react-native';
import { Button } from '@components/ui/Button';
import { TYPO, SPACING } from '@utils/theme';

interface EmptyStateProps {
  illustration?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  illustration = '📋',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.xxl }}>
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: '#E0F4F4',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: SPACING.lg,
        }}
      >
        <Text style={{ fontSize: 36 }}>{illustration}</Text>
      </View>
      <Text style={{ ...TYPO.h3, color: '#1E293B', textAlign: 'center', marginBottom: SPACING.sm }}>
        {title}
      </Text>
      {description && (
        <Text style={{ ...TYPO.body, color: '#94A3B8', textAlign: 'center', marginBottom: SPACING.lg }}>
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
