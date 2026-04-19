import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavWrapper from "@/components/nav-wrapper";
import TextSelectionPopup from "@/components/text-selection-popup";
import ThemeProvider from "@/components/theme-provider";
import KeyboardShortcuts from "@/components/keyboard-shortcuts";
import ServiceWorkerRegister from "@/components/sw-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NASM Study — Pass Your CPT Exam",
  description:
    "Personalized study plans, smart flashcards, and practice quizzes for the NASM Certified Personal Trainer exam.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NASM Study",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'dark';
                  document.documentElement.classList.remove('dark', 'light');
                  document.documentElement.classList.add(theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col pb-16 bg-gradient-to-b from-gray-950 via-gray-950 to-gray-900">
        <ThemeProvider>
          {children}
          <NavWrapper />
          <TextSelectionPopup />
          <KeyboardShortcuts />
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
