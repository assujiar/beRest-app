import { useState } from "react";
import {
  View,
  TextInput,
  Text,
  type TextInputProps,
} from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({
  label,
  error,
  hint,
  style,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="w-full">
      {label && (
        <Text className="text-sm font-medium text-dark-text mb-1.5">
          {label}
        </Text>
      )}
      <TextInput
        className={`
          h-[52px] rounded-lg border px-4 text-base text-dark-text
          ${error ? "border-red-500" : isFocused ? "border-navy" : "border-border-color"}
        `}
        placeholderTextColor="#94A3B8"
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        style={style}
        {...props}
      />
      {error && (
        <Text className="text-xs text-red-500 mt-1">{error}</Text>
      )}
      {hint && !error && (
        <Text className="text-xs text-grey-text mt-1">{hint}</Text>
      )}
    </View>
  );
}
