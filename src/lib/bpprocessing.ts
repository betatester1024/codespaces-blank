'use server';
import { Decoder, BuildCmd, Item } from '@/lib/dsabp.cjs';

function incr(map: Map<any, any>, key:any, by:number=1) {
  let found = map.get(key) ?? 0;
  map.set(key, found+by);
}

// const zero:BigInt = BigInt(0);
// const one :BigInt = BigInt(1);
function countOnes(v: string) {
  let count = 0;
  for (let i=0; i<v.length; i++) {
    if (v.charAt(i) === '1') {
      count++;
    }
  }
  // while (v != 0n) {
  //   count += v & 1n;
  //   v >>= 1n;
  // }
  return count;
  // console.log("v=", v);
  // let bits = 0; // Use bigint for bits
  // while (v !== zero) {
  //   if (BigInt(one & v) != (zero)) {
  //     bits++;
  //   }
  //   v >>= one; // No need for explicit casting
  // }
  // console.log(Number(bits)); // Convert to number for logging
  // return Number(bits); // Return as number
}



// https://blueyescat.github.io/dsabp-js/
export async function getCostSummary(bString:string) {
  let itemCt : Map<any, number> = new Map();
  let matsCost = new Map();
  let decoder = new Decoder();
  let bp = await decoder.decodeSync(bString);
  for (const cmd of bp.commands) {
    if (cmd instanceof BuildCmd) {
      // console.log("[C]", cmd.item.name, "cmdsz = ", cmd.bits ? countOnes(cmd.bits.toString()) : 1);
      incr(itemCt, cmd.item, cmd.bits != null ? countOnes(cmd.bits.toString()) : 1);
    }
  }
  console.log("\n\n");
  for (let key of itemCt.keys()) {
    let it = key;
    console.log(it.name, "+", itemCt.get(key));
    if (it.recipe != null) {
      let inputs = it.recipe.input;
      for (let i of inputs) {
        incr(matsCost, i.item, i.count * itemCt.get(key)!);
      }
    }
    else {
      // if (typeof it.id != "function") {
      //   // console.log("ITEM:", it, it.id);
      // }
      incr(matsCost, it.id, itemCt.get(key)!);
    }
  }
  let out: {
    it: string,
    ct: Number,
    link: string
  }[] = [];
  for (let key of matsCost.keys()) {
    out.push({it: Item.getById(key).name, ct: matsCost.get(key)!, link: Item.getById(key).image});
    // console.log("itemID", Item.getById(key).name, "x", matsCost.get(key))
  }
  return JSON.stringify(out);
}