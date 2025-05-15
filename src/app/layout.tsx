import type { Metadata } from "next";
import { Noto_Sans_Display, Noto_Sans_Mono } from "next/font/google";
import "./globals.css";

const NotoSansDisplay = Noto_Sans_Display({
  variable: "--font-sans",
  subsets: ["latin"],
});

const NotoSansMono = Noto_Sans_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BetaOS ProDSA Tools",
  description: "Blueprint editor and valuator for BetaOS ProDSA, a subsidiary of BetaOS Services.",
  icons: "https://prodsatools.vercel.app/icon.png"
};

export default function RootLayout({children}: Readonly<{children:React.ReactNode}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.png"/>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      {children}
    </html>
  );
}
