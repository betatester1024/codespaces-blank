"use client";

import { byId } from "@/lib/utils";
import { ReactNode, useEffect } from "react";

export default function GlobalClient(props:{children:ReactNode}) {
  useEffect(()=>{
    console.log("scrolling!");
    console.log();
    byId((new URL(document.URL)).hash.slice(1))?.scrollIntoView({
      block: "start",
      behavior: "smooth",
    });
  }, [])
  return <>{props.children}</>
}