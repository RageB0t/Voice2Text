import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vanta Dictate - Speak. It types. Everywhere.",
  description: "Premium speech-to-text dictation for people who type all day. Private, accurate, effortless.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
