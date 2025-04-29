'use client';
// /<reference path="@/lib/utils.tsx"/>
import {Button, Themes, byId, Lister, KeyedTable, Loader, Select, Option} from "@/lib/utils"
import { useState } from "react";
import { getCostSummary, BoMEntry, sortByItem } from "@/lib/bpprocessing";

// const { decode, encode } = require("dsabp-js")
// const dsabp = require("dsabp-js")
// const dsabp = require("@/lib/dsabp");

export default function Page() {
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

  async function sortBP(event:React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setResLoading(true);
    let tArea = byId("inBlueprint") as HTMLTextAreaElement;
    console.log("inBlueprint", tArea.value);
    let summary : BoMEntry[] = JSON.parse(await sortByItem(tArea.value));
    setResLoading(false);
    console.log(summary);
  }

  async function fillTemplateBP() {
    let tArea = byId("inBlueprint") as HTMLTextAreaElement;
    let rawDat = await fetch("/testbp.txt");
    let str = await rawDat.text();
    tArea.value = str;
  }

  return (<>
    <form className="w-full flex gap-1 flex-wrap" onSubmit={process}>
      <textarea id="inBlueprint" className="bg-gray-200 grow-4 rounded-sm">
      </textarea>
      <Button theme={Themes.GREY} className="basis-[min-content]" type="submit">
        <Loader theme={Themes.GREY} active={resLoading}></Loader>
        <span>Process</span>
      </Button> 
      <Button theme={Themes.BLUE} onClick={fillTemplateBP} className="">Load test blueprint</Button>
      {/* <a href="/testbp.txt" className="text-blue-400 active:text-blue-200 cursor-pointer hover:text-blue-300" target="_blank">access test blueprint</a> */}
    </form>
    <div id="options">
      <Select theme={Themes.BLUE}>
        <Option>def</Option>
        <Option>def</Option>
        <Option>def</Option>
        <Option>def</Option>
        <Option>def</Option>
        <Option>def</Option>
        <Option>def</Option>
      </Select>
    </div>
    <div className={"w-full flex-col gap-1 "} >
      <div className="w-full flex justify-center">
        <p className="text-blue-500 text-lg">Blueprint scanner results:</p>
      </div>
      <div id="resArea">
        <Lister 
          theme={processError ? Themes.RED : Themes.BLUE} 
          className_c="p-2"
          colLayout={processError ? "1fr" : "50px 1fr 9fr"}>{resState}</Lister>
      </div>
    </div>
  </>)
}


