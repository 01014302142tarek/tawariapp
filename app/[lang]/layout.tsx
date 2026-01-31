import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Cairo } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { I18nProvider, Language } from "../i18n";
import { ThemeProviderWrapper } from "../context/ThemeProviderWrapper";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "@/components/ui/toast";
import { OrganizationJsonLd, MedicalServiceJsonLd, WebsiteJsonLd, LocalBusinessJsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/lib/seo/config";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Only needed for code blocks, not critical for initial render
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
  preload: false, // Loaded on-demand when Arabic content is rendered
});

export const metadata: Metadata = {
  title: {
    default: "TawariApp - Healthcare at Your Fingertips",
    template: "%s | TawariApp",
  },
  description: siteConfig.description.en,
  keywords: siteConfig.keywords.en,
  authors: [{ name: siteConfig.creator }],
  creator: siteConfig.creator,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "TawariApp - Healthcare at Your Fingertips",
    description: siteConfig.description.en,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "TawariApp - Telemedicine Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TawariApp - Healthcare at Your Fingertips",
    description: siteConfig.description.en,
    site: siteConfig.twitterHandle,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add when available
    // google: "your-google-verification-code",
  },
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Structured Data */}
        <OrganizationJsonLd />
        <MedicalServiceJsonLd />
        <WebsiteJsonLd />
        <LocalBusinessJsonLd />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <ThemeProviderWrapper>
            <I18nProvider locale={lang as Language}>
              <ToastProvider>
                {children}
              </ToastProvider>
            </I18nProvider>
          </ThemeProviderWrapper>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
