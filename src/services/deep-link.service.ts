import * as Linking from "expo-linking";
import { router } from "expo-router";
import type { ModuleKey } from "@app-types/shared.types";

const APICK_HOST = "apick.id";

/** Map URL path prefix to module + route */
const ROUTE_MAP: Record<string, { module: ModuleKey; base: string }> = {
  lb: { module: "lapak", base: "/(consumer)/lapak" },
  gp: { module: "lapak", base: "/(consumer)/lapak" },
  bb: { module: "lapak", base: "/(consumer)/lapak" },
  wk: { module: "lapak", base: "/(consumer)/lapak" },
  kh: { module: "sewa", base: "/(consumer)/sewa" },
  rn: { module: "sewa", base: "/(consumer)/sewa" },
  rt: { module: "warga", base: "/(consumer)/warga" },
  ms: { module: "warga", base: "/(consumer)/warga" },
  hj: { module: "hajat", base: "/(consumer)/hajat" },
};

/** Parse an apick.id deep link URL */
export function parseDeepLink(url: string): {
  module: ModuleKey;
  prefix: string;
  code: string;
  subPath?: string;
} | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== APICK_HOST) return null;

    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length < 2) return null;

    const prefix = segments[0];
    const code = segments[1];
    const subPath = segments.length > 2 ? segments.slice(2).join("/") : undefined;

    const route = ROUTE_MAP[prefix];
    if (!route) return null;

    return { module: route.module, prefix, code, subPath };
  } catch {
    return null;
  }
}

/** Handle incoming deep link */
export function handleDeepLink(url: string): void {
  const parsed = parseDeepLink(url);
  if (!parsed) return;

  const route = ROUTE_MAP[parsed.prefix];
  if (!route) return;

  if (parsed.subPath) {
    router.push(`${route.base}/${parsed.code}/${parsed.subPath}`);
  } else {
    router.push(`${route.base}/${parsed.code}`);
  }
}

/** Setup deep link listener */
export function setupDeepLinkListener(): () => void {
  const subscription = Linking.addEventListener("url", ({ url }) => {
    handleDeepLink(url);
  });

  // Handle initial URL (app opened from deep link)
  Linking.getInitialURL().then((url) => {
    if (url) handleDeepLink(url);
  });

  return () => subscription.remove();
}

/** Generate an apick.id URL */
export function generateDeepLink(
  prefix: string,
  code: string,
  subPath?: string
): string {
  const base = `https://${APICK_HOST}/${prefix}/${code}`;
  return subPath ? `${base}/${subPath}` : base;
}
