'use client';

import { useState } from "react";

// const { decode, encode } = require("dsabp-js")
// const dsabp = require("dsabp-js")
import * as dsabp from '@/lib/dsabp';

export default function Page() {
  const [inBlueprint, setInBlueprint] = useState<string>("");

  async function process(event:React.FormEvent<HTMLFormElement>) {
    // whoa there what the hell was that
    event.preventDefault();
    console.log("waiting.");
    console.log(await dsabp.decode(inBlueprint));
    // console.log(inBlueprint);
  }
  return (
    <form className="w-100 flex" onSubmit={process}>
      <textarea id="inBlueprint" className="bg-gray-200 rounded" onChange={(e) => setInBlueprint(e.target.value)}></textarea>
      <button type="submit" className="active:bg-gray-300 bg-gray-100 cursor-pointer hover:bg-gray-200">process</button>
    </form>
  )
  // let out = {
  //   bodyCtn:(
  //     <form className="w-100 flex" action="javascript:process()">

  //       <textarea id="inBlueprint"></textarea> 
  //       <button>process</button>
  //     </form>
  //   ), 
  //   headCtn:(
  //     <script src="./script.js"></script>
  //   )
  // };
  // console.log(out);
  // return out;
}
