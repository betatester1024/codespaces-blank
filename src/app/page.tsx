'use client';
// /<reference path="@/lib/utils.tsx"/>
import {Button, Themes, byId, Lister, KeyedTable, Loader} from "@/lib/utils"
import { useState, ReactNode } from "react";
import { getCostSummary, BoMEntry } from "@/lib/bpprocessing";

// const { decode, encode } = require("dsabp-js")
// const dsabp = require("dsabp-js")
// const dsabp = require("@/lib/dsabp");

export default function Page() {
  const [inBlueprint, setInBlueprint] = useState<string>("");
  const [resState, setResState] = useState<KeyedTable>([]);
  const [processError, setProcessError] = useState<string>();
  const [resLoading, setResLoading] = useState<boolean>(false);

  async function process(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let tArea = (event.target as HTMLFormElement).querySelector("textarea")!;
    setResLoading(true);
    let summary : BoMEntry[] = JSON.parse(await getCostSummary(tArea.value));
    setResLoading(false);
    let formatted = [];
    for (let entry of summary) {
      formatted.push({key:entry.link, eles:[
        <img className="w-[2.5rem]" src={"https://test.drednot.io/img/"+entry.link+".png"}></img>,
        <p>{entry.ct+""}</p>,
        <p>{entry.it}</p>
      ]});
    }
    if (summary.length > 0) {
      setResState(formatted);
      setProcessError(undefined);
    }
    else {
      setResState([{
        key:0,
        eles:[
          <p className={Themes.RED.textCls}>Blueprint processing error.</p>
        ]
      }]);
      setProcessError("Blueprint processing error.");
    }
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
    <form className="w-full flex gap-1 flex-wrap" onSubmit={process}>
      <textarea id="inBlueprint" defaultValue={inBlueprint} className="bg-gray-200 grow-4 rounded-sm" 
      onChange={(e) => setInBlueprint(e.target.value)}>
      </textarea>
      <Button theme={Themes.GREY} className="flex basis-[min-content] items-center" type="submit">
        <Loader theme={Themes.GREY} active={resLoading}></Loader>
        <span>Process</span>
      </Button> 
      <Button theme={Themes.BLUE} onClick={fillTemplateBP} className="">Load test blueprint</Button>
      {/* <a href="/testbp.txt" className="text-blue-400 active:text-blue-200 cursor-pointer hover:text-blue-300" target="_blank">access test blueprint</a> */}
    </form>
    <div className={"w-full flex-col gap-1 "} >
      <div className="w-full flex justify-center">
        <p className="text-blue-500 text-lg">Blueprint scanner results:</p>
      </div>
      <div id="resArea">
        <Lister 
          theme={processError ? Themes.RED : Themes.BLUE} 
          className_c="p-2"
          colLayout={processError ? "1fr" : "1fr 1fr 9fr"}>{resState}</Lister>
      </div>
    </div>
  </>)
}


