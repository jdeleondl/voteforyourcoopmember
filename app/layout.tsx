import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "COOPINTEC 2025 - Sistema de Votación",
  description: "Sistema de confirmación de asistencia y votación para COOPINTEC 2025",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
