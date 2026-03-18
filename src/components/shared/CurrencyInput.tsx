import { useState } from "react";
import { View, TextInput, Text } from "react-native";

interface CurrencyInputProps {
  label?: string;
  value: number;
  onChangeValue: (value: number) => void;
  error?: string;
  placeholder?: string;
}

function formatDisplay(num: number): string {
  if (num === 0) return "";
  return num.toLocaleString("id-ID");
}

export function CurrencyInput({
  label,
  value,
  onChangeValue,
  error,
  placeholder = "contoh: 50.000",
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState(
    value > 0 ? formatDisplay(value) : ""
  );
  const [isFocused, setIsFocused] = useState(false);

  function handleChange(text: string) {
    const digits = text.replace(/\D/g, "");
    const num = digits ? parseInt(digits, 10) : 0;
    setDisplayValue(digits ? formatDisplay(num) : "");
    onChangeValue(num);
  }

  return (
    <View className="w-full">
      {label && (
        <Text className="text-sm font-medium text-dark-text mb-1.5">
          {label}
        </Text>
      )}
      <View
        className={`
          flex-row items-center h-[52px] rounded-lg border px-4
          ${error ? "border-red-500" : isFocused ? "border-navy" : "border-border-color"}
        `}
      >
        <Text className="text-sm text-grey-text mr-2">Rp</Text>
        <TextInput
          className="flex-1 text-base text-dark-text font-bold"
          keyboardType="numeric"
          value={displayValue}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
      {error && (
        <Text className="text-xs text-red-500 mt-1">{error}</Text>
      )}
    </View>
  );
}
