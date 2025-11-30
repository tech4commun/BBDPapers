import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ProfileChecker from "@/components/ProfileChecker";
import { ThemeProvider } from "@/components/ThemeProvider"; // The dark mode provider
import { Toaster } from "sonner"; // The notification system

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: "BBD Papers - College Resources Hub",
  description: "Access previous year question papers and topper notes instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-950 min-h-screen text-slate-200`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* 1. The Global Navigation */}
          <Navbar />

          {/* 2. The Onboarding Logic (Checks if user needs to fill profile) */}
          <ProfileChecker />

          {/* 3. The Main Page Content */}
          <main>{children}</main>

          {/* 4. The Toast Notification Container (Required for Upload/Auth messages) */}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}