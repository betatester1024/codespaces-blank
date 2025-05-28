"use client";

import { Themes } from "@/lib/Themes";
import { Button } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import giftcard from "../../../public/giftcard.png";

export default function Page() {
  return <div className="flex flex-col gap-3 font-raleway p-3">
    <header className="grey text slideIn">
      <p className="blue text text-4xl slideIn">ProDSA Services <b className="slideIn">Community Giveback</b></p>
      <p>Funding, discounts and more</p>
    </header>
    <div className="flex flex-col gap-2">
      <p className="grey text">ProDSA Community Giveback is available to select new and low-income players.</p>
      <details className="w-full grey text border-2 rounded-md p-2 ">
        <summary className="grey hover active rounded-md cursor-pointer p-2">Eligiblity requirements</summary>
        <ul>
          <li>Your net worth must not exceed 5,000 flux (<Link prefetch={false} href="/networth">Calculator - coming soon</Link>)</li>
          <li>You must not have a history of griefing, scamming etc.</li>
          <li>You must be active in the last 7 days</li>
          <li>You must not be an alternate account of another user.</li>
          <li>You must have started at least 30 days ago.</li>
          <li>Some promotions may not be claimed twice.</li>
          <li><b className="red text">Warning: </b>Abuse of the ProDSA Community Giveback system <i>will</i> result in a permanent ban from ProDSA Services.</li>
        </ul>
      </details>
      <Button className="grow" onClick={()=>{window.open("//dsc.gg/order-now", "_blank")}} theme={Themes.GREEN}>Check eligibility and claim benefits now!</Button>
      <p className="text-lg blue text">Current benefits:</p>
    </div>
    <div className="flex flex-wrap gap-3 slideIn">
      <div className="flex gap-2 slideIn card grow" >
        <Image className="lock-content grow min-w-[150px]" src={null}/>
        <div className="grey text grow">
          <p className="text-lg blue text"><b>Discounted or free</b> ship construction</p>
          Typical savings:
          <p>Storages: <b className="slideIn blue text">10-15%* off</b></p>
          <p>Farmers: <b className="slideIn blue text">15-20%* off</b></p>
          <p>Other ships: <b className="slideIn blue text">10-20%* off</b></p>
          <small>*Subject to change. Contact ProDSA Services for precise adjustments. </small>
        </div>
      </div>
      <div className="card slideIn flex gap-2 grow">
        <div className="grey text grow">
          <p className="text-lg blue text"><b>1,000 flux</b>* gift card</p>
          <p>Non-transferrable</p>
          <p>Available to use on <b className="slideIn blue text">all ProDSA services*</b></p>
          <p>Can only be claimed once</p>
          <small>*Subject to change. Contact ProDSA Services for precise adjustments. </small>
        </div>
        <Image className="lock-content grow min-w-[150px]" alt="Farmer with shielding" src={giftcard}/>
      </div>
      <div className="flex gap-2 slideIn card grow" >
        <Image className="lock-content grow min-w-[150px]" src={null}/>
        <div className="grey text grow">
          <p className="text-lg blue text"><b>No monthly fee</b> on insurance</p>
          <p><b>Farm with confidence.</b> Repairs available at all ProDSA ServicePoints.</p>
          <p>Applicable to <b className="blue text">farmers and miners*</b></p>
          <p>2* repairs a month</p>
          <small>*Subject to change. Contact ProDSA Services for precise adjustments. </small>
        </div>
      </div>
      <div className="card slideIn flex gap-2 grow">
        <div className="grey text grow">
          <p className="text-lg blue text"><b>Further support</b></p>
          <p>Contact <Link href="//dsc.gg/order-now" prefetch={false} target="_blank">ProDSA Services!</Link></p>
        </div>
        <Image className="lock-content grow min-w-[150px]" alt="Discounted ship construction." src={null}/>
      </div>
    </div>
     
  </div>
}