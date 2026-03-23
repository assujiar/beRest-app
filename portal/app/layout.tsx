import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "apick - Life, well arranged",
  description: "1 app untuk kelola usaha, properti sewa, organisasi warga, dan hajatan. Simpel, gratis, dibuat untuk Indonesia.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-icon.png",
  },
  verification: {
    google: "337Hj8x-nMpHpnL_qCDtThGV6EIEOjwvU_fkCKq-dis",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
