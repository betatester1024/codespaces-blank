"use client"; 
import { ReactNode } from "react";
import Link from "next/link";

import { BPSummary } from "./bpprocessing";
import { Item } from "./dsabp";
import { GIcon, H1, Lister } from "./utils";
import { Themes } from "./Themes";

interface costData {
  value:number,
  formattedName:string|null,
  bThres:number
}
export const priceTab : Map<Item, costData> = new Map([
  [Item.RES_METAL,              {bThres:-1,   value: 1/17, formattedName:"Iron"}],
  [Item.RES_GUNPOWDER,          {bThres:-1,   value: 1/20, formattedName:"Explosives"}],
  [Item.RES_FLUX,               {bThres:-1,   value: 1,    formattedName:"Flux"}],
  [Item.RES_HYPER_RUBBER,       {bThres:1000, value: 0.8,  formattedName:"Rubber"}],
  [Item.BLOCK_ICE_GLASS,        {bThres:2.000, value: 1/4,  formattedName:"Ice"}],
  [Item.SHIELD_GENERATOR,       {bThres:50,   value: 3,    formattedName:"Generator"}],
  [Item.SHIELD_PROJECTOR,       {bThres:50,   value: 16,   formattedName:"Projector"}],
  [Item.TURRET_REMOTE,          {bThres:100,  value: 2,    formattedName:"Cannon, standard"}],
  [Item.TURRET_BURST,           {bThres:30,   value: 20,   formattedName:"Cannon, burst"}],
  [Item.TURRET_AUTO,            {bThres:30,   value: 50,   formattedName:"Cannon, machine"}],
  [Item.TURRET_OBTUSE,          {bThres:30,   value: 20,   formattedName:"Cannon, obtuse"}],
  [Item.TURRET_ACUTE,           {bThres:30, value: 20,   formattedName:"Cannon, acute"}],
  [Item.TURRET_CONTROLLER_NEW,  {bThres:20, value: 3, formattedName:"Controller, turret"}],
  [Item.MUNITIONS_SUPPLY_UNIT,  {bThres:50, value: 2, formattedName:"MSU"}],
  [Item.HELM_STARTER,           {bThres:-1, value: 0,    formattedName:null}],
  [Item.WRENCH_STARTER,         {bThres:-1, value: 0,    formattedName:null}],
  [Item.THRUSTER_STARTER,       {bThres:-1, value: 0,    formattedName:null}],
  [Item.FABRICATOR_STARTER,     {bThres:-1, value: 0, formattedName:null}],
  [Item.ITEM_HATCH_STARTER,     {bThres:-1, value: 0, formattedName:null}],
  [Item.TURRET_REMOTE_STARTER,  {bThres:-1, value: 0, formattedName:null}],
  [Item.NAV_UNIT, {bThres:-1, value: 0, formattedName:null}],
]);

export const sizeTab = [
  {sz: 100, cost: 0.5, szName:"Tiny"},
  {sz: 900, cost: 0.3, szName:"Small"},
  {sz: 2500, cost:0.25, szName:"Medium"},
  {sz: 6401, cost: 0.2, szName:"Large"}
]

function f(n:number, dprec:number=1) {
  return n.toLocaleString("en-CA", {maximumFractionDigits:dprec, minimumFractionDigits:dprec})
}
export function matsCostForm(bpsumm:BPSummary|null, header:boolean) {
  if (!bpsumm || bpsumm.error) {
    return {cost:0, form:"No blueprint summary.", html:<p className={Themes.RED.textCls}>No blueprint summary.</p>};
  }
  let out = "";
  let list : ReactNode[][] = [];
  let totalValue = 0;
  let resupplyCost = 0;
  let costBreakdown = "";
  for (let entry of bpsumm.bom) {
    if (priceTab.get(entry.it)) {
      let data = priceTab.get(entry.it)!;
      totalValue += data.value * entry.ct;
      let resup = false;
      if (entry.ct > data.bThres && data.bThres > 0) {
        costBreakdown += "-# Bulk resupply cost incurred for entry below:\n";
        resup = true;
        resupplyCost += 100;
        totalValue += 100;
      }
      if (data.formattedName != null) {
        costBreakdown += "-# "+data.formattedName +" cost: " + f(data.value * entry.ct) + " flux\n";
        list.push([
          <img src={"https://drednot.io/img/"+entry.it.image+".png"}/>,
          <span>{entry.it.name + (resup ? " (Bulk resupply cost incurred, 100 flux)": "") }</span>,
          <span>{f(entry.ct)}</span>,
          <b> ={f(data.value*entry.ct)} flux</b>
        ]);
      }
    }
    else {
      costBreakdown += `**Valuation failure: Item ${entry.it.name}**\n`
      list.push([
        <p className={Themes.RED.textCls}>Valuation failure</p>,
        <b>{entry.it.name}</b>
      ])
    }
  }
  if (header) out += `## Materials cost breakdown, form A1
Total materials cost: ${f(totalValue, 2)} flux\n`;
  out += costBreakdown;
  out += `RCD cost: ${bpsumm.RCDCost} flux`;
  if (resupplyCost > 0) out += `\nOther costs:\n-# Bulk resupply cost: ${f(resupplyCost, 2)} flux` 
  return {cost:totalValue+resupplyCost, form:out, html:<>
    {header ? <H1>Raw materials cost: {f(totalValue, 2)} flux</H1>: <></>}
    <Lister theme={Themes.BLUE} colLayout="50px 2fr 1fr 2fr" className_c="p-2" className="font-nsm indentleft">
      {list}
    </Lister>
    <p>RCD cost: <b>{bpsumm.RCDCost}</b> flux</p>
    { 
    resupplyCost > 0 ?<>
      <H1>Other costs:</H1>
      <div className="indentleft">
        Bulk resupply cost: <b>{f(resupplyCost, 2)} flux</b>
      </div></>
    : <></>
    }
  </>};
}

/*
## Cost breakdown, insurance form I2
Raw materials cost: VALUE
-# Field scale factor: 0.3
**Attach a materials cost form A1 here**
**<:warn:1036762036820004905>Update RCD cost to scale factor**
-# Field scale factor: 0.25
Other costs: VALUE
-# Scale factor: 0.5
-# Non-RCDables: VALUE
-# Repair accessiblity: VALUE
=====
BetaOS ProDSA Labour Cost (15%): VALUE
-# Insurance usage scaler: 0.8
Total: **VALUE**
*/
export function insuranceForm(bpsumm:BPSummary|null) {
  
}


/*
BetaOS ProDSA Labour Rates
Percentages provided for your reference.
Tiny ships (100 sq tiles): 50%
Small ships (100 to 900 sq tiles): 30%
Medium ships (900 to 2,500 sq tiles): 25%
Large ships (>2,500 sq tiles): 20%
Insurance: 15%
*/
export function buildCostForm(bpsumm:BPSummary|null) {
  if (!bpsumm || bpsumm.error) {
    return {cost: 0, form:"No blueprint summary.", html:<p className={Themes.RED.textCls}>No blueprint summary.</p>};
  }
  let matsCostData = matsCostForm(bpsumm, true);
  let area = bpsumm.height * bpsumm.width;
  let multRate = 999;
  for (let i=0; i<sizeTab.length; i++) {
    if (sizeTab[i].sz > area) {
      multRate = sizeTab[i].cost;
      break;
    }
  }
  let subtotal = matsCostData.cost + bpsumm.RCDCost;
  let totalCost = subtotal * (1+multRate);
  let roundDelta = Math.round(totalCost) - totalCost;
  let htmlOut = <div>
    {/* <p className="font-nsm text-lg">Raw materials cost: {f(matsCostData.cost, 2)} flux</p> */}
    <div className="">{matsCostData.html}</div>
    <hr className="border-[1px] rounded-[1px] mt-2 mb-2"/>
    <p className="font-nsm text-lg"><small>Subtotal: {f(subtotal, 2)} flux</small><br/>
    BetaOS ProDSA Labour Markup ({multRate * 100}%): {f(subtotal * multRate, 3)} flux<br/>
    <small>Rounding: {roundDelta > 0 ? "+"+f(roundDelta, 3) : f(roundDelta, 3)} flux</small><br/>
    Total job cost: <b className="text-xl">{f(Math.round(totalCost), 3)} flux</b></p>
    <small>Subject to the 
      <div className="ml-1 inline-flex gap-1">
        <Link href="https://betaos-prodsa.glitch.me/terms" target="_blank">BetaOS ProDSA Terms and Conditions</Link>
        <GIcon theme={Themes.BLUE}>open_in_new</GIcon>
      </div>.
    Your minimum deposit is {totalCost > 2500 ? <b>75%</b> : <b>50%</b>}.
    </small>
    <div className="flex gap-1">
      <Link href="https://dsc.gg/ProDSA" target="_blank">Order today from BetaOS ProDSA! </Link>
      <GIcon theme={Themes.BLUE}>open_in_new</GIcon>
    </div>
  </div>;
  let out = `## Cost breakdown
Raw materials cost: ${f(matsCostData.cost, 2)} flux
${matsCostData.form}
=====
-# Subtotal: ${f(subtotal, 2)} flux
BetaOS ProDSA Labour Markup (${multRate * 100}%): ${f(subtotal * multRate, 3)} flux
-# Rounding: ${roundDelta > 0 ? "+"+f(roundDelta, 3) : f(roundDelta, 3)} flux
Total job cost: **${f(Math.round(totalCost), 3)} flux**`;
  return {cost: totalCost, form:out, html:htmlOut};
}