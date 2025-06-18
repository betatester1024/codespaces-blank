"use client";

import { Themes } from "@/lib/Themes";
import { Button, byId, ExternLink, GIcon } from "@/lib/utils";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";

export default function GlobalClient(props:{children:ReactNode}) {
  useEffect(()=>{
    byId((new URL(document.URL)).hash.slice(1))?.scrollIntoView({
      block: "start",
      behavior: "smooth",
    });
  }, [])
  
  const [menuActive, setMenuActive] = useState<boolean>(false);
  return <>{props.children}
  <div id="menubar" className="grey text fixed right-3 top-3">
    <Button onClick={()=>{setMenuActive(!menuActive)}} theme={Themes.GREY}>
      <GIcon theme={Themes.GREY} className="text-2xl">menu</GIcon>
    </Button>
    <div className={`${menuActive ? "max-h-[100vh] p-3 border-2 shadow-lg" : "p-0 max-h-[0px]"} font-raleway flex flex-col gap-1 grey text w-[350px] overflow-hidden h-[fit-content] grey bgMain mt-1 rounded-md fixed right-0 transition-all`}>
      <p className="grey text slideIn text-xl">Welcome to <b className="blue text">ProDSA Services</b></p>
      <Link onClick={()=>{setMenuActive(false)}} href="/" prefetch={false}>ProDSA Services Home</Link>
      <Link onClick={()=>{setMenuActive(false)}} href="/communitygiveback" prefetch={false}>ProDSA LI/NP Discount Program</Link>
      <Link onClick={()=>{setMenuActive(false)}} href="/rates" prefetch={false}>ProDSA Rates</Link>
      <Link onClick={()=>{setMenuActive(false)}} href="/estimator" prefetch={false}>ProDSA Pricing and Insurance Estimator</Link>
      <Link onClick={()=>{setMenuActive(false)}} href="/editor" prefetch={false}>PrecisionEdit Blueprinting Tools</Link>
      <Link onClick={()=>{setMenuActive(false)}} href="/networth" prefetch={false}>Net Worth Calculator</Link>
      <ExternLink href="//dsc.gg/order-now" className="green text">Order from ProDSA Services now!</ExternLink>
    </div>
  </div>
  </>
}