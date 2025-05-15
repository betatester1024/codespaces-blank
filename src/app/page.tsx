'use client';
import "./page.css";
// /<reference path="@/lib/utils.tsx"/>
import {Button, Themes, byId, Lister, Loader, Select, Option, GIcon, Input, escapeRegExp} from "@/lib/utils"
import { ChangeEvent, FormEvent, KeyboardEvent, MouseEvent, ReactNode, useEffect, useState } from "react";
import { BoMEntry, sortByItem, BuildEntry, BPSummary, sortConfig, getSummaryJSON } from "@/lib/bpprocessing";
import { buildCostForm, matsCostForm } from "@/lib/formcreator";
import { Item } from "@/lib/dsabp";

// const { decode, encode } = require("dsabp-js")
// const dsabp = require("dsabp-js")
// const dsabp = require("@/lib/dsabp");

let errorSummary = {bom:[], order:[], width:0, height:0, cmdCt:0, RCDCost:0, error:"Error processing blueprint."};

enum ProcessingOptns  {
  SORT, DISPLAY, SORT_SAFE, SORT_RESTORE

}
function isSort(a:ProcessingOptns|undefined) {
  return a == ProcessingOptns.SORT || a == ProcessingOptns.SORT_SAFE || a == ProcessingOptns.SORT_RESTORE;
}

enum FormOptns {
  MATSCOST, BUILD
}

export default function Page() {
  const [bomSummary, setBomSummary] = useState<ReactNode[][]>([]);
  const [buildSummary, setBuildSummary] = useState<ReactNode[][]>([]);
  const [processError, setProcessError] = useState<string>();
  const [processing, setProcessing] = useState<boolean>(false);
  const [loadingBP, setLoadingBP] = useState<boolean>(false);
  const [resBP, setResBP] = useState<string>("");
  const [asyncSumm, setSummary] = useState<BPSummary>(errorSummary);
  const [cmdType, setComd] = useState<ProcessingOptns>();
  const [sortY, setsortY] = useState<boolean>(false);
  const [starterQ, setStarterQ] = useState<boolean>(true);
  const [aExpandoes, setSnap] = useState<boolean>(true);
  const [repairMode, setRepairMode] = useState<boolean>(false);
  const [outForm, setOutForm] = useState<string>("");
  const [calcRes, setCalcRes] = useState<string>("");
  const [calcOpen, setCalcOpen] = useState<boolean>(false);
  const [firstDisp, setFirst] = useState<Item[]>([]);
  const [lastDisp, setLast] = useState<Item[]>([]);
  const [formType, setFormType] = useState<FormOptns>();
  function handleKeyDown(event:KeyboardEvent<HTMLBodyElement>) {
    console.log("calcOpen", calcOpen);
    if (event.key == "=" && !calcOpen) {
      setCalcOpen(true);
      event.preventDefault();
    }
    else if (event.key == "=" && calcOpen) {
      runCalc();
      event.preventDefault();
    }
    if (event.key == "Escape") {
      setCalcOpen(false);
    }
  }

  useEffect(()=>{
    let ele = byId("calcRes") as HTMLParagraphElement;
    console.log("Calculation performed!");
    ele.classList.remove("animHighlight");
    setTimeout(()=>{ele.classList.add("animHighlight");}, 100);
  }, [calcRes])

  useEffect(()=> {
    let calcInp = byId("calc") as HTMLInputElement;
    calcInp.focus();
    if (!calcOpen) {
      calcInp.value = "";
    }
  }, [calcOpen]);

  useEffect(()=>{
    if (repairMode) setStarterQ(false);
  }, [repairMode])

  useEffect(()=>{
    process();
  }, [cmdType, formType])

  // useEffect(() => {
  //   document.addEventListener('keydown', handleKeyDown);

  //   // Clean up the event listener when the component unmounts
  //   return () => {
  //     document.removeEventListener('keydown', handleKeyDown);
  //   };
  // }, []); // Empty dependency array ensures this runs only on mount and unmount

  useEffect(()=>{
    process();
  }, [starterQ, sortY, aExpandoes])

  async function process() {
    // event.preventDefault();
    console.log("processing command", cmdType);
    let tArea = byId("inBlueprint") as HTMLTextAreaElement;
    let bp = tArea.value;
    let summary : BPSummary;
    let processed = false;
    try {
      setProcessing(true);
      let sMode=false, rMode=false;
      switch (cmdType) {
        case ProcessingOptns.SORT: 
          break;
        case ProcessingOptns.SORT_SAFE:
          sMode = true;
          break;
        case ProcessingOptns.SORT_RESTORE:
          rMode = true;
          break;
      };
      let firstStrs = (byId("firstItems") as HTMLInputElement).value.replaceAll(" ", "").split(",");
      let lastStrs = (byId("lastItems") as HTMLInputElement).value.replaceAll(" ", "").split(",");
      let firstItms = new Set<Item>(), lastItms = new Set<Item>();
      for (let st of firstStrs)
        Item.getMap().forEach(
          (v:Item, _key:string, _map:Map<string, Item>)=>{
            if (st.length != 0 && v.name.match(new RegExp(escapeRegExp(st), "i")))
              firstItms.add(v);
          });
      for (let st of lastStrs)
        Item.getMap().forEach(
          (v:Item, _key:string, _map:Map<string, Item>)=>{
            if (st.length != 0 && v.name.match(new RegExp(escapeRegExp(st), "i"))) lastItms.add(v);
          });
      setFirst(Array.from(firstItms));
      setLast(Array.from(lastItms));
      if (isSort(cmdType)) {
        bp = await sortBP(tArea.value, {
          sortY:sortY, 
          safeMode:sMode, 
          restoreMode:rMode, 
          alignExpandoes:aExpandoes, 
          firstItems:Array.from(firstItms),
          lastItems:Array.from(lastItms)
        });
        processed = true;
      }
      let tArea2 = byId("inBlueprintR") as HTMLTextAreaElement;
      let repairBP = repairMode ? tArea2.value : "";
      console.log("inbp", bp.slice(0, 300));
      summary = await getSummaryJSON(bp, starterQ, repairBP);

      let formRes = "";
      // form
      switch (formType) {
        case FormOptns.MATSCOST:
          formRes = matsCostForm(summary, true).form;
          break;
        case FormOptns.BUILD:
          formRes = buildCostForm(summary).form;
          break;
      }
      setOutForm(formRes);
    } catch (e) {
      console.log(e);
      summary = errorSummary;
    }
    if (!bp && processed) {
      summary.error = "Sort operation failed.";
    }
    setSummary(summary);
    setProcessing(false);
    let bomformatted = [];
    for (let entry of summary.bom) {
      bomformatted.push([
        <img className="w-[2.5rem]" src={"https://test.drednot.io/img/"+entry.it.image!+".png"}></img>,
        <p>{entry.ct.toLocaleString()}</p>,
        <p>{entry.it.name}</p>
      ]);
    }
    let buildformatted=  [];
    for (let entry of summary.order) {
      buildformatted.push([
        <img className="w-[2.5rem]" src={"https://test.drednot.io/img/"+entry.item.image+".png"}></img>,
        <p>{entry.count.toLocaleString()}</p>,
        <p>{entry.equalsStr}</p>,
        <p>{entry.item.name}</p>
      ]);
    }
    if (!summary.error) {
      setBomSummary(bomformatted);
      setBuildSummary(buildformatted);
    }
    setProcessError(summary.error);
    setTimeout(()=>{
      let out = byId("outBlueprint") as HTMLTextAreaElement;
      // out.focus();
      out.select();
      // location.href="#outBlueprint";
    }, 200);
  }

  async function sortBP(value:string, config?:sortConfig) {
    let summary = await sortByItem(value, config);
    setResBP(summary.bp);
    return summary.bp;
  }

  function itemsToHTML(arr:Item[]) {
    let out = [];
    for (let i=0; i<arr.length; i++) {
      let it = arr[i];
      out.push(<span className="flex items-center gap-1" key={i}>
        <img src={"https://drednot.io/img/"+it.image+".png"}/>
        {/* {arr.length <= 5 ? <span>{it.name}</span> : <></>} */}
      </span>);
    }
    return out;
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

  function updateProcessCommand(n:ProcessingOptns) {
    console.log("command set!", n);
    setComd(n);
  }

  function updateFormCommand(n:FormOptns) {
    setFormType(n);
  }

  function runCalc() {
    let input = byId("calc") as HTMLInputElement;
    try {
      let val = eval(input.value);
      setCalcRes(toStackString(val));
    } catch (e:any) {
      setCalcRes("Error: " + e.toString());
    }
  }

  function toStackString(val:number) {
    return val.toString() + (val >= 16 ? " ~"+Math.ceil(val/16)+"stk":"");
  }

  return (<body onKeyDown={handleKeyDown}><div className="flex flex-col gap-2 pb-[50vh] p-5">
    <form onSubmit={(event:FormEvent)=>{event.preventDefault(); process()}}>
      <div className="flex gap-1 flex-wrap relative items-center">
        <textarea id="inBlueprint" placeholder="DSA:..." 
          className={`${Themes.GREY.bgMain} ${Themes.BLUE.textCls}`}>
        </textarea>
        <textarea id="inBlueprintR" placeholder="Repair base blueprint" 
        className={`${Themes.GREY.bgMain} ${Themes.BLUE.textCls} shrink transition-all overflow-clip 
        ${repairMode ? "max-w-[400px] pr-1 pl-1" : "max-w-[0px] !pl-0 !pr-0"}`}>
        </textarea> 
        <div className="flex flex-col">
          <Button type="button" theme={Themes.BLUE} onClick={fillTemplateBP} className="h-[fit-content]">
            <Loader theme={Themes.BLUE} active={loadingBP}></Loader>
            Load test blueprint
          </Button>
          <Input theme={Themes.GREEN} type="checkbox" checked={repairMode} onChange={(event:ChangeEvent<HTMLInputElement>) => {setRepairMode(event.target.checked);}}
          ctnClassName="cursor-pointer" id="repairMode">Enter repair mode?</Input>
        </div>
        {/* <a href="/testbp.txt" className="text-blue-400 active:text-blue-200 cursor-pointer hover:text-blue-300" target="_blank">access test blueprint</a> */}
      </div>
      <div className="w-full flex gap-1 flex-wrap mt-2 items-center">
        <div className="flex flex-col items-left grow">
          <Select theme={Themes.BLUE} className="grow-1" defaultIdx={0} onChange={updateProcessCommand} onSubmit={process}>
            <Option value={ProcessingOptns.SORT}>Sort by item</Option>
            <Option value={ProcessingOptns.SORT_SAFE}>(Safe mode) Disable loaders and hatches</Option>
            <Option value={ProcessingOptns.SORT_RESTORE}>(Restore mode) Restore loader and hatch settings</Option>
            <Option value={ProcessingOptns.DISPLAY}>No processing - display only</Option>
          </Select>
          <Select theme={Themes.BLUE} className="grow-1" defaultIdx={0} onChange={updateFormCommand} onSubmit={process}>
            <Option value={FormOptns.BUILD}>Build cost breakdown</Option>
            <Option value={FormOptns.MATSCOST}>Materials cost only</Option>
          </Select>
        </div>
        <div className="flex flex-col items-left">
          <Input theme={Themes.BLUE} type="checkbox" id="sortY" 
          onChange={(event:ChangeEvent<HTMLInputElement>) => {setsortY(event.target.checked);}} 
          ctnClassName="cursor-pointer">Sort by Y-coord?</Input>
          <Input theme={Themes.BLUE} type="checkbox" checked={starterQ} id="starterQ" 
          onChange={(event:ChangeEvent<HTMLInputElement>) => {setStarterQ(event.target.checked);}} 
          ctnClassName="cursor-pointer">From starter?</Input>
          <Input theme={Themes.BLUE} type="checkbox" checked={aExpandoes}id="boxQ" 
          onChange={(event:ChangeEvent<HTMLInputElement>) => {setSnap(event.target.checked);}} 
          ctnClassName="cursor-pointer">Snap boxes?</Input>
        </div>
        <Button theme={Themes.GREEN} className="basis-[min-content]" type="submit">
          <Loader theme={Themes.GREEN} active={processing}></Loader>
          <span>Process</span>
        </Button> 
      </div>
      <div className="flex pt-2 pb-2 gap-2">
        <Input id="firstItems" defaultValue="block, walkway, ladder, net, starter" placeholder="First items..." ctnClassName="grow" className="grow" theme={Themes.BLUE}/>
        <Input id="lastItems" defaultValue="expando, recycler" placeholder="Last items..." ctnClassName="grow" className="grow" theme={Themes.BLUE}/>
      </div>
    </form>
    <div className={`${Themes.BLUE.textCls} font-mono p-2 rounded-md border-[2px]`}>
      {
        processError ? <span className={Themes.RED.textCls}>{processError}</span> : <>
        {isSort(cmdType) ? 
          <div className="grid" style={{gridTemplateColumns:"0fr 1fr"}}>
            <div className="mb-1 grid grid-cols-subgrid gap-2 items-center" style={{gridColumn:"span 2"}}>
              <span>First:</span>
              <div className="summaryContainer flex flex-wrap gap-2 border-[2px]">{itemsToHTML(firstDisp)}</div>
            </div>
            <div className="mt-1 grid grid-cols-subgrid gap-2 items-center" style={{gridColumn:"span 2"}}>
              <span>Last:</span>
              <div className="summaryContainer flex flex-wrap gap-2 border-[2px]">{itemsToHTML(lastDisp)}</div>
            </div>
          </div> : <></>}
        <span className={Themes.GREEN.textCls}>INTERNC: <b>{asyncSumm.width <= 2 ? "N/A" : (asyncSumm.width-2) + "x"+ (asyncSumm.height-2)}</b></span> 
        <p>Cannon dimensions: <b>{(asyncSumm.width/3).toFixed(1)}x{(asyncSumm.height/3).toFixed(1)}</b></p>
        <p>Blueprint width (EXTERNC): &nbsp;<b>{asyncSumm.width}</b> = <b>+{asyncSumm.width < 11 ? "N/A" : asyncSumm.width-11}</b> blocks from starter</p>
        <p>Blueprint height (EXTERNC): <b>{asyncSumm.height}</b> = <b>+{asyncSumm.width <= 8 ? "N/A" : asyncSumm.height-8}</b> blocks from starter</p>
        <p className={asyncSumm.cmdCt > 1000 ? Themes.RED.textCls : ""}>{asyncSumm.cmdCt.toLocaleString()} commands </p>
        <p className={Themes.GREEN.textCls}>RCD cost: <b>{toStackString(asyncSumm.RCDCost)}</b> flux</p> </>
      }
    </div>
    {/* <div className={`summaryContainer outline-[2px] ${Themes.BLUE.textCls} ${Themes.BLUE.bg2}`}> */}
      <div className="flex gap-2">
        <textarea id="outBlueprint" onClick={(event:MouseEvent<HTMLTextAreaElement>)=>{let t = event.target as HTMLTextAreaElement; t.select();}}
          value={resBP} readOnly={true} placeholder="Result blueprint here..."
          className={`grow-1 summaryContainer ${Themes.GREY.bgMain} ${Themes.BLUE.textCls} font-mono p-1 mt-2 rounded-sm`}>
        </textarea>
        <textarea id="outForm" onClick={(event:MouseEvent<HTMLTextAreaElement>)=>{let t = event.target as HTMLTextAreaElement; t.select();}}
          value={outForm} readOnly={true} placeholder="Output form here..."
          className={`grow-1 summaryContainer ${Themes.GREY.bgMain} ${Themes.BLUE.textCls} font-mono p-1 mt-2 rounded-sm`}>
        </textarea>
      </div>
    {/* </div> */}
    {  
      
      <div className={"w-full flex flex-col md:grid gap-1"} style={{gridTemplateColumns:"1fr 1fr"}}>
        {
          processError ? <></> : 
          <div className={`summaryContainer border-[2px] ${Themes.BLUE.textCls} ${Themes.BLUE.bgLight}`}>
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
          processError ? <></> : 
          <div className={`summaryContainer border-[2px] ${Themes.BLUE.textCls} ${Themes.BLUE.bgLight}`}>
            <div className="w-full flex justify-center">
              <p className="text-blue-500 text-lg">Build order&nbsp;
                {starterQ && !processing ? "(adjusted for starter items)" : ""} 
                {repairMode && !processing ? "(adjusted for repair mode)" : ""}
              </p>
            </div>
            <div>
              <Lister 
                theme={Themes.BLUE} 
                className_c="p-2"
                colLayout={"50px 1fr 2fr 9fr"}>{buildSummary}</Lister>
            </div>
          </div>
        }
      </div>
    }
  </div>
  <div id="calcCtn" onClick={(event:MouseEvent<HTMLDivElement>)=>{if ((event.target as HTMLDivElement).id == "calcCtn") setCalcOpen(false);}} 
    className={`w-full h-full absolute bg-gray-200/75 top-0 flex items-center 
    justify-center transition-all ${calcOpen ? "opacity-100 pointer-events-all" : "opacity-0 pointer-events-none"}`}>
    <div className="top-5 w-[90%] h-[fit-content] bg-gray-200 p-3 rounded-md"> 
      <form onSubmit={(event:FormEvent<HTMLFormElement>)=>{event.preventDefault(); runCalc();}} className="flex gap-2">
        <Input id="calc" theme={Themes.BLUE} ctnClassName="grow" className={`font-xl font-mono grow ${Themes.BLUE.hoverCls}`} placeholder="Calculate..."/>
        <Button type="submit" theme={Themes.BLUE}><GIcon theme={Themes.BLUE}>calculate</GIcon></Button>
      </form>
      <div>
        <p id="calcRes" className={"p-2 w-full font-mono " + Themes.BLUE.textCls}>Result: <b>{calcRes}</b></p>
      </div>
    </div>
  </div>
  </body>)
}



