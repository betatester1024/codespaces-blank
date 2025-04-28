'use server';
// import  from '@/lib/dsabp.cjs';
import {Item, Decoder, Encoder, Blueprint, BPCmd, BuildCmd, ConfigCmd, FixedAngle, LoaderConfig, PusherConfig } from './dsabp';

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

export interface BoMEntry {
  it: string,
  ct: Number,
  link: string
}

function decode(bString:string) {
  let decoder = new Decoder();
  if (bString.length == 0) return null;
  let bp = null;
  try {
    bp = decoder.decodeSync(bString);
  } catch (e) {
    console.log(e);
    return null;
  }
  if (bp.commands == null) return null;
  return bp as Blueprint;
}

// https://blueyescat.github.io/dsabp-js/
export async function getCostSummary(bString:string) {
  let itemCt : Map<any, number> = new Map();
  let matsCost = new Map();
  let bp = decode(bString);
  if (bp == null) return JSON.stringify([]);
  for (const cmd of bp.commands) {
    if (cmd instanceof BuildCmd) {
      // console.log("[C]", cmd.item.name, "cmdsz = ", cmd.bits ? countOnes(cmd.bits.toString()) : 1);
      console.log(cmd.item.name, cmd.bits?.toString());
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
      incr(matsCost, it.id, itemCt.get(key)!);
    }
  }
  let out: BoMEntry[] = [];
  for (let key of matsCost.keys()) {
    out.push({it: Item.getById(key).name, ct: matsCost.get(key)!, link: Item.getById(key).image});
    console.log("itemID", Item.getById(key).name, "x", matsCost.get(key))
  }
  return JSON.stringify(out);
}

function configFrag(item:any, config:ConfigCmd) : ConfigCmd{
  switch (item) {
    case Item.EXPANDO_BOX: 
      return new ConfigCmd({angle: config.angle});
    case Item.SHIELD_GENERATOR:
      return new ConfigCmd({fixedAngle: config.fixedAngle});
    case Item.LOADER:
    case Item.LOADER_NEW:
      return new ConfigCmd({loader: config.loader, filterItems:config.filterItems, filterMode:config.filterMode});
    case Item.ITEM_HATCH:
    case Item.ITEM_HATCH_STARTER:
      return new ConfigCmd({filterItems:config.filterItems, filterMode:config.filterMode});
    case Item.PUSHER:
      return new ConfigCmd({pusher:config.pusher, filterItems:config.filterItems, filterMode:config.filterMode});
    default: 
      return new ConfigCmd();
  }
}

class BuildCmd_A extends BuildCmd {
  currConfig:ConfigCmd; idx:number
};

export async function sortByItem(bString:string) {
  let bp = decode(bString);
  if (!bp) return JSON.stringify([]);
  let activeConfig = new ConfigCmd();
  for (let i=0; i<bp.commands.length; i++) {
    let cmd = bp.commands[i];
    if (cmd instanceof ConfigCmd) {
      activeConfig = cmd;
    }
    else if (cmd instanceof BuildCmd) {
      let bcmd = cmd as BuildCmd_A;
      bcmd.currConfig = activeConfig;
      bcmd.idx = i;
    }
  }
  let cmds = bp.commands as (BuildCmd_A|ConfigCmd)[];
  cmds = cmds.filter((i:any) => {
    if (i instanceof ConfigCmd) {
      console.log(i);
    }
    return i instanceof BuildCmd;
  })
  cmds = cmds.sort((i1:BuildCmd_A|ConfigCmd, i2:BuildCmd_A|ConfigCmd)=>{
    i1 = i1 as BuildCmd_A;
    i2 = i2 as BuildCmd_A;
    if (i1.item == null) console.log(i1);
    if (i1.item.id == i2.item.id) return i1.idx - i2.idx;
    else return i1.item.id - i2.item.id;
  });
  activeConfig = new ConfigCmd;
  for (let i=0; i<cmds.length; i++) {
    let cmd = cmds[i] as BuildCmd_A;
    if (!configFrag(cmd.item, cmd.currConfig).equals(configFrag(cmd.item, activeConfig))) {
      cmds.splice(i, 0, cmd.currConfig);
      activeConfig = cmd.currConfig;
    }
  }
  bp.commands = cmds;
  return JSON.stringify({bp:new Encoder().encodeSync(bp)});
}