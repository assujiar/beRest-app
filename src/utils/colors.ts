import type { ModuleKey } from "@app-types/shared.types";

export const COLORS = {
  navy: "#1B3A5C",
  orange: "#FF4600",
  lapak: "#10B981",
  sewa: "#3B82F6",
  warga: "#8B5CF6",
  hajat: "#EC4899",
  darkText: "#1E293B",
  greyText: "#64748B",
  lightBg: "#F8FAFC",
  border: "#E2E8F0",
  skeleton: "#F1F5F9",
  white: "#FFFFFF",
  red: "#EF4444",
  yellow: "#F59E0B",
  green: "#22C55E",
  whatsapp: "#25D366",
} as const;

export const MODULE_COLORS: Record<ModuleKey, string> = {
  lapak: COLORS.lapak,
  sewa: COLORS.sewa,
  warga: COLORS.warga,
  hajat: COLORS.hajat,
};

export const MODULE_LABELS: Record<ModuleKey, string> = {
  lapak: "Lapak",
  sewa: "Sewa",
  warga: "Warga",
  hajat: "Hajat",
};
