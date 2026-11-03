import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Cairo } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { I18nProvider, Language } from "../i18n";
import { ThemeProviderWrapper } from "../context/ThemeProviderWrapper";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "@/components/ui/toast";
import { AiTriageWidget } from "@/components/triage/AiTriageWidget";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "Tabibi - Healthcare at Your Fingertips",
    template: "%s | Tabibi",
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
    title: "Tabibi - Healthcare at Your Fingertips",
    description: siteConfig.description.en,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Tabibi - Telemedicine Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tabibi - Healthcare at Your Fingertips",
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
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
                <AiTriageWidget />
              </ToastProvider>
            </I18nProvider>
          </ThemeProviderWrapper>
        </AuthProvider>
        {process.env.NODE_ENV === "production" && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}
