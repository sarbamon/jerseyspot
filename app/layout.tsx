import type { Metadata } from "next";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Jersey Spot",
    default: "Jersey Spot | Premium Quality Football Jerseys",
  },
  description: "Your premium destination for the finest imported football jerseys. Authentic designs, perfect fit, and all-day comfort for true fans.",
  keywords: ["football jerseys", "soccer jerseys", "premium jerseys", "custom jerseys", "Jersey Spot", "sports apparel"],
  openGraph: {
    title: "Jersey Spot | Premium Quality Football Jerseys",
    description: "Your premium destination for the finest imported football jerseys. Authentic designs, perfect fit, and all-day comfort for true fans.",
    url: "https://jerseyspot.com",
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
    <html lang="en">
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4279196903220340" crossOrigin="anonymous"></script>
        <meta name="monetag" content="6ae7211cb17b45b181a49b2a4719db2e" />
      </head>
      <body suppressHydrationWarning>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "PLACEHOLDER_CLIENT_ID"}>
          {children}
        </GoogleOAuthProvider>
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').then(function(registration) {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
              }, function(err) {
                console.log('ServiceWorker registration failed: ', err);
              });
            });
          }
        `}} />
      </body>
    </html>
  );
}