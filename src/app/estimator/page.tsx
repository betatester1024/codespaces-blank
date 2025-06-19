"use client";

import { Button, byId, Header, Option, Select } from "@/lib/utils";
import { Themes } from "@/lib/Themes";
// import "@/app/page.css";
import { FormEvent, ReactNode, useEffect, useState } from "react";
import { buildCostForm, insuranceForm } from "@/lib/formcreator";
import { getSummaryJSON, sortByItem } from "@/lib/bpprocessing";
import { useSearchParams } from "next/navigation";


enum estimateTypes {
  INSURANCE, BUILD
};
export default function Page() {

  let params = useSearchParams();
  const modeNames = ["build", "insurance"];
  let defaultModeIdx = modeNames.indexOf(params.get("mode") ?? "none");
  if (defaultModeIdx < 0) defaultModeIdx = 0;

  async function valuate() {
    
    let tArea = byId("inBlueprint") as HTMLTextAreaElement;
    let summ = await getSummaryJSON(tArea.value, false, "");
    let formData = {html:<>Invalid selection, contact jen</>};
    switch (estimateType) {
      case estimateTypes.BUILD:
        formData = buildCostForm(summ);
        break;
      case estimateTypes.INSURANCE:
        formData = insuranceForm(summ, 80, 100);
        break;
    }
    setSummary(formData.html);
  }
  const [estimateType, setType] = useState<estimateTypes>();
  const [summaryOut, setSummary] = useState<ReactNode>(<>Press "Estimate" to start...</>);
  useEffect(()=>{
    valuate();
  }, [estimateType])
  

  return <div className="p-3 flex flex-col gap-2" >
    <title>Blueprint Pricing Estimator | ProDSA Services</title>
    <meta name="description" content="Blueprint pricing estimator. For precise pricing, open a ticket."/>
    <Header title="Blueprint Valuator" subtitle="Tools by ProDSA Services"/>
    <form className="flex flex-col gap-1" onSubmit={(event:FormEvent<HTMLFormElement>)=>{
      event.preventDefault();
      valuate();
    }}>
      <div className="w-full">
        <textarea placeholder="DSA:..." id="inBlueprint" 
        className={`w-full font-nsm ${Themes.BLUE.textCls} ${Themes.BLUE.bgMain}`}></textarea>
      </div>
      <div className="flex gap-1">
        <Select onChange={setType} defaultIdx={defaultModeIdx} className="grow">
          <Option value={estimateTypes.BUILD}>Construction</Option>
          <Option value={estimateTypes.INSURANCE}>Insurance</Option>
        </Select>
        <Button theme={Themes.GREEN}>Estimate pricing!</Button>
      </div>
    </form>
    <div className={`${Themes.BLUE.textCls} border-[2px] p-3 rounded-md`} id="formOut">
      {summaryOut}
    </div>
  </div>
}