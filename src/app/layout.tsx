import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { MainLayout } from "@/components/layout/main-layout";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { AIProvider } from "@/lib/ai/context";
import { DEFAULT_THEME_ID } from "@/lib/theme/registry";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TodoNex - Intelligent Task Management",
  description: "An intelligent task management platform powered by AI. Organize, prioritize, and complete your tasks with smart assistance.",
  keywords: ["task management", "productivity", "AI assistant", "task organization", "smart planning"],
  authors: [{ name: "TodoNex Team" }],
  creator: "TodoNex",
  publisher: "TodoNex",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000'),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      data-theme={DEFAULT_THEME_ID}
      className="h-full"
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TodoNex" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased h-full`}
      >
        <ThemeProvider>
          <AuthProvider>
            <AIProvider>
              <MainLayout>
                {children}
              </MainLayout>
            </AIProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
