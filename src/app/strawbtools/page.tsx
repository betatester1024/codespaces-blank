"use client";

import { byId, Header } from "@/lib/utils";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { MouseEvent, useState, useEffect, ReactElement } from "react";

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

  let tabs = ["Name search", "Hex search", "Leaderboard"];
  let tabHTML : ReactElement<TabParams>[] = [];
  let i=0;
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

  return <div className="p-5">
    <title>Strawberry Clan Services: Data Dump Processing</title>
    <Header title="Data Dump Tools" subtitle="Strawberry Clan Services"/>
    <div className="flex grey text flex-wrap gap-1 border-b-2">{tabHTML}</div>
    <div className="tab hidden">
      name search div.
    </div>
    <div className="tab hidden">
      second div.
    </div>
    <div className="tab hidden">
      third div.
    </div>
  </div>
}