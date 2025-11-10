import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap', // Add font-display: swap for better performance
  preload: true,
});

export const metadata: Metadata = {
  title: "NSTU Mechatronics Club",
  description: "Official website of NSTU Mechatronics Club - Where Innovation Meets Engineering Excellence",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: '#0a0a0a',
  // Add performance-related meta tags
  other: {
    'color-scheme': 'dark',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Preconnect to improve loading performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS prefetch for Firebase */}
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
      </head>
      <body className={`${inter.variable} antialiased bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 min-h-screen`}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
