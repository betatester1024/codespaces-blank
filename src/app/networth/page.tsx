"use client";

import { f } from "@/lib/formcreator";
import { Themes } from "@/lib/Themes";
import { Button, byId, GIcon, H1, Header, Loader} from "@/lib/utils";
import { strawbCmd } from "@/shiplist/shiplist";
import Image from "next/image";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";

export default function Page() {

  const [netWorth, setWorth] = useState<string>("Unknown");
  async function processShiplist() {
    let tArea = byId("shiplistIn") as HTMLTextAreaElement;
    setLoading(true);
    let resp = await fetch("/api/shipprocessing?cmd=ValueTotal", 
      {
        method:"POST", 
        body:tArea.value, 
        headers: {
          "Content-Type": "application/json",
        }
      })
      //await strawbCmd({cmd:"ValueTotal", shiplist:tArea.value});
    let ships = await resp.json();
    setLoading(false);
    // if (dat.status != "SUCCESS") {
    //   setWorth("Error.");
    //   return;
    // }

    // let ships = JSON.parse(dat.data.output);
    console.log(ships);
    setWorth(f(ships.value, 0));
    setEligible(ships.value < 5000);
    let eOut = [];
    for (let i=0; i<ships.shipData.length; i++) {
      let row = ships.shipData[i];
      eOut.push(<div key={i} className="flex gap-2 rounded-md p-3 border-1 grey text hover:bg-gray-200 transition-colors">
        <Image alt={"Ship ID "+row.hex_code} src={row.icon} height={100} width={100}/> 
        <div>
          <p className="text-lg"><b className="blue text">{row.name}</b> <span>{'{'}{row.hex_code}{'}'}</span></p>
          <p>Last loaded: {row.load_time}</p>
          <p className="text-lg">Value: <b className="blue text">{f(row.shipworth, 0)} flux</b> (#{f(row.placement, 0)})</p>
        </div>
      </div>)
    }
    setEntries(eOut);
  }

  const [loadingPending, setLoading] = useState<boolean>(false);
  const [eligibility, setEligible] = useState<boolean>(false);
  const [entries, setEntries] = useState<ReactNode>(<>None yet</>);
  return <div className="flex flex-col gap-1 m-3 font-raleway">
    <header className="slideIn font-raleway blue text">
      <div className="text-4xl">ProDSA <b>Net Worth Valuator</b></div>
      <p className="slideIn grey text">Thank you to <b className="blue slideIn text">@xendyos</b> for econ processing scripts. By Strawberry Web Services: Everything you could ever want. And prisms.</p>
    </header>
    <div className="flex gap-1 flex-wrap">
      <textarea id="shiplistIn" className="grey bgMain text" placeholder="Shiplist goes here..."></textarea>
      <Button theme={Themes.BLUE} className="grow shrink blue text hover active" onClick={()=>{processShiplist()}}>
        <Loader active={loadingPending} theme={Themes.GREY}/>
        Process
      </Button>
    </div>
    <div className="w-full mb-3 mt-3 text-2xl darkgrey text flex align-baseline gap-1.5">
      <GIcon theme={Themes.DARKGREY}>arrow_right</GIcon>Your net worth is <b className="blue text">{netWorth}</b> flux.
    </div>
    {eligibility ? <div className="w-full darkgrey text text-lg">
      You may be eligible for the&nbsp;
      <Link href="/communitygiveback" className="blue text"><b>Low-Income and New Player discounts</b></Link> program!
      Click the link to learn more.
    </div>
    : <></>}
    <div className="flex flex-col gap-3">
      {entries}
    </div>
  </div>
}