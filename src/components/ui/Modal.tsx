import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  type ModalProps as RNModalProps,
} from 'react-native';
import { GLASS, RADIUS, TYPO, SPACING } from '@utils/theme';

interface ModalProps extends Omit<RNModalProps, 'children'> {
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
}

export function Modal({
  title,
  children,
  onClose,
  visible,
  ...props
}: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      {...props}
    >
      <Pressable
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
        }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.97)',
            borderTopLeftRadius: RADIUS.xxl,
            borderTopRightRadius: RADIUS.xxl,
            maxHeight: '65%',
            ...GLASS.shadow.lg,
          }}
          onPress={() => {}}
        >
          {/* Drag handle */}
          <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: '#CBD5E1',
              }}
            />
          </View>

          {title && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: SPACING.md,
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#F1F5F9',
              }}
            >
              <Text style={{ ...TYPO.h3, color: '#1E293B' }}>{title}</Text>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={12}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#F1F5F9',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#64748B', fontSize: 16, fontWeight: '600' }}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ padding: SPACING.md }}>{children}</View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
