import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Cairo } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { I18nProvider, Language } from "../i18n";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "TawariApp - Healthcare at Your Fingertips",
  description: "Connect with licensed Egyptian doctors for video consultations. Get medical advice, prescriptions, and care from anywhere.",
};

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'ar' }]
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} antialiased`}
        suppressHydrationWarning
      >
        <I18nProvider locale={lang as Language}>
          {children}
        </I18nProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

