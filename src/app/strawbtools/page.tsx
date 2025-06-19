"use client"
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
      let urlObj = new URL(location.href);
      let newTabIdx = +urlObj.searchParams.get("tab")!;
      if (isNaN(newTabIdx)) return true;
      setTabIdx(newTabIdx);
      return false;
    })
  }, []);

  function processLimitedSummary(inDat:{shipData:{hex:string, value:number, name:string}, rank:number}) {
    
    let currRow = {
      hex_code: inDat.shipData.hex, 
      icon: "/404strawberry.png",
      load_time: "Unknown",
      shipworth: inDat.shipData.value,
      placement: inDat.rank,
      name: inDat.shipData.name
    }
    return currRow;
  }

  async function processHex() {
    let inp = byId("hexIn") as HTMLInputElement;
    let hexIn = inp.value;
    let hexes = hexIn.split(",");
    let validCt = 0;
    // for (let i=0; i<hexes.length; i++)
    setOutHex(<Loader theme={Themes.BLUE} active={true}/>)
    let outs = null;
    try {
      outs = await loadPOST("byHex", hexes)
    } catch (e) {return;}
    
    let outHTML = [];
    for (let i=0; i<outs.length; i++) {
      let rawDat = JSON.parse(outs[i]);
      let sDat = rawDat.shipData;
      if (!sDat) {
        outHTML.push(<ShipView row={hexes[i]} key={i}/>);
        continue;
      }
      validCt++;
      outHTML.push(<ShipView row={processLimitedSummary(rawDat)} key={i}/>)
    }
    setOutCtHex(validCt)
    setOutHex(outHTML);
  }

  async function processName() {
    let inp = byId("nameIn") as HTMLInputElement;
    let name = inp.value;
    let outs = null;
    setOutName(<Loader theme={Themes.BLUE} active={true}/>)
    try {
      outs = await loadPOST("NameSearch", {name:name});
    } catch (e) {return;}
    
    let ships = outs.ships;
    let outHTML = [];
    for (let i=0; i<ships.length; i++) {
      outHTML.push(<ShipView row={processLimitedSummary(ships[i])} key={i}/>)
    }
    setOutName(outHTML);
    setOutCtName(outHTML.length);
  }

  async function getLBPage() {
    let ele = byId("pageIn") as HTMLInputElement;
    let page = Number(ele.value);
    if (page < 1) page = 1;
    ele.value = ""+page;
    setPage(page);
    setLBData(<Loader active={true} theme={Themes.BLUE}/>)
    let outs = null;
    try {
      outs = await loadPOST("leaderboard", {page:page-1});
    } catch (e) {return;}
    let ships = outs.ships
    let outHTML = [];
    for (let i=0; i<ships.length; i++) {
      outHTML.push(<ShipView row={processLimitedSummary(ships[i])} key={i}/>)
    }
    setLBData(outHTML);
  }

  const [activeR, setActiveR] = useState<AbortController>();

  async function loadPOST(cmd:string, body:any) {
    if (activeR != undefined) {
      console.log(activeR);
      activeR.abort();
      setLoading((lval)=>{return lval-1});
    }
    let ctrl = new AbortController();
    setLoading((lval)=>{return lval+1});
    setActiveR(ctrl);
    let resp = await fetch("/api/shipprocessing?cmd="+cmd, 
      {
        method:"POST", 
        body:JSON.stringify(body), 
        signal:ctrl.signal,
        headers: {
          "Content-Type": "application/json",
        }
      })
    let out = await resp.json();
    setLoading((lval)=>{return lval-1});
    setActiveR(undefined);
    return out;
  }

  function changeLB(delta:number) {
    let ele = byId("pageIn") as HTMLInputElement;
    ele.value = "" +(Number(ele.value) + delta);
    getLBPage();
  }

  const [loading, setLoading] = useState<number>(0);
  const [outHex, setOutHex] = useState<ReactNode>();
  const [outCtHex, setOutCtHex] = useState<number>(0);
  const [outName, setOutName] = useState<ReactNode>();
  const [outCtName, setOutCtName] = useState<number>(0);
  const [LBData, setLBData] = useState<ReactNode>();
  const [pageN, setPage] = useState<number>(1)
  return  <div className="p-5 font-raleway">
    <header className="slideIn font-raleway blue text mb-3">
      <div className="text-4xl">Econ dump tools</div>
      <p className="slideIn grey text">Thank you to <b className="blue slideIn text">@xendyos</b> for econ processing scripts. By Strawberry Web Services: Everything you could ever want. And prisms.</p>
    </header>
    <div className="flex grey text flex-wrap gap-1 pl-2 border-b-2">
      {tabHTML}
      <a href="https://dsc.gg/join-strawberry" target="_blank" className={tabStyle + " grey"}>Join 🍓 Strawberry today!</a>
    </div>
    <div className="tab hidden">
      <form className="pt-3 pb-3 flex gap-2 w-full" onSubmit={(ev:FormEvent<HTMLFormElement>)=>{ev?.preventDefault()}}>
        <Input type="text" id="hexIn" theme={Themes.BLUE} ctnClassName="grow" placeholder="Enter hex codes, separated by comma..."/>
        <Button theme={Themes.BLUE} onClick={processHex}><Loader active={loading > 0} theme={Themes.BLUE}></Loader> Process</Button>
      </form>
      <span className="darkgrey text">{outCtHex} result{outCtHex == 1 ? "" : "s"} found:</span>
      <div id="res1" className="flex flex-col gap-2">
        {outHex}
      </div>
    </div>
    <div className="tab hidden">
      <form className="pt-3 pb-3 flex gap-2 w-full" onSubmit={(ev:FormEvent<HTMLFormElement>)=>{ev?.preventDefault()}}>
        <Input type="text" id="nameIn" theme={Themes.BLUE} ctnClassName="grow" placeholder="Enter ship name or fragment..."/>
        <Button theme={Themes.BLUE} onClick={processName}><Loader active={loading > 0} theme={Themes.BLUE}></Loader> Process</Button>
      </form>
      <span className="darkgrey text">{outCtName} result{outCtName == 1 ? "" : "s"} found:</span>
      <div id="res1" className="flex flex-col gap-2">
        {outName}
      </div>
    </div>
    <div className="tab hidden">
      <form className="items-center pt-3 pb-3 flex gap-2 w-full" onSubmit={(ev:FormEvent<HTMLFormElement>)=>{ev?.preventDefault()}}>
        <span className="darkgrey text">Load leaderboard page: </span>
        <Button theme={Themes.BLUE} type="button" onClick={()=>{changeLB(-1)}}><GIcon theme={Themes.BLUE}>arrow_back_ios</GIcon></Button>
        <Input type="number" id="pageIn" min={1} defaultValue={1} theme={Themes.BLUE} ctnClassName="grow" placeholder="Page #..."/>
        <Button theme={Themes.BLUE} type="button" onClick={()=>{changeLB(1)}}><GIcon theme={Themes.BLUE}>arrow_forward_ios</GIcon></Button>
        <Button theme={Themes.BLUE} onClick={getLBPage}><Loader active={loading > 0} theme={Themes.BLUE}></Loader>Go</Button>
      </form>
      <div className="flex flex-col gap-2">
        {LBData != undefined ? <div className="darkgrey text">
          Displaying <b>20 results</b> per page, from #{1 + (pageN-1) * 20} to #{pageN*20}
        </div> : <span className="darkgrey text">Click "GO" to search the leaderboard...</span>}
        {LBData}
      </div>
    </div>
  </div>
}