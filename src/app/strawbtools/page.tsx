"use client";

import { Themes } from "@/lib/Themes";
import { Button, byId, Header, Input, Loader } from "@/lib/utils";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { MouseEvent, useState, useEffect, ReactElement, ReactNode, FormEvent } from "react";
import { ShipView } from "../networth/page";

interface TabParams {
  onClick:(e:MouseEvent)=>any
  idx:number,
  className?:string,
  active:boolean
}

export default function Page() {

  
  let states = [];
  function Tab(params:TabParams) {
    return <a key={params.idx} href={"?tab="+params.idx} className={`p-3 rounded-t-md mb-[-2px] inline-block bgLight border-2 border-b-transparent hover active text ${params.active?"blue":"grey"}`} 
    onClick={params.onClick} id={"t-"+params.idx}>
      {tabs[params.idx]}
    </a>
  }

  let tabs = ["Hex search", "Hex search", "Leaderboard"];
  let tabHTML : ReactElement<TabParams>[] = [];
  for (let i=0; i<tabs.length; i++) {
    states.push(useState<boolean>(false));
    tabHTML.push(
      <Tab key={i} idx={i} active={states[i][0]} onClick={(e:MouseEvent)=>{setTabIdx(i); e.preventDefault()}}/>
    );
  }
  let docURL = useSearchParams();
  let initIdx = +docURL.get("tab")!; //slice(1);
  const [tabIdx, setTabIdx] = useState<number>(initIdx < 0 ? 0 : initIdx);

  useEffect(()=>{
    let eIdx = 0;
    for (let e of document.getElementsByClassName("tab")) {
      e.classList.add("hidden");
      if (eIdx == tabIdx) e.classList.remove("hidden");
      eIdx++;
    }
    for (let i=0; i<tabs.length; i++) states[i][1](false);
    states[tabIdx][1](true);
    history.pushState(null, "", "?tab="+tabIdx)
  }, [, tabIdx])

  // window can only be accessed in an effect. 
  useEffect(()=>{
    window.addEventListener("popstate", (event:PopStateEvent) => {
      console.log("state popped", location.href);
      let urlObj = new URL(location.href);
      let newTabIdx = +urlObj.searchParams.get("tab")!;
      console.log(newTabIdx);
      if (isNaN(newTabIdx)) return true;
      setTabIdx(newTabIdx);
      return false;
    })
  }, []);

  async function processHex() {
    let inp = byId("hexIn") as HTMLInputElement;
    let hexIn = inp.value;
    let hexes = hexIn.split(",");
    // for (let i=0; i<hexes.length; i++)
    let outs = await loadPOST("byHex", JSON.stringify(hexes))
    let outHTML = [];
    for (let i=0; i<outs.length; i++) {
      console.log(JSON.parse(outs[i]));
      let rawDat = JSON.parse(outs[i]).shipData;
      if (!rawDat) {
        outHTML.push(<ShipView row={hexes[i]} key={i}/>);
        continue;
      }
      let currRow = {
        hex_code: rawDat.hex, 
        icon: "/404strawberry.png",
        load_time: "Unknown",
        shipworth: rawDat.value,
        placement: -1,
        name: rawDat.name
      }
      outHTML.push(<ShipView row={currRow} key={i}/>)
    }
    setSummaryHTML(outHTML);
  }

  async function loadPOST(cmd:string, body:any) {
    setLoading((lval)=>{return lval+1});
    let resp = await fetch("/api/shipprocessing?cmd="+cmd, 
      {
        method:"POST", 
        body:body, 
        headers: {
          "Content-Type": "application/json",
        }
      })
    let out = await resp.json();
    setLoading((lval)=>{return lval-1});
    return out;
  }

  const [loading, setLoading] = useState<number>(0);
  const [summaryHTML, setSummaryHTML] = useState<ReactNode>();
  return <div className="p-5 font-raleway">
    <title>Strawberry Clan Services: Data Dump Processing</title>
    <Header title="Data Dump Tools" subtitle="Strawberry Clan Services"/>
    <div className="flex grey text flex-wrap gap-1 border-b-2">{tabHTML}</div>
    <div className="tab hidden">
      <form className="pt-3 pb-3 flex gap-2 w-full" onSubmit={(ev:FormEvent<HTMLFormElement>)=>{ev?.preventDefault()}}>
        <Input type="text" id="hexIn" theme={Themes.BLUE} ctnClassName="grow" placeholder="Enter hex codes, separated by comma..."/>
        <Button theme={Themes.BLUE} onClick={processHex}><Loader active={loading > 0} theme={Themes.BLUE}></Loader> Process</Button>
      </form>
      <div id="res1" className="flex flex-col gap-2">
        {summaryHTML}
      </div>
    </div>
    <div className="tab hidden">
      second div.
    </div>
    <div className="tab hidden">
      third div.
    </div>
  </div>
}