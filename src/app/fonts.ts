import { Noto_Sans_Display, Noto_Sans_Mono } from "next/font/google";

const NotoSansDisplay = Noto_Sans_Display({
  variable: "--font-nsd",
  subsets: ["latin"],
});

const NotoSansMono = Noto_Sans_Mono({
  variable: "--font-nsm",
  subsets: ["latin"],
});

export {NotoSansDisplay, NotoSansMono};