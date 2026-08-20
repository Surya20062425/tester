import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gamepad Tester & Debugger — Browser Diagnostic Tool",
  description: "Zero-install browser-based gamepad tester. Detect controllers, test buttons, axes, analog sticks, vibration, and diagnose stick drift using the HTML5 Gamepad API.",
  keywords: ["gamepad tester", "controller tester", "browser gamepad", "HTML5 Gamepad API", "stick drift", "vibration test", "Xbox", "PlayStation", "Nintendo", "PC gaming"],
  authors: [{ name: "Gamepad Tester" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Gamepad Tester & Debugger",
    description: "Zero-install browser tool to test and debug gamepads, controllers, joysticks, and racing wheels.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gamepad Tester & Debugger",
    description: "Zero-install browser tool to test and debug gamepads and controllers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
