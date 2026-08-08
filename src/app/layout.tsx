import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ModForge AI — Instant Minecraft Mods from Text",
  description:
    "Create advanced Minecraft Resource Packs & Behavior Packs instantly with AI. No coding, no modelling, no texturing required. Just describe and generate.",
  keywords: ["minecraft", "mod", "ai", "resource pack", "behavior pack", "mcaddon"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <AppProvider>
          <TopNav />
          <main className="flex-1 pb-24 pt-16 overflow-y-auto">{children}</main>
          <BottomNav />
        </AppProvider>
      </body>
    </html>
  );
}
