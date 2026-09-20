import type { Metadata, Viewport } from "next";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Script from "next/script";
import PwaRegister from "@/components/PwaRegister";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    template: "%s | Jersey Spot",
    default: "Jersey Spot | Premium Quality Football Jerseys",
  },
  description: "Your premium destination for the finest imported football jerseys. Authentic designs, perfect fit, and all-day comfort for true fans.",
  keywords: ["football jerseys", "soccer jerseys", "premium jerseys", "custom jerseys", "Jersey Spot", "sports apparel"],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Jersey Spot",
  },
  openGraph: {
    title: "Jersey Spot | Premium Quality Football Jerseys",
    description: "Your premium destination for the finest imported football jerseys. Authentic designs, perfect fit, and all-day comfort for true fans.",
    url: "https://jerseyspot.online",
    siteName: "Jersey Spot",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="apple-touch-icon" href="/images/logo.jpg" />
        <Script 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4279196903220340" 
          strategy="lazyOnload" 
          crossOrigin="anonymous" 
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-C9NJR7SQDQ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-C9NJR7SQDQ');
          `}
        </Script>
      </head>
      <body suppressHydrationWarning>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "PLACEHOLDER_CLIENT_ID"}>
          {children}
          <PwaRegister />
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}