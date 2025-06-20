"use client";

import Image from "next/image";
import policy1 from "../../../public/paymentpolicy/policy1.webp";
import policy2 from "../../../public/paymentpolicy/policy2.webp";
import { Section } from "../terms/page";

export default function Page() {
   return  <div className="p-5 font-raleway">
    <title>ProDSA Services Payment Policy</title>
    <meta name="description" content="ProDSA Services Payment Policy"/>
    <header className="slideIn font-raleway blue text mb-3">
      <div className="text-4xl">ProDSA Services <b>Payment Policy</b></div>
      <p className="slideIn grey text">Please follow these instructions to ensure your payment is processed.</p>
    </header>
    <Section title="How to submit payment" className="flex flex-col gap-2">
      <p>
        To ensure your payment has been processed, please take a screenshot of the flux value of the DumpSafe location with the existing flux value and you saying today's date, and a second screenshot of the flux value of the DumpSafe location with the updated flux value.<br/>
        Ensure that your transaction was acknowledged. Contact ProDSA Services if this is not the case. 
      </p>
      <div className="subgridparent rounded-md outline-2 text blue p-3 mt-3 gap-2">
        <span>Before</span>
        <span>After (payment logged = 336 - 16 = <b>320</b> flux)</span>
        <Image src={policy1} className="lock-content grow !h-[300px]" alt="Payment, step 1"/>
        
        <Image src={policy2} className="lock-content grow !h-[300px]" alt="Payment, step 2"/>
      </div>
    </Section>
  </div>
}