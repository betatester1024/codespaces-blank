'use client';
// /<reference path="@/lib/utils.tsx"/>
import {Button, Themes, byId, Lister, Loader, Select, Option, GIcon} from "@/lib/utils"
import { ChangeEvent, ReactNode, useState } from "react";
import { BoMEntry, sortByItem, BuildEntry, getBlueprintSummary, BPSummary, sortOptions } from "@/lib/bpprocessing";

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
  const [asyncSumm, setSummary] = useState<BPSummary>({bom:[], order:[], width:0, height:0, cmdCt:0});
  const [command, setCommand] = useState<ProcessingOptns>();
  const [sortY, setsortY] = useState<boolean>(false);

  async function process(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let tArea = (event.target as HTMLFormElement).querySelector("textarea")!;
    let bp = tArea.value;
    let summary : BPSummary|null = null;
    try {
      setProcessing(true);
      switch (command) {
        case ProcessingOptns.SORT: 
          bp = await sortBP(tArea.value, {sortY:sortY, safeMode:false, restoreMode:false});
          break;
        case ProcessingOptns.SORT_SAFE:
          bp = await sortBP(tArea.value, {sortY:sortY, safeMode:true, restoreMode:false});
          break;
        case ProcessingOptns.SORT_RESTORE:
          bp = await sortBP(tArea.value, {sortY:sortY, safeMode:false, restoreMode:true});
          break;
      };
      summary = (JSON.parse(await getBlueprintSummary(bp)));
    } catch (e) {
    }
    if (!summary) {
      summary = ({bom:[], order:[], width:0, height:0, cmdCt:0});
    }
    setSummary(summary);
    setProcessing(false);
    let bomformatted = [];
    for (let entry of summary.bom) {
      bomformatted.push([
        <img className="w-[2.5rem]" src={"https://test.drednot.io/img/"+entry.link+".png"}></img>,
        <p>{entry.ct.toLocaleString()}</p>,
        <p>{entry.it}</p>
      ]);
    }
    let buildformatted=  [];
    for (let entry of summary.order) {
      buildformatted.push([
        <img className="w-[2.5rem]" src={"https://test.drednot.io/img/"+entry.item.image+".png"}></img>,
        <p>{entry.count.toLocaleString()}</p>,
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

  async function sortBP(value:string, config?:sortOptions) {
    let summary = JSON.parse(await sortByItem(value, config));
    setResBP(summary.bp);
    return summary.bp;
  }

  async function fillTemplateBP() {
    let tArea = byId("inBlueprint") as HTMLTextAreaElement;
    setLoadingBP(true);
    let str;
    try {
      let rawDat = await fetch("/testbp.txt");
      str = await rawDat.text();
      if (rawDat.status != 200) str = "Could not load test blueprint.";
    } catch (e) {
      console.log(e);
      str = "Could not load test blueprint.";
    }
    
    tArea.value = str;
    setLoadingBP(false);
    console.log("loaded!");
  }

  enum ProcessingOptns  {
    SORT, DISPLAY, SORT_SAFE, SORT_RESTORE
  }

  function updateProcessCommand(n:ProcessingOptns) {
    setCommand(n);
  }

  return (<div className="flex-col">
    <form onSubmit={process}>
      <div className="flex gap-1 flex-wrap relative items-center">
        <textarea id="inBlueprint" placeholder="DSA:..." 
        className={`${Themes.GREY.bgCls} ${Themes.BLUE.textCls} p-1 grow-4 rounded-sm font-mono`}>
        </textarea>
        <Button type="button" theme={Themes.BLUE} onClick={fillTemplateBP} className="h-[fit-content]">
          <Loader theme={Themes.BLUE} active={loadingBP}></Loader>
          Load test blueprint
        </Button>
        {/* <a href="/testbp.txt" className="text-blue-400 active:text-blue-200 cursor-pointer hover:text-blue-300" target="_blank">access test blueprint</a> */}
      </div>
      <div className="w-full flex gap-1 flex-wrap mt-2 items-center">
        <Select theme={Themes.BLUE} className="grow-1" onChange={updateProcessCommand}>
          <Option value={ProcessingOptns.SORT}>Sort by item</Option>
          <Option value={ProcessingOptns.SORT_SAFE}>(Safe mode) Disable pushers, loaders and hatches</Option>
          <Option value={ProcessingOptns.SORT_RESTORE}>(Restore mode) Restore pusher, loader and hatch settings</Option>
          <Option value={ProcessingOptns.DISPLAY}>Display</Option>
        </Select>
        <div className={`text-md ${Themes.BLUE.textCls} h-[100%] p-2`}>
          <input type="checkbox" id="sortY" onChange={(event:ChangeEvent<HTMLInputElement>) => {setsortY(event.target.checked);}} className="cursor-pointer"/>
          <label htmlFor="sortY" className="inline-block h-[100%] ml-1 cursor-pointer"> Sort by Y-value?</label>
          </div>
        <Button theme={Themes.GREY} className="basis-[min-content]" type="submit">
          <Loader theme={Themes.GREY} active={processing}></Loader>
          <span>Process</span>
        </Button> 
      </div>
    </form>
    <div className={`${Themes.BLUE.textCls} font-mono p-2 rounded-md outline-[2px] m-2`}>
      <span>INTERNC= <b>{asyncSumm.width <= 2 ? "N/A" : (asyncSumm.width-2) + "x"+ (asyncSumm.height-2)}</b></span> 
      <p>Cannon dimensions: <b>{(asyncSumm.width/3).toFixed(1)}x{(asyncSumm.height/3).toFixed(1)}</b></p>
      <p>Blueprint width (EXTERNC): <b>{asyncSumm.width}</b></p>
      <p>Blueprint height (EXTERNC):<b>{asyncSumm.height}</b></p>
      <p className={asyncSumm.cmdCt > 1000 ? Themes.RED.textCls : ""}>{asyncSumm.cmdCt.toLocaleString()} commands </p>
    </div>
    <div className={"w-full flex-col md:grid gap-1"} style={{gridTemplateColumns:"1fr 1fr"}}>
      {
        bomSummary.length == 0 ? <></> : 
        <div className={`grow rounded-md outline-[2px] m-2 p-2 overflow-scroll max-h-[70vh] ${Themes.BLUE.textCls} ${Themes.BLUE.bg2}`}>
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
        <div className={`grow rounded-md outline-[2px] m-2 p-2 overflow-scroll max-h-[70vh] ${Themes.BLUE.textCls} ${Themes.BLUE.bg2}`}>
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
      className={`${Themes.GREY.bgCls} ${Themes.BLUE.textCls} w-[100%] font-mono p-1 mt-2 rounded-sm`}></textarea>
  </div>)
}


