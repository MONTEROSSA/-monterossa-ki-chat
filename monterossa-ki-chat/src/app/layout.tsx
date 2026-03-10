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
  title: "Monterossa AG - KI-Chatbot für exzellenten Kundenservice",
  description: "Automatisieren Sie Ihre Kundenkommunikation mit unserer fortschrittlichen KI-Technologie. Schneller, effizienter und rund um die Uhr verfügbar.",
  keywords: ["Monterossa AG", "KI-Chatbot", "Kundenservice", "Automatisierung", "AI", "Chatbot", "Künstliche Intelligenz"],
  authors: [{ name: "Monterossa AG" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Monterossa AG - KI-Chatbot",
    description: "Ihr intelligenter KI-Chat für exzellenten Kundenservice",
    siteName: "Monterossa AG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Monterossa AG - KI-Chatbot",
    description: "Ihr intelligenter KI-Chat für exzellenten Kundenservice",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-monterossa-dark text-white`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
