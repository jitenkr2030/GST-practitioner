import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyGSTDesk - GST Practitioner Dashboard",
  description: "Comprehensive GST management platform for tax practitioners and businesses",
  keywords: ["GST", "Tax Practitioner", "GST Returns", "GST Registration", "India Tax"],
  authors: [{ name: "MyGSTDesk Team" }],
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "MyGSTDesk - GST Practitioner Dashboard",
    description: "Comprehensive GST management platform for tax practitioners and businesses",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyGSTDesk - GST Practitioner Dashboard",
    description: "Comprehensive GST management platform for tax practitioners and businesses",
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
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
