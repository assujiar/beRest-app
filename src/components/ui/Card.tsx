import { View, type ViewProps } from "react-native";

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <View
      className={`bg-white rounded-xl shadow-sm p-4 mb-3 ${className ?? ""}`}
      {...props}
    >
      {children}
    </View>
  );
}
