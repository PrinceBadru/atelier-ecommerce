import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ChatPanel } from "@/components/assistant/ChatPanel";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Atelier — Considered Goods for Home & Living",
  description:
    "An artisanal, mindful collection of home and outdoor goods crafted with intention and enduring quality.",
  keywords: ["ecommerce", "design", "curated home", "outdoor", "sustainable living"],
  authors: [{ name: "Atelier Studio" }],
  openGraph: {
    title: "Atelier — Considered Goods for Home & Living",
    description: "An artisanal, mindful collection of home and outdoor goods.",
    type: "website",
    siteName: "Atelier",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-accent/20 selection:text-foreground">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <ChatPanel />
        </ThemeProvider>
      </body>
    </html>
  );
}
