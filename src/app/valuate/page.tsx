"use client";

import { Button, byId, Header } from "@/lib/utils";
import { Themes } from "@/lib/Themes";
import "@/app/page.css";
import { FormEvent, ReactNode, useState } from "react";
import { buildCostForm } from "@/lib/formcreator";
import { getSummaryJSON, sortByItem } from "@/lib/bpprocessing";

export default function Page() {

  async function valuate() {
    let tArea = byId("inBlueprint") as HTMLTextAreaElement;
    let formData = buildCostForm(await getSummaryJSON(tArea.value, false, ""));
    setSummary(formData.html);
  }

  const [summaryOut, setSummary] = useState<ReactNode>(<>Press "Valuate" to start...</>);

  return <div className="p-3 flex flex-col gap-2" >
    <title>Blueprint Valuator | BetaOS ProDSA</title>
    <Header title="Blueprint Valuator" subtitle="Tools by BetaOS ProDSA"/>
    <form className="flex gap-1" onSubmit={(event:FormEvent<HTMLFormElement>)=>{
      event.preventDefault();
      valuate();
    }}>
      <textarea placeholder="DSA:..." id="inBlueprint" className={`font-nsm ${Themes.BLUE.textCls} ${Themes.BLUE.bgMain}`}></textarea>
      <Button theme={Themes.GREEN}>Valuate!</Button>
    </form>
    <div className={`${Themes.BLUE.textCls} border-[2px] p-3 rounded-md`} id="formOut">
      {summaryOut}
    </div>
  </div>
}