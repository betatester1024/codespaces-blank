import "./globals.css";
import { Themes } from "@/lib/Themes";
import Link from "next/link";

import { Noto_Sans_Display, Noto_Sans_Mono, Raleway } from "next/font/google";
import { byId, ExternLink, GIcon } from "@/lib/utils";
import { Suspense } from "react";
import Loading from "./loading";
import { Metadata } from "next";
import GlobalClient from "./globalClient";

const NotoSansDisplay = Noto_Sans_Display({
  variable: "--font-nsd",
  subsets: ["latin"],
});

const NotoSansMono = Noto_Sans_Mono({
  variable: "--font-nsm",
  subsets: ["latin"],
});

const RFont = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"]
})

export const metadata: Metadata = {
  title: 'ProDSA Services Tools',
  description: 'Welcome to ProDSA Services.'
}

export default function RootLayout({children}: Readonly<{children:React.ReactNode}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.png"/>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        <meta name="description" content="Welcome to ProDSA Services."/>
        <meta property="og:type" content="website"/>
        <meta property="og:title" content="ProDSA Services Tools"/>
        <meta property="og:description" content="Welcome to ProDSA Services."/>
        <meta property="og:image" content="https://prodsa.vercel.app/icon.png"/>
      </head>
      <body className={`${NotoSansDisplay.variable} ${NotoSansMono.variable} ${RFont.variable} antialiased`}>
        <Suspense fallback={<Loading/>}>{
          <GlobalClient>{children}</GlobalClient>}
        </Suspense>
        <footer className={`${Themes.BLUE.textCls} p-3 flex gap-2 flex-wrap justify-center font-raleway`}>
          <Link prefetch={false} className="blue active flex items-baseline" href="/">ProDSA Services</Link>
          <Link prefetch={false} className="blue active" href="/estimator">Estimate pricing</Link> 
          <ExternLink className="green text active" href="//dsc.gg/order-now">Order ships from ProDSA Services today!</ExternLink>
          <span>Site design by <span className="green text">Jennifer Green</span></span>
        </footer>
      </body>
    </html>
  );
}
