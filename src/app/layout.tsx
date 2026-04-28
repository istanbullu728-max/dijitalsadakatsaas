import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QR Sadakat",
  description: "Hızlı ve premium dijital sadakat sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
