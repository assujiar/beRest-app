import { View, Text, TextInput } from "react-native";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Cari...",
}: SearchBarProps) {
  return (
    <View className="bg-white rounded-lg border border-border-color flex-row items-center px-3 h-11">
      <Text className="text-grey-text mr-2">🔍</Text>
      <TextInput
        className="flex-1 text-sm text-dark-text"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        returnKeyType="search"
      />
    </View>
  );
}
