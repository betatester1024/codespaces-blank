'use client';
// /<reference path="@/lib/utils.tsx"/>
import {Button, Colour, byId} from "@/lib/utils"
import { useState } from "react";
import { getCostSummary } from "@/lib/bpprocessing";

// const { decode, encode } = require("dsabp-js")
// const dsabp = require("dsabp-js")
// const dsabp = require("@/lib/dsabp");

export default function Page() {
  const [inBlueprint, setInBlueprint] = useState<string>("");

  async function process(event:React.FormEvent<HTMLFormElement>) {
    // whoa there what the hell was that
    event.preventDefault();
    let tArea = (event.target as HTMLFormElement).querySelector("textarea")!;
    console.log("waiting.");
    console.log(await getCostSummary(tArea.value));
    console.log("done");
    // console.log(inBlueprint);
  }

  async function fillTemplateBP() {
    let tArea = byId("inBlueprint") as HTMLTextAreaElement;
    let rawDat = await fetch("/testbp.txt");
    let str = await rawDat.text();
    tArea.value = str;
  }
  return (
    <form className="w-full flex" onSubmit={process}>
      <textarea id="inBlueprint" className="bg-gray-200 grow" onChange={(e) => setInBlueprint(e.target.value)}></textarea>
      <Button baseClr={Colour.GREY} type="submit" className="active:bg-gray-300 bg-gray-100 cursor-pointer hover:bg-gray-200">Process</Button> 
      <Button baseClr={Colour.BLUE} onClick={fillTemplateBP} className="">Load test blueprint</Button>
      {/* <a href="/testbp.txt" className="text-blue-400 active:text-blue-200 cursor-pointer hover:text-blue-300" target="_blank">access test blueprint</a> */}
    </form>
  )
}
