"use client";

import Link from "next/link";
import { ReactNode } from "react";

export function Section(props:{title:string, className?:string, children:ReactNode}) {
  return <div className={"w-full  darkgrey text mb-2 "+(props.className??"")} id={props.title.toLowerCase()}>
    <h1 className="text-xl font-bold blue text text-raleway">{props.title}</h1>
    <kbd className="pl-2 block whitespace-pre-line font-nsm">{props.children}</kbd>
  </div>;
}

export default function Page() {
  
   return  <div className="p-5 font-raleway">
    <title>ProDSA Services: General Terms and Conditions</title>
    <meta name="description" content="Please read these terms carefully, as they govern your relationship with ProDSA Services."/>
    <header className="slideIn font-raleway blue text mb-3">
      <div className="text-4xl"><b>ProDSA Services</b> Terms and Conditions</div>
      <p className="slideIn grey text">Last updated June 19, 2025.</p>
    </header>
    <Section title="Modifications">
      The ProDSA Services Terms and Conditions may be modified at any time, without notice.
    </Section>
    <Section title="Definitions">
      A <b>Request</b> is any request for a ProDSA Service, including, but not limited to: Shipbuilding; repairs; paint; insurance.<br/>
      A <b>Cancelled request</b> is any Request that was cancelled by either ProDSA Services or the author before work has started on it.<br/>
      <b>Aborted Work</b> is any Request that was cancelled by either ProDSA Services or the author after work has started.<br/>
    </Section>
    <Section title="Pre-construction">
      If a ship is provided, ship ownership MUST be transferred before construction may start.<br/>
      ProDSA Services may require you to pay a deposit before construction begins. This deposit is partially refundable.<br/>
      Cancelled requests will be subject to a full refund.<br/>
      ProDSA Services may refuse any Request.<br/>
      ProDSA Services has the right to refuse service to any user.<br/>
    </Section>
    <Section title="Construction">
      <i>ProDSA Services does NOT guarantee completion schedules.</i><br/>
      ProDSA Services will not transfer ownership of any ships until full payment is received.<br/>
      Payment for Aborted work may be be fully refunded, and will be reviewed on a case-by-case basis. <br/>
      The job queue may be modified at any time.<br/>
      ProDSA Services guarantees that "Maximum Priority" jobs will be completed before "Rush" jobs, and that "Rush" jobs will be completed before other jobs.<br/>
      ProDSA Services may modify job pricing during construction. In this scenario, ProDSA Services will contact the user to establish an agreement.<br/>
      Jobs may be suspended while an agreement is pending.<br/>
      <i>JOBS MAY BE CANCELLED FOR ANY REASON AT BETAOS SERVICES DISCRETION.</i>
    </Section>
    <Section title="Licensing">
      Unless otherwise specified, The User releases their blueprint string or any other provided intellectual property to ProDSA Services to use as they see fit.<br/>
    </Section>
    <Section title="Payment">
      Completed Requests that are not paid for within 7 days (or otherwise agreed upon) may be liquidated or sold at ProDSA Services discretion.<br/>
      An additional fee may be charged for late payments.<br/>
      To avoid payment penalties, ensure that you have an active contact method registered with ProDSA Services.<br/>
      Follow the <Link href="/paymentpolicy" prefetch={false}>Payment Policy</Link> to ensure your payment is processed.<br/>
    </Section>
    <Section title="Disclaimer">
      ALL ProDSA Services JOBS ARE PROVIDED "AS-IS" WITH NO EXPLICIT WARRANTY FOR FITNESS OF USE. 
    </Section>
  </div>
}