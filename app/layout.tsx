import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import NavbarWrapper from "./components/NavbarWrapper";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WattSave AI",
  description: "AI Powered Energy Optimization",
  verification: {
    google: "4qaar-rDbvQyvQ3VDwbWs-mrwblm48xPTWF6J-6SdMs",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-gray-100">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-EDB4B63WDX"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-EDB4B63WDX');
          `}
        </Script>

        <NavbarWrapper />

        <main className="flex-1">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}