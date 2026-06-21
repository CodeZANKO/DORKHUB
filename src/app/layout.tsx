import type { Metadata } from "next";
import { 
  Fira_Code, 
  Oxanium, 
  IBM_Plex_Mono, 
  JetBrains_Mono 
} from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import AnalyticsTracker from "@/components/AnalyticsTracker";

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/favicon.ico?v=3', sizes: 'any' },
      { url: '/favicon.svg?v=3', type: 'image/svg+xml' }
    ],
    apple: '/icon.png?v=3',
  },
  title: "DorkHub | The OSINT & Google Dork Platform",
  description: "A centralized, community-driven platform for indexing, searching, and sharing Google Dorks and OSINT search queries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${firaCode.variable} ${oxanium.variable} ${ibmPlexMono.variable} ${jetbrainsMono.variable} antialiased`}>
        <AnalyticsTracker />
        {children}
        <Toaster position="bottom-right" theme="dark" closeButton richColors />
      </body>
    </html>
  );
}
