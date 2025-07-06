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

// export const metadata: Metadata = {
//   title: {
//     template: '%s | ProDSA Services',
//     default: "Welcome to ProDSA Services." 
//   },
//   description: 'Welcome to ProDSA Services.'
// }

export default function RootLayout({children}: Readonly<{children:React.ReactNode}>) {
  process.env.NEXT_PUBLIC_BRANCH;
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.png"/>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        {/* <meta name="description" content="Welcome to ProDSA Services."/> */}
        <meta property="og:type" content="website"/>
        {/* <meta property="og:title" content="ProDSA Services Tools"/> */}
        {/* <meta property="og:description" content="Welcome to ProDSA Services."/> */}
        <meta property="og:image" content="https://prodsa.vercel.app/icon.png"/>
      </head>
      <body className={`${NotoSansDisplay.variable} ${NotoSansMono.variable} ${RFont.variable} antialiased`}>
        <Suspense fallback={<Loading/>}>{
          <div className="flex relative">
            <div className="grow z-1"><GlobalClient>{children}</GlobalClient></div>
            {process.env.NEXT_PUBLIC_BRANCH != "stable" ? <div className="sticky w-[fit-content] h-[100vh] bg-yellow-200/40 text-center top-0" style={{writingMode:"vertical-rl"}}>You are in the {process.env.NEXT_PUBLIC_BRANCH} branch! Changes are unstable and may break in weird ways! <ExternLink className="green text" href="//prodsa.vercel.app/">Switch to stable!</ExternLink></div> : <></>}
          </div>
        }
        </Suspense>
        
      </body>
    </html>
  );
}
