'use server';
import { Decoder, BuildCmd, Item } from '@/lib/dsabp.cjs';

function incr(map: Map<any, any>, key:any, by:number=1) {
  let found = map.get(key) ?? 0;
  map.set(key, found+by);
}

export async function decode(bString:string) {
  let itemCt = new Map();
  let matsCost = new Map();
  let decoder = new Decoder();
  let bp = await decoder.decodeSync(bString);
  for (const cmd of bp.commands) {
    if (cmd instanceof BuildCmd) {
      console.log(cmd.item.name)
      incr(itemCt, cmd.item);
    }
    for (let key of itemCt.keys()) {
      let it = itemCt.get(key);
      console.log(it);
      if (it.recipe != null) {
        let inputs = it.recipe.input;
        for (let i of inputs) {
          incr(matsCost, i.item, i.count);
        }
      }
      else incr(matsCost, it.id());
    }
    for (let key of matsCost.keys()) {
      console.log("itemID", key, "x", matsCost.get(key))
    }
  }
  return "aie";
}