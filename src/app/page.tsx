'use client';
// /<reference path="@/lib/utils.tsx"/>
import {Button, Themes, byId, Lister, Loader, Select, Option} from "@/lib/utils"
import { ReactNode, useState } from "react";
import { getBlueprintSummary, BoMEntry, sortByItem, BuildEntry } from "@/lib/bpprocessing";

// const { decode, encode } = require("dsabp-js")
// const dsabp = require("dsabp-js")
// const dsabp = require("@/lib/dsabp");

export default function Page() {
  const [bomSummary, setBomSummary] = useState<ReactNode[][]>([]);
  const [buildSummary, setBuildSummary] = useState<ReactNode[][]>([]);
  const [processError, setProcessError] = useState<string>();
  const [processing, setProcessing] = useState<boolean>(false);
  const [loadingBP, setLoadingBP] = useState<boolean>(false);
  const [resBP, setResBP] = useState<string>("");

  async function process(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let tArea = (event.target as HTMLFormElement).querySelector("textarea")!;
    setProcessing(true);
    switch (command) {
      case ProcessingOptns.SORT: 
        await sortBP(tArea.value);
        break;
    };
    let summary : {bom:BoMEntry[], order:BuildEntry[]} = JSON.parse(await getBlueprintSummary(tArea.value));
    setProcessing(false);
    let bomformatted = [];
    for (let entry of summary.bom) {
      bomformatted.push([
        <img className="w-[2.5rem]" src={"https://test.drednot.io/img/"+entry.link+".png"}></img>,
        <p>{entry.ct+""}</p>,
        <p>{entry.it}</p>
      ]);
    }
    let buildformatted=  [];
    for (let entry of summary.order) {
      buildformatted.push([
        <img className="w-[2.5rem]" src={"https://test.drednot.io/img/"+entry.item.image+".png"}></img>,
        <p>{entry.count+""}</p>,
        <p>{entry.item.name}</p>
      ]);
    }
    if (summary.bom.length > 0) {
      setBomSummary(bomformatted);
      setBuildSummary(buildformatted);
      setProcessError(undefined);
    }
    else {
      setBuildSummary([])
      setBomSummary([[
          <p className={Themes.RED.textCls}>Blueprint processing error.</p>
        ]]);
      setProcessError("Blueprint processing error.");
    }
    
  }

  async function sortBP(value:string) {
    let summary = JSON.parse(await sortByItem(value));
    setResBP(summary.bp);
  }

  async function fillTemplateBP() {
    let tArea = byId("inBlueprint") as HTMLTextAreaElement;
    setLoadingBP(true);
    let rawDat = await fetch("/testbp.txt");
    let str = await rawDat.text();
    tArea.value = str;
    setLoadingBP(false);
    console.log("loaded!");
  }

  enum ProcessingOptns  {
    SORT, DISPLAY
  }

  let command : ProcessingOptns = ProcessingOptns.DISPLAY;
  function updateProcessCommand(n:ProcessingOptns) {
    command = n;
  }

  return (<>
    <form onSubmit={process}>
      <div className="flex gap-1 flex-wrap relative items-center">
        <textarea id="inBlueprint" className={`${Themes.GREY.bgCls} ${Themes.BLUE.textCls} grow-4 rounded-sm`}>
        </textarea>
        <Button type="button" theme={Themes.BLUE} onClick={fillTemplateBP} className="h-[fit-content]">
          <Loader theme={Themes.BLUE} active={loadingBP}></Loader>
          Load test blueprint
        </Button>
        {/* <a href="/testbp.txt" className="text-blue-400 active:text-blue-200 cursor-pointer hover:text-blue-300" target="_blank">access test blueprint</a> */}
      </div>
      <div className="w-full flex gap-1 flex-wrap mt-2">
        <Select theme={Themes.BLUE} className="grow-1" onChange={updateProcessCommand}>
          <Option value={ProcessingOptns.SORT}>Sort by item</Option>
          <Option value={ProcessingOptns.DISPLAY}>Display</Option>
        </Select>
        <Button theme={Themes.GREY} className="basis-[min-content]" type="submit">
          <Loader theme={Themes.GREY} active={processing}></Loader>
          <span>Process</span>
        </Button> 
      </div>
    </form>
    <div className={"w-full flex gap-1 flex-wrap"} >
      {
        bomSummary.length == 0 ? <></> : 
        <div className="grow">
          <div className="w-full flex justify-center">
            <p className="text-blue-500 text-lg">Materials required</p>
          </div>
          <div id="resArea">
            <Lister 
              theme={processError ? Themes.RED : Themes.BLUE} 
              className_c="p-2"
              colLayout={processError ? "1fr" : "50px 1fr 9fr"}>{bomSummary}</Lister>
          </div>
        </div>
      }
      {
        buildSummary.length == 0 ? <></> : 
        <div className="grow">
          <div className="w-full flex justify-center">
            <p className="text-blue-500 text-lg">Build order</p>
          </div>
          <div>
            <Lister 
              theme={processError ? Themes.RED : Themes.BLUE} 
              className_c="p-2"
              colLayout={"50px 1fr 9fr"}>{buildSummary}</Lister>
          </div>
        </div>
      }
    </div>
    <textarea value={resBP} readOnly={true} placeholder="Result blueprint here..."
      className={`${Themes.GREY.bgCls} ${Themes.BLUE.textCls} w-[100%] mt-2 rounded-sm`}></textarea>
  </>)
}


