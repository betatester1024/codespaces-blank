"use client"; 
import { ReactNode } from "react";
import Link from "next/link";

import { BPSummary } from "./bpprocessing";
import { Item } from "./dsabp";
import { GIcon, Lister } from "./utils";
import { Themes } from "./Themes";

interface costData {
  value:number,
  formattedName:string|null,
}
export const priceTab : Map<Item, costData> = new Map([
  [Item.RES_METAL,        {value: 1/17, formattedName:"Iron"}],
  [Item.RES_GUNPOWDER,    {value: 1/20, formattedName:"Explosives"}],
  [Item.RES_FLUX,         {value: 1,    formattedName:"Flux"}],
  [Item.RES_HYPER_RUBBER, {value: 0.8,  formattedName:"Rubber"}],
  [Item.BLOCK_ICE_GLASS,  {value: 1/4,  formattedName:"Ice"}],
  [Item.SHIELD_GENERATOR, {value: 3,    formattedName:"Generator"}],
  [Item.SHIELD_PROJECTOR, {value: 16,   formattedName:"Projector"}],
  [Item.TURRET_REMOTE,    {value: 2,    formattedName:"Cannon, standard"}],
  [Item.TURRET_BURST,     {value: 20,   formattedName:"Cannon, burst"}],
  [Item.TURRET_AUTO,      {value: 50,   formattedName:"Cannon, machine"}],
  [Item.TURRET_OBTUSE,    {value: 20,   formattedName:"Cannon, obtuse"}],
  [Item.TURRET_ACUTE,     {value: 20,   formattedName:"Cannon, acute"}],
  [Item.TURRET_CONTROLLER_NEW, {value: 3, formattedName:"Controller, turret"}],
  [Item.MUNITIONS_SUPPLY_UNIT, {value: 2, formattedName:"MSU"}],
  [Item.HELM_STARTER,     {value: 0,    formattedName:null}],
  [Item.WRENCH_STARTER,   {value: 0,    formattedName:null}],
  [Item.THRUSTER_STARTER, {value: 0,    formattedName:null}],
  [Item.FABRICATOR_STARTER,    {value: 0, formattedName:null}],
  [Item.ITEM_HATCH_STARTER,    {value: 0, formattedName:null}],
  [Item.TURRET_REMOTE_STARTER, {value: 0, formattedName:null}],
  [Item.NAV_UNIT, {value: 0, formattedName:null}],
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
  let costBreakdown = "";
  for (let entry of bpsumm.bom) {
    if (priceTab.get(entry.it)) {
      let data = priceTab.get(entry.it)!;
      totalValue += data.value * entry.ct;
      if (data.formattedName != null) {
        costBreakdown += "-# "+data.formattedName +" cost: " + f(data.value * entry.ct) + " flux\n";
        list.push([
          <img src={"https://drednot.io/img/"+entry.it.image+".png"}/>,
          <span>{entry.it.name}</span>,
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
  return {cost:totalValue, form:out, html:<>
    <Lister theme={Themes.BLUE} colLayout="50px 2fr 1fr 2fr" className_c="p-2" className="font-nsm">
      {list}
    </Lister>
  </>};
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
  let matsCostData = matsCostForm(bpsumm, false);
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
    <p className="font-nsm text-lg">Raw materials cost: {f(matsCostData.cost, 2)} flux</p>
    <div className="pl-1 m-1 border-l-[3px] rounded-[3px]">{matsCostData.html}</div>
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