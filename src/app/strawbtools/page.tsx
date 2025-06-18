"use client";

import { Themes } from "@/lib/Themes";
import { Button, byId, GIcon, H1, Header, Input, Loader } from "@/lib/utils";
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

  
  const tabStyle = `p-3 rounded-t-md mb-[-2px] inline-block bgLight border-2 hover active text`;
  let states = [];
  function Tab(params:TabParams) {
    return <a key={params.idx} href={"?tab="+params.idx} className={tabStyle+` ${params.active?"blue border-b-transparent":"grey"}`} 
    onClick={params.onClick} id={"t-"+params.idx}>
      {tabs[params.idx]}
    </a>
  }

  let tabs = ["Hex search", "Name search", "Leaderboard"];
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
    let outs = await loadPOST("byHex", hexes)
    let outHTML = [];
    for (let i=0; i<outs.length; i++) {
      let rawDat = JSON.parse(outs[i]);
      let sDat = rawDat.shipData;
      if (!sDat) {
        outHTML.push(<ShipView row={hexes[i]} key={i}/>);
        continue;
      }
      let currRow = {
        hex_code: sDat.hex, 
        icon: "/404strawberry.png",
        load_time: "Unknown",
        shipworth: sDat.value,
        placement: rawDat.rank,
        name: sDat.name
      }
      outHTML.push(<ShipView row={currRow} key={i}/>)
    }
    setOutHex(outHTML);
  }

  async function processName() {
    let inp = byId("nameIn") as HTMLInputElement;
    let name = inp.value;
    let outs = await loadPOST("NameSearch", {name:name});
    let ships = outs.ships;
    let outHTML = [];
    for (let i=0; i<ships.length; i++) {
      let currRow = {
        hex_code: ships[i].shipData.hex, 
        icon: "/404strawberry.png",
        load_time: "Unknown",
        shipworth: ships[i].shipData.value,
        placement: ships[i].rank,
        name: ships[i].shipData.name
      }
      outHTML.push(<ShipView row={currRow} key={i}/>);
    }
    setOutName(outHTML);
  }

  async function loadPOST(cmd:string, body:any) {
    setLoading((lval)=>{return lval+1});
    let resp = await fetch("/api/shipprocessing?cmd="+cmd, 
      {
        method:"POST", 
        body:JSON.stringify(body), 
        headers: {
          "Content-Type": "application/json",
        }
      })
    let out = await resp.json();
    setLoading((lval)=>{return lval-1});
    return out;
  }

  const [loading, setLoading] = useState<number>(0);
  const [outHex, setOutHex] = useState<ReactNode>();
  const [outName, setOutName] = useState<ReactNode>();
  return <div className="p-5 font-raleway">
    <title>Strawberry Clan Services: Data Dump Processing</title>
    <Header title="Data Dump Tools" subtitle="Strawberry Clan Services"/>
    <div className="flex grey text flex-wrap gap-1 border-b-2">
      <a href="https://dsc.gg/join-strawberry" className={tabStyle + " grey"}>Join 🍓 Strawberry today!</a>
      {tabHTML}
    </div>
    <div className="tab hidden">
      <form className="pt-3 pb-3 flex gap-2 w-full" onSubmit={(ev:FormEvent<HTMLFormElement>)=>{ev?.preventDefault()}}>
        <Input type="text" id="hexIn" theme={Themes.BLUE} ctnClassName="grow" placeholder="Enter hex codes, separated by comma..."/>
        <Button theme={Themes.BLUE} onClick={processHex}><Loader active={loading > 0} theme={Themes.BLUE}></Loader> Process</Button>
      </form>
      <div id="res1" className="flex flex-col gap-2">
        {outHex}
      </div>
    </div>
    <div className="tab hidden">
      <form className="pt-3 pb-3 flex gap-2 w-full" onSubmit={(ev:FormEvent<HTMLFormElement>)=>{ev?.preventDefault()}}>
        <Input type="text" id="nameIn" theme={Themes.BLUE} ctnClassName="grow" placeholder="Enter ship name or fragment..."/>
        <Button theme={Themes.BLUE} onClick={processName}><Loader active={loading > 0} theme={Themes.BLUE}></Loader> Process</Button>
      </form>
      <div id="res1" className="flex flex-col gap-2">
        {outName}
      </div>
    </div>
    <div className="tab hidden">
      <form className="items-center pt-3 pb-3 flex gap-2 w-full" onSubmit={(ev:FormEvent<HTMLFormElement>)=>{ev?.preventDefault()}}>
        <span>Load leaderboard page: </span>
        <Input type="text" id="pageIn" theme={Themes.BLUE} ctnClassName="grow" placeholder="Page #..."/>
        <Button theme={Themes.BLUE} onClick={processName}><Loader active={loading > 0} theme={Themes.BLUE}></Loader>Process</Button>
      </form>
    </div>
  </div>
}