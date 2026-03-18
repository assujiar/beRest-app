import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from "react-native";

type ButtonVariant = "primary" | "secondary" | "destructive" | "whatsapp";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-orange shadow-sm",
  secondary: "bg-white border border-border-color",
  destructive: "bg-red-500",
  whatsapp: "bg-[#25D366]",
};

const variantTextStyles: Record<ButtonVariant, string> = {
  primary: "text-white text-base font-bold",
  secondary: "text-dark-text text-sm",
  destructive: "text-white text-sm",
  whatsapp: "text-white text-base font-bold",
};

const variantHeight: Record<ButtonVariant, string> = {
  primary: "h-14",
  secondary: "h-12",
  destructive: "h-12",
  whatsapp: "h-14",
};

export function Button({
  title,
  variant = "primary",
  loading = false,
  fullWidth = true,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={`
        ${variantStyles[variant]}
        ${variantHeight[variant]}
        ${fullWidth ? "w-full" : ""}
        rounded-xl items-center justify-center px-6
        ${isDisabled ? "opacity-50" : ""}
      `}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={style}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "secondary" ? "#1E293B" : "#FFFFFF"}
        />
      ) : (
        <Text className={variantTextStyles[variant]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
