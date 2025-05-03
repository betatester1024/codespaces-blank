"use client"; 
import { NodeNextRequest } from "next/dist/server/base-http/node";
import { BPSummary } from "./bpprocessing";
import { Item } from "./dsabp";

interface costData {
  value:number,
  formattedName:string|null,
}
const valuation : Map<Item, costData> = new Map([
  [Item.RES_METAL,        {value: 1/17, formattedName:"Iron"}],
  [Item.RES_GUNPOWDER,    {value: 1/20, formattedName:"Exp"}],
  [Item.RES_FLUX,         {value: 1,    formattedName:"Flux"}],
  [Item.RES_HYPER_RUBBER, {value: 0.8,  formattedName:"Rubber"}],
  [Item.BLOCK_ICE_GLASS,  {value: 1/4,  formattedName:"Ice"}],
  [Item.TURRET_REMOTE,    {value: 2,    formattedName:"Cannon, standard"}],
  [Item.SHIELD_GENERATOR, {value: 3,    formattedName:"Generator"}],
  [Item.SHIELD_PROJECTOR, {value: 16,   formattedName:"Projector"}],
  [Item.TURRET_BURST,     {value: 20,   formattedName:"Cannon, burst"}],
  [Item.TURRET_AUTO,      {value: 50,   formattedName:"Cannon, machine"}],
  [Item.TURRET_OBTUSE,    {value: 20,   formattedName:"Cannon, obtuse"}],
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

function f(n:number, dprec:number=1) {
  return n.toLocaleString("en-CA", {maximumFractionDigits:dprec, minimumFractionDigits:dprec})
}
export function matsCostForm(bpsumm:BPSummary|null, header:boolean) {
  if (!bpsumm || bpsumm.error) {
    return {cost:0, form:"No blueprint summary."};
  }
  let out = "";
  let totalValue = 0;
  let costBreakdown = "";
  for (let entry of bpsumm.bom) {
    console.log(entry.it == Item.NAV_UNIT);
    if (valuation.get(entry.it)) {
      let data = valuation.get(entry.it)!;
      totalValue += data.value * entry.ct;
      if (data.formattedName != null) {
        costBreakdown += "-# "+data.formattedName +" cost: " + f(data.value * entry.ct) + " flux\n";
      }
    }
    else {
      costBreakdown += `**Valuation failure: Item ${entry.it.name}**\n`
    }
  }
  if (header) out += `## Materials cost breakdown, form A1
Total materials cost: ${f(totalValue, 2)} flux\n`;
  out += costBreakdown;
  out += `RCD cost: ${bpsumm.RCDCost} flux`;
  return {cost:totalValue, form:out};
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
    return "No blueprint summary."
  }
  let matsCostData = matsCostForm(bpsumm, false);
  let area = bpsumm.height * bpsumm.width;
  let multRate = 0;
  if (area < 100) multRate = 0.5;
  else if (area <= 900) multRate = 0.3;
  else if (area <= 2500) multRate = 0.25;
  else multRate = 0.2;
  let subtotal = matsCostData.cost + bpsumm.RCDCost;
  let totalCost = subtotal * (1+multRate);
  let roundDelta = Math.round(totalCost) - totalCost;
  let out = `## Cost breakdown
Raw materials cost: ${f(matsCostData.cost, 2)} flux
${matsCostData.form}
=====
-# Subtotal: ${f(subtotal, 2)} flux
BetaOS ProDSA Labour Markup (${multRate * 100}%): ${f(subtotal * multRate, 3)} flux
-# Rounding: ${roundDelta > 0 ? "+"+f(roundDelta, 3) : f(roundDelta, 3)} flux
Total job cost: **${f(Math.round(totalCost), 3)} flux**`;
  return out;
}