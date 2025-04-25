'use client';
// /<reference path="@/lib/utils.tsx"/>
import {Button, Colour, byId, Lister} from "@/lib/utils"
import { useState, ReactNode } from "react";
import { getCostSummary, BoMEntry } from "@/lib/bpprocessing";

// const { decode, encode } = require("dsabp-js")
// const dsabp = require("dsabp-js")
// const dsabp = require("@/lib/dsabp");

export default function Page() {
  const [inBlueprint, setInBlueprint] = useState<string>("");
  const [resState, setResState] = useState<ReactNode[][]>([]);

  async function process(event:React.FormEvent<HTMLFormElement>) {
    // whoa there what the hell was that
    event.preventDefault();
    let tArea = (event.target as HTMLFormElement).querySelector("textarea")!;
    console.log("waiting.");
    let summary : BoMEntry[] = JSON.parse(await getCostSummary(tArea.value));
    let formatted = [];
    for (let entry of summary) {
      formatted.push([
        <img src={"https://test.drednot.io/img/"+entry.link+".png"}></img>,
        <p>{entry.ct+""}</p>,
        <p>{entry.it}</p>
      ])
    }
    setResState(formatted);
    console.log("done");
    // console.log(inBlueprint);
  }

  async function fillTemplateBP() {
    let tArea = byId("inBlueprint") as HTMLTextAreaElement;
    let rawDat = await fetch("/testbp.txt");
    let str = await rawDat.text();
    tArea.value = str;
  }

  return (<>
    <form className="w-full flex gap-1" onSubmit={process}>
      <textarea id="inBlueprint" className="bg-gray-200 grow" onChange={(e) => setInBlueprint(e.target.value)}></textarea>
      <Button baseClr={Colour.GREY} type="submit">Process</Button> 
      <Button baseClr={Colour.BLUE} onClick={fillTemplateBP} className="">Load test blueprint</Button>
      {/* <a href="/testbp.txt" className="text-blue-400 active:text-blue-200 cursor-pointer hover:text-blue-300" target="_blank">access test blueprint</a> */}
    </form>
    <div className="w-full flex-col gap-1">
      <div className="w-full">
        <b className="text-blue-600">Results</b>
      </div>
      <div id="resArea">
        hey!
        <Lister baseClr={Colour.BLUE} rows={resState}/>
      </div>
    </div>
  </>)
}


