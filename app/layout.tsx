import type { Metadata } from "next";
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
      <body>
        {children}
      </body>
    </html>
  );
}