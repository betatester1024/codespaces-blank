"use client";

import { f } from "@/lib/formcreator";
import { Themes } from "@/lib/Themes";
import { Button, byId} from "@/lib/utils";
import { strawbCmd } from "@/shiplist/shiplist";
import { useEffect, useState } from "react";

export default function Page() {

  const [netWorth, setWorth] = useState<string>("Unknown");
  async function processShiplist() {
    let tArea = byId("shiplistIn") as HTMLTextAreaElement;
    let dat = await strawbCmd({cmd:"ValueTotal", shiplist:tArea.value});
    let ships = JSON.parse(dat.data.output);
    console.log(ships);
    setWorth(f(ships.value, 2));
  }

  return <div className="flex flex-col gap-1 m-3 font-raleway">
    <div className="flex gap-1 flex-wrap">
      <textarea id="shiplistIn" className="grey bgMain" placeholder="Shiplist goes here..."></textarea>
      <Button theme={Themes.BLUE} className="grow shrink blue text hover active" onClick={()=>{processShiplist()}}>Process</Button>
    </div>
    <b>Your net worth is {netWorth}</b>
  </div>
}