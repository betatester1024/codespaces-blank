"use client";

import { Themes } from "@/lib/Themes";
import { Button, byId, Header } from "@/lib/utils";
import Image from "next/image";
import "@/app/page.css";
import Link from "next/link";
import constr from "../../public/construction.png";
import insure from "../../public/insurance.png";
import design from "../../public/design.png";
import { useEffect } from "react";

export default function Page() {

  useEffect(()=>{
    byId((new URL(document.URL)).hash)?.scrollIntoView({
      block: "start",
      behavior: "smooth",
    });
  }, [])
  return <div className="flex-col gap-1 p-3 font-raleway">
    <title>Welcome | ProDSA Services</title>
    {/* <Header className="font-raleway blue text slideIn !text-4xl" 
      title={<>Welcome to <b>ProDSA Services</b></>} 
      subtitle={<>Trusted by the community since <b>2021</b></>}/> */}
    <header className="slideIn font-raleway blue text">
      <div className="text-4xl">Welcome to <b>ProDSA Services</b></div>
      <p className="slideIn grey text">Trusted by the community since <b>2021</b></p>
    </header>
    <hr className="grey text"/>
    <div className="slideIn">
      <p className="text-3xl grey text">How can we help you today?</p>
    </div>
    <div className="slideIn p-3 flex flex-wrap gap-3">
      <div className="slideIn grey text flex flex-col gap-1 card">
        <p className="slideIn blue text text-2xl">ProDSA PrecisionEdit <b>Construction</b> and <b>Repair</b></p>
        <p>Completing ships <b className="slideIn">faster</b> and <b className="slideIn">more efficiently</b></p>
        <div className="slideIn relative flex gap-2 max-md:flex-wrap items-center justify-center">
          <Image className="slideIn shrink min-w-[300px] max-h-[100px] lock-content" alt="An RCD builds a ship." src={constr}/>
          <div className="grey text mt-3">
            <ul>
              <li><b>&gt;300</b> ships built</li>
              <li>We <b>set fabs</b> and <b>place non-RCDables</b></li>
              <li><b>30-day defect guarantee</b> for all ProDSA construction</li>
              <li>Ships ready in as few as <b>30 minutes</b></li>
              <li>No more guesswork: ProDSA PrecisionEdit repairs only charge for <b>damage incurred</b></li>
              <li>Trusted by the community since <b>2021</b></li>
            </ul>
          </div>
        </div>
        <Button theme={Themes.GREEN} className="font-bold slideIn w-[fit-content] font-2xl green text hover active bgLight" onClick={()=>{window.open("https://dsc.gg/order-now")}}>
        Order a ship from ProDSA Services today!
        </Button>
        <Link prefetch={false} className="slideIn w-[fit-content] grey text rounded-sm p-1 hover active" href="/valuate">Estimate pricing before ordering</Link>
      </div>
      <div className="slideIn grey text flex flex-col gap-1 card">
        <p className="slideIn text-2xl blue text">ProDSA <b>Insurance</b></p>
        <p>Farm with <b>confidence</b> with the <b>first insurance provider</b> in Dredark</p>
        <div className="slideIn relative grow flex gap-1 items-start max-md:flex-wrap justify-center">
          <ul className="grey text mt-4">
            <li><b>5</b> repairs per month</li>
            <li><b>No-hassle repair</b> means no agonising over lost ships </li>
            <li>Affordable plans <b>scale</b> according to your needs</li>
            <li><b>Reduced pricing</b> for safe drivers </li>
          </ul>
          <Image alt="A ship is destroyed." className="slideIn max-h-[300px] lock-content" src={insure}/>
        </div>
        <Button theme={Themes.GREEN} className="slideIn font-bold w-[fit-content] font-2xl green text hover active bgLight" onClick={()=>{window.open("https://dsc.gg/order-now")}}>
        Order insurance from ProDSA Services today!
        </Button>
        <Link prefetch={false} className="slideIn w-[fit-content] blue rounded-sm p-1 hover active" href="/valuate?mode=insurance">Estimate insurance before ordering</Link>
      </div>
      <div className="slideIn grey text flex flex-col gap-1 card">
        <p className="slideIn text-2xl blue text">ProDSA <b>Blueprint Transcription</b></p>
        <p>Blurry images no more!</p>
        <div className="slideIn relative grow items-start flex gap-2 max-md:flex-wrap justify-center">
          <Image alt="A blurry image and a clear image." className="slideIn max-h-[300px] lock-content" width={300} height={400}/>
          <ul className="grey text">
            <li><b>Hourly rates</b> scale according to ship complexity</li>
            <li>Accurate conversion of images to blueprint</li>
            <li>Test ship provided including <b>non-RCDables</b></li>
            <li>Construction from image available!</li>
          </ul>
        </div>
        <Button theme={Themes.GREEN} className="slideIn font-bold w-[fit-content] font-2xl green text hover active bgLight" onClick={()=>{window.open("https://dsc.gg/order-now")}}>
        Convert images to blueprints!
        </Button>
      </div>
      <div className="slideIn grey text flex flex-col gap-1 card">
        <p className="slideIn text-2xl blue text">ProDSA <b>Designs</b> and <b>Upgrades</b></p>
        <p><b>Custom designs</b>: Your needs, your specifications</p>
        <div className="slideIn relative grow items-start flex gap-2 max-md:flex-wrap justify-center">
          <Image alt="A blueprint of a ship." className="slideIn max-h-[300px] lock-content" src={design}/>
          <ul className="grey text">
            <li><b>Hourly rates</b> scale according to ship complexity</li>
            <li>Experienced ProDSA Designers have <b>4 years of flux tech experience</b></li>
            <li>Licensing options allow <b>resale</b> and redistribution</li>
            <li>We also work to upgrade <b>existing ships</b> - contact us!</li>
          </ul>
        </div>
        <Button theme={Themes.GREEN} className="slideIn font-bold w-[fit-content] font-2xl green text hover active bgLight" onClick={()=>{window.open("https://dsc.gg/order-now")}}>
        Order designs from ProDSA Services today!
        </Button>
      </div>
      
      <div className="slideIn grey text flex flex-col gap-1 card">
        <p className="slideIn text-2xl blue text">Other ProDSA Services</p>
        <p><b>More services available on request!</b></p>
        <div className="slideIn relative grow items-start flex gap-2 max-md:flex-wrap justify-center">
          <Image alt="Other ProDSA services." className="slideIn max-h-[300px] lock-content" src={null}/>
          <ul className="grey text">
            <li>Ship painting: Solid colour; patterns; custom images: <Link prefetch={false} href="/rates#othercosts">See rates</Link></li>
            <li>Ship refills: available on request</li>
            <li>Loans: available on request</li>
          </ul>
        </div>
        <Button theme={Themes.GREEN} className="slideIn font-bold w-[fit-content] font-2xl green text hover active bgLight" onClick={()=>{window.open("https://dsc.gg/order-now")}}>
        Contact us to order!
        </Button>
      </div>
    </div>
  </div>
}