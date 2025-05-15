'use client';

import { Item } from "@/lib/dsabp";
import { priceTab, sizeTab } from "@/lib/formcreator";
import { Header, ItemImg, Lister, Themes, Title } from "@/lib/utils";

function f(n:number, dprec:number=1) {
  return n.toLocaleString("en-CA", {maximumFractionDigits:dprec, minimumFractionDigits:dprec})
}

priceTab; // load bearing declaration

export default function Page() {
  let itemCosts = [];
  for (let [it, costData] of priceTab.entries()) {
    if (costData.formattedName == null) continue;
    itemCosts.push([
      <img src={"https://drednot.io/img/"+it.image+".png"}/>,
      <span>{costData.formattedName}</span>,
      <span>{costData.value.toPrecision(3)} flux</span>
    ])
  }

  let sizeCosts = [];
  for (let {cost, szName, sz} of sizeTab) {
    sizeCosts.push([
      <span>{szName} ships ({sz} sq tiles or less)</span>,
      <span>{cost*100}%</span>
    ])
  }

  let otherRates = [
    [<ItemImg>{Item.PAINT}</ItemImg>, <span>Paint, solid colour</span>, <span>0.14117 flux / sq tile</span>],
    [<ItemImg>{Item.PAINT}</ItemImg>, <span>Paint, basic pattern</span>, <span>0.18352 flux / sq tile</span>],
    [<ItemImg>{Item.PAINT}</ItemImg>, <span>Paint, custom design / dredart</span>, <span>20,000 flux flat rate</span>],
    [<ItemImg>{Item.RES_FUEL}</ItemImg>, <span>Ship filling</span>, <span>105% mats cost</span>],
    [<ItemImg>{Item.SCANNER_BLUEPRINT}</ItemImg>, <span>Blueprint transcription</span>, <span>600 flux/hr</span>],
    [<ItemImg>{Item.PAT_WRENCH_FLUX}</ItemImg>, <span>Ship design</span>, <span>800 flux/hr</span>],
    [<ItemImg>{Item.SHIP_EMBIGGENER}</ItemImg>, <span>Ship upgrades</span>, <span>650 flux/hr</span>],
  ];

  return <body className="p-3 flex flex-col gap-2" >
    <Header title="Construction, Repair, Insurance and Design Rates" subtitle="For all BetaOS ProDSA jobs"/>
    <Lister theme={Themes.BLUE} className="border-[2px] p-2 rounded-md" className_c="p-1" colLayout="50px 1fr 1fr">{itemCosts}</Lister>
    <div className="flex gap-1 flex-wrap" style={{gridTemplateColumns:"1fr 1fr", gridTemplateRows:"1fr 1fr 1fr"}}>
      <div className="w-[300px] shrink grow">
        <Title theme={Themes.BLUE}>BetaOS ProDSA Labour Rates</Title>
        <p className={Themes.BLUE.textCls}>For construction requests only / Insurance labour rate capped at <b>15%</b></p>
        <Lister theme={Themes.BLUE} className="border-[2px] rounded-md" className_c="p-1" colLayout="2fr 1fr">{sizeCosts}</Lister>
      </div>
      <div className="w-[500px] shrink grow">
        <Title theme={Themes.BLUE}>Other ProDSA costs</Title>
        <p className={Themes.BLUE.textCls}>All hourly rates have a minimum cost basis of <b>45 mins</b> unless otherwise specified.</p>
        <Lister theme={Themes.BLUE} className="border-[2px] rounded-md" className_c="p-1" colLayout="50px 1fr 1fr">
          {otherRates}
        </Lister>
      </div>
    </div>
  </body>
}