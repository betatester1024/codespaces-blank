"use client";

import { f } from "@/lib/formcreator";
import { Themes } from "@/lib/Themes";
import { Button, byId, Loader} from "@/lib/utils";
import { strawbCmd } from "@/shiplist/shiplist";
import Image from "next/image";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";

export default function Page() {

  const [netWorth, setWorth] = useState<string>("Unknown");
  async function processShiplist() {
    let tArea = byId("shiplistIn") as HTMLTextAreaElement;
    setLoading(true);
    let dat = await strawbCmd({cmd:"ValueTotal", shiplist:tArea.value});
    setLoading(false);
    if (dat.status != "SUCCESS") {
      setWorth("Error.");
      return;
    }

    let ships = JSON.parse(dat.data.output);
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
          <p>Value: <b className="blue text">{f(row.shipworth, 0)} flux</b> (#{row.placement})</p>
        </div>
      </div>)
    }
    setEntries(eOut);
  }

  const [loadingPending, setLoading] = useState<boolean>(false);
  const [eligibility, setEligible] = useState<boolean>(false);
  const [entries, setEntries] = useState<ReactNode>(<>None yet</>);
  return <div className="flex flex-col gap-1 m-3 font-raleway">
    <div className="flex gap-1 flex-wrap">
      <textarea id="shiplistIn" className="grey bgMain" placeholder="Shiplist goes here..."></textarea>
      <Button theme={Themes.BLUE} className="grow shrink blue text hover active" onClick={()=>{processShiplist()}}>
        <Loader active={loadingPending} theme={Themes.GREY}/>
        Process
      </Button>
    </div>
    <p className="w-full m-3 text-2xl">Your net worth is <b className="blue text">{netWorth}</b> flux</p>
    {eligibility ? <div className="w-full grey text">
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