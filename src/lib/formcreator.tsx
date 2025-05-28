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
  [Item.RES_HYPER_RUBBER,       {bThres:1000, value: 0.6,  formattedName:"Rubber"}],
  [Item.BLOCK_ICE_GLASS,        {bThres:2000, value: 1/4,  formattedName:"Ice"}],
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

export function f(n:number, dprec:number=1) {
  return n.toLocaleString("en-CA", {maximumFractionDigits:dprec, minimumFractionDigits:dprec})
}
const errorHTML = <p className={Themes.RED.textCls}>No blueprint summary.</p>;
/**
 *  cost is always mats value + resupply cost and NOT rcd cost 
 */
export function matsCostForm(bpsumm:BPSummary|null, header:boolean, rcdCost:boolean=true) {
  if (!bpsumm || bpsumm.error) {
    return {rawMatsCost:0, otherCosts:{rcd:0, resupply: 0}, form:"No blueprint summary.", html:errorHTML};
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
        totalValue;
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
  out += costBreakdown.slice(0, -1); // remove trailing \n
  out += `\nOther costs:\n-# Bulk resupply cost: ${f(resupplyCost, 2)} flux` 
  if (rcdCost) out += `\nRCD cost: ${bpsumm.RCDCost} flux`;
  return {rawMatsCost:totalValue, otherCosts:{rcd: bpsumm.RCDCost, resupply:resupplyCost}, form:out, html:<>
    {/* <H1>Raw materials cost: {f(totalValue, 2)} flux</H1> */}
    <Lister theme={Themes.BLUE} colLayout="50px 2fr 1fr 2fr" className_c="p-2" className="font-nsm indentleft">
      {list}
    </Lister>
    {/* <p>RCD cost: <b>{bpsumm.RCDCost}</b> flux</p> */}
    <H1>Other costs:</H1>
    { resupplyCost > 0 ?
      <div className="indentleft">
        Bulk resupply cost: <b>{f(resupplyCost, 2)} flux</b>
      </div> : <></>
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
ProDSA Services Labour Cost (15%): VALUE
-# Insurance usage scaler: 0.8
Total: **VALUE**
*/

export const iData = {
  matScl: 0.4,
  rcdScl: 0.5,
  deductibleFrac: 0.6,
}
export function insuranceForm(bpsumm:BPSummary|null, insurancePct:number, insuranceRA:number) {
  if (!bpsumm || bpsumm.error) return {form:"Blueprint summary required!", html:errorHTML}
  let matsCost = matsCostForm(bpsumm, false, false);

  let subtotal = matsCost.rawMatsCost * iData.matScl + matsCost.otherCosts.resupply + bpsumm.RCDCost*iData.rcdScl + insuranceRA;
  let total = subtotal * 1.15 * insurancePct / 100.0;
  let rounding = Math.round(total) - total;
  let out = `## Cost breakdown, insurance form I2
Raw materials cost: ${f(matsCost.rawMatsCost*iData.matScl, 2)} flux
-# Field scale factor: ${iData.matScl}
*Materials cost breakdown, form A1b*
${matsCost.form}
-# Repair accessiblity: ${f(insuranceRA, 2)} flux
RCD cost: ${f(bpsumm.RCDCost*iData.rcdScl, 1)} flux
-# Field scale factor: ${iData.rcdScl}
=====
-# Subtotal: ${f(subtotal, 2)} flux
ProDSA Services Labour Cost (15%): ${f(subtotal*0.15, 3)} flux
-# Insurance usage scaler: ${insurancePct}%
-# Rounding: ${rounding > 0 ? "+"+f(rounding, 3) : f(rounding, 3)} flux
Total insurance cost: **${f(Math.round(total), 3)} flux/mo**
Deductible (${iData.deductibleFrac*100}%) = ${f(total * iData.deductibleFrac, 2)} flux/repair
Details: 5 repairs/mo 
`;
  return {form:out, html:<div className={Themes.BLUE.textCls}>
    <H1>Raw materials cost: {f(matsCost.rawMatsCost*iData.matScl, 2)} flux</H1>
    <small>Field scale factor: {iData.matScl}</small>
    {matsCost.html}
    <div className="indentleft">
      Repair accessibility, typical: <b>{insuranceRA}</b> flux
    </div>
    <p>RCD cost: <b>{f(bpsumm.RCDCost*iData.rcdScl, 1)}</b> flux</p>
    <small>Field scale factor: {iData.rcdScl}</small>
    <p className="font-nsm text-lg"><small>Subtotal: {f(subtotal, 2)} flux</small><br/>
      ProDSA Services Labour Markup (15%): {f(subtotal*0.15, 3)} flux<br/>
      <small>Rounding: {rounding > 0 ? "+"+f(rounding, 3) : f(rounding, 3)} flux</small><br/>
      Total insurance cost: <b className="text-xl">{f(Math.round(total), 3)} flux/mo</b><br/>
      Repair cost: Damage sustained or <b className="text-xl">{f(Math.round(total*iData.deductibleFrac), 3)} flux/repair</b>, whichever is less
    </p>
    <small>Subject to the 
      <div className="ml-1 inline-flex gap-1">
        <Link prefetch={false} href="https://betaos-prodsa.glitch.me/terms" target="_blank">ProDSA Services Terms and Conditions</Link>
        <GIcon theme={Themes.BLUE}>open_in_new</GIcon>
      </div> and the 
      <div className="ml-1 inline-flex gap-1">
        <Link prefetch={false} href="https://discord.com/channels/911997443179151461/1268253949048389682" target="_blank">ProDSA Services Insurance Terms</Link>
        <GIcon theme={Themes.BLUE}>open_in_new</GIcon>
      </div>
    </small>
    <div className={`flex gap-1 text-xl ${Themes.GREEN.textCls}`}>
      <Link prefetch={false} href="https://dsc.gg/ProDSA" target="_blank">Farm with confidence. Insure today with ProDSA Services! </Link>
      <GIcon theme={Themes.BLUE}>open_in_new</GIcon>
    </div>
  </div>}
}


/*
ProDSA Services Labour Rates
Percentages provided for your reference.
Tiny ships (100 sq tiles): 50%
Small ships (100 to 900 sq tiles): 30%
Medium ships (900 to 2,500 sq tiles): 25%
Large ships (>2,500 sq tiles): 20%
Insurance: 15%
*/
export function buildCostForm(bpsumm:BPSummary|null) {
  if (!bpsumm || bpsumm.error) {
    return {cost: 0, form:"No blueprint summary.", html:errorHTML};
  }
  let matsCostData = matsCostForm(bpsumm, false, true);
  let area = bpsumm.height * bpsumm.width;
  let multRate = 999;
  for (let i=0; i<sizeTab.length; i++) {
    if (sizeTab[i].sz > area) {
      multRate = sizeTab[i].cost;
      break;
    }
  }
  let subtotal = matsCostData.rawMatsCost + bpsumm.RCDCost + matsCostData.otherCosts.resupply;
  let totalCost = subtotal * (1+multRate);
  let roundDelta = Math.round(totalCost) - totalCost;
  let htmlOut = <div>
    {/* <p className="font-nsm text-lg">Raw materials cost: {f(matsCostData.cost, 2)} flux</p> */}
    <div className="">{matsCostData.html}</div>
    <hr className="border-[1px] rounded-[1px] mt-2 mb-2"/>
    <p className="font-nsm text-lg"><small>Subtotal: {f(subtotal, 2)} flux</small><br/>
    ProDSA Services Labour Markup ({multRate * 100}%): {f(subtotal * multRate, 3)} flux<br/>
    <small>Rounding: {roundDelta > 0 ? "+"+f(roundDelta, 3) : f(roundDelta, 3)} flux</small><br/>
    Total job cost: <b className="text-xl">{f(Math.round(totalCost), 3)} flux</b></p>
    <small>Subject to the 
      <div className="ml-1 inline-flex gap-1">
        <Link prefetch={false} href="https://betaos-prodsa.glitch.me/terms" target="_blank">ProDSA Services Terms and Conditions</Link>
        <GIcon theme={Themes.BLUE}>open_in_new</GIcon>
      </div>.
    Your minimum deposit is {totalCost > 2500 ? <b>75%</b> : <b>50%</b>}.
    </small>
    <div className={`flex gap-1 text-xl ${Themes.GREEN.textCls}`}>
      <Link prefetch={false} href="https://dsc.gg/ProDSA" target="_blank">Order today from ProDSA Services! </Link>
      <GIcon theme={Themes.BLUE}>open_in_new</GIcon>
    </div>
  </div>;
  let out = `## Cost breakdown
Raw materials cost: ${f(matsCostData.rawMatsCost, 2)} flux
${matsCostData.form}
=====
-# Subtotal: ${f(subtotal, 2)} flux
ProDSA Services Labour Markup (${multRate * 100}%): ${f(subtotal * multRate, 3)} flux
-# Rounding: ${roundDelta > 0 ? "+"+f(roundDelta, 3) : f(roundDelta, 3)} flux
Total job cost: **${f(Math.round(totalCost), 3)} flux**`;
  return {cost: totalCost, form:out, html:htmlOut};
}