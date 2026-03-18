import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  type ModalProps as RNModalProps,
} from "react-native";

interface ModalProps extends Omit<RNModalProps, "children"> {
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
        className="flex-1 justify-end bg-black/40"
        onPress={onClose}
      >
        <Pressable
          className="bg-white rounded-t-2xl max-h-[60%]"
          onPress={() => {}}
        >
          {/* Drag handle */}
          <View className="items-center pt-3 pb-2">
            <View className="w-10 h-1 rounded-full bg-gray-300" />
          </View>

          {title && (
            <View className="flex-row items-center justify-between px-4 pb-3 border-b border-border-color">
              <Text className="text-lg font-bold text-dark-text">
                {title}
              </Text>
              <TouchableOpacity onPress={onClose} hitSlop={12}>
                <Text className="text-grey-text text-base">Tutup</Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="p-4">{children}</View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
