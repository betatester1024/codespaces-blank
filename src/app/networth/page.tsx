"use client";

import { Themes } from "@/lib/Themes";
import { Button, byId } from "@/lib/utils";
import { strawbCmd } from "@/shiplist/shiplist";

export default function Page() {

  async function processShiplist() {
    let tArea = byId("shiplistIn") as HTMLTextAreaElement;
    console.log(await strawbCmd({cmd:"ValueTotal", shiplist:tArea.value}))
  }

  return <div className="flex flex-col gap-1 m-3">
    <textarea id="shiplistIn"></textarea>
    <Button theme={Themes.BLUE} className="blue text hover active" onClick={()=>{processShiplist()}}>Process</Button>
  </div>
}