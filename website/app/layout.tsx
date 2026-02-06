import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
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
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#6AE3FF',
          colorBackground: '#0B0E14',
          colorInputBackground: '#111621',
          colorInputText: '#E6EAF2',
        },
      }}
    >
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
