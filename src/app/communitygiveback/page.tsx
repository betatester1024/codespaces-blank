import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return <div className="flex flex-col gap-3 font-raleway p-3">
    <header className="blue text slideIn">
      <p className="text-4xl slideIn">ProDSA Services <b className="slideIn">Community Giveback</b></p>
      <p>Funding, discounts and more</p>
    </header>
    <div>
      <p className="grey text">ProDSA Community Giveback is available to select new and low-income players.</p>
      <details className="grey text border-2 rounded-md p-2 ">
        <summary className="grey hover active rounded-md cursor-pointer p-2">Eligiblity requirements</summary>
        <ul>
          <li>Your net worth must not exceed 5,000 flux (<Link prefetch={false} href="/networth">Calculator - coming soon</Link>)</li>
          <li>You must not have a history of griefing, scamming etc.</li>
          <li>You must be active in the last 7 days</li>
          <li>Some promotions may not be claimed twice.</li>
        </ul>
      </details>
      <p className="text-lg blue text">Current benefits:</p>
    </div>
    <div className="flex flex-wrap">
      <div className="card">
        <p className="text-lg">Discounted ship construction</p>
        <div className="flex max-md:flex-wrap" >
          <Image className="" src={null}/>
        </div>
      </div>
    </div>
  </div>
}