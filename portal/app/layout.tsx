import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apick - Life, well arranged",
  description: "Platform pengelolaan warga, usaha, sewa, dan hajatan",
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
