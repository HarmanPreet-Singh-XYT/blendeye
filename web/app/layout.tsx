import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BlendEye — The Writers' Room That Knows What Your Characters Know",
  description: "An interactive writers' room and cinematic pre-production canvas where you scrub the timeline and interrogate characters bound to what they actually know.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

import { AuthProvider } from "@/lib/auth-context";
import { AuthDialog } from "@/components/cinema/auth-dialog";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider delay={200}>
          <AuthProvider>
            <Toaster>{children}</Toaster>
            <AuthDialog />
          </AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
