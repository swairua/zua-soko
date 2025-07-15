import "./globals.css";
import { Inter } from "next/font/google";
import { PWAInstaller } from "@/components/PWAInstaller";
import { MobileInstallGuide } from "@/components/MobileInstallGuide";
import { ClientOnly } from "@/components/ClientOnly";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Zuasoko - Empowering Farmers",
  description:
    "AI-powered agri-tech platform connecting farmers directly to consumers",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Zuasoko",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#16a34a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#16a34a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Zuasoko" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#16a34a" />
        <meta name="msapplication-tap-highlight" content="no" />

        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icons/icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/icons/icon-512x512.png"
        />
      </head>
      <body className={inter.className}>
        {children}
        <ClientOnly>
          <PWAInstaller />
          <MobileInstallGuide />
        </ClientOnly>
      </body>
    </html>
  );
}
