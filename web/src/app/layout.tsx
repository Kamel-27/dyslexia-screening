import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DysTest — Gamified Dyslexia Screening",
    template: "%s | DysTest",
  },
  description:
    "DysTest is a gamified, interactive dyslexia screening tool for children aged 7–17. Backed by research, it uses cognitive mini-games to identify reading difficulties early — no special hardware required.",
  keywords: [
    "dyslexia",
    "screening",
    "gamified test",
    "cognitive assessment",
    "reading difficulties",
    "children",
    "education",
    "dyslexia detection",
  ],
  authors: [{ name: "DysTest Research Team" }],
  openGraph: {
    title: "DysTest — Gamified Dyslexia Screening",
    description:
      "Interactive, research-backed dyslexia screening through gamified cognitive tasks for children aged 7–17.",
    type: "website",
    siteName: "DysTest",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
