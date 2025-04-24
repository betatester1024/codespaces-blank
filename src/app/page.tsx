'use client';

import { useState } from "react";
import { getCostSummary } from "@/lib/bpprocessing";

// const { decode, encode } = require("dsabp-js")
// const dsabp = require("dsabp-js")
// const dsabp = require("@/lib/dsabp");

export default function Page() {
  const [inBlueprint, setInBlueprint] = useState<string>("");

  async function process(event:React.FormEvent<HTMLFormElement>) {
    // whoa there what the hell was that
    event.preventDefault();
    let tArea = (event.target as HTMLFormElement).querySelector("textarea")!;
    console.log("waiting.");
    console.log(await getCostSummary(tArea.value));
    console.log("done");
    // console.log(inBlueprint);
  }
  return (
    <form className="w-100 flex" onSubmit={process}>
      <textarea id="inBlueprint" className="bg-gray-200 rounded" onChange={(e) => setInBlueprint(e.target.value)}></textarea>
      <button type="submit" className="active:bg-gray-300 bg-gray-100 cursor-pointer hover:bg-gray-200">process</button>
    </form>
  )
}
