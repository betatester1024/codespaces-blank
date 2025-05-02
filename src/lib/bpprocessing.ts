'use server';
// import  from '@/lib/dsabp.cjs';
import {Item, Decoder, Encoder, Blueprint, BPCmd, BuildCmd, ConfigCmd, FixedAngle, LoaderConfig, PusherConfig, FilterMode } from './dsabp';

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

export interface BuildEntry {
  item:Item;
  count:number,
  equalsStr:string // 32 pushers = 10x3 +2
};

export interface BPSummary {
  bom:BoMEntry[],
  order:BuildEntry[];
  width:number,
  height:number,
  cmdCt:number
}

const starterShip = [
  {it:Item.HELM_STARTER, ct:1},
  {it:Item.ITEM_HATCH_STARTER, ct:1},
  {it:Item.ITEM_EJECTOR, ct:1},
  {it:Item.TURRET_REMOTE_STARTER, ct:2},
  {it:Item.THRUSTER_STARTER, ct:2},
  {it:Item.BLOCK, ct:2},
  {it:Item.BLOCK_LADDER, ct:3},
  {it:Item.BLOCK_WALKWAY, ct:2},
  {it:Item.BLOCK_ITEM_NET, ct:3},
  {it:Item.EXPANDO_BOX, ct:1},
  {it:Item.FABRICATOR_STARTER, ct:1},
  {it:Item.FLUID_TANK, ct:2},
  {it:Item.NAV_UNIT, ct:1},
]

// https://blueyescat.github.io/dsabp-js/

export async function getBlueprintSummary(bString:string, starterQ:boolean) {
  return JSON.stringify(await getSummaryJSON(bString, starterQ));
}

async function getSummaryJSON(bString:string, starterQ:boolean) : Promise<BPSummary> {
  let itemCt : Map<any, number> = new Map();
  let matsCost = new Map();
  let bp = decode(bString);
  if (bp == null) return {bom:[], order:[], width:0, height:0, cmdCt:0};
  let commands:BuildEntry[] = [];
  for (const cmd of bp.commands!) {
    if (cmd instanceof BuildCmd) {
      if (cmd.item == null) continue;
      // console.log("[C]", cmd.item.name, "cmdsz = ", cmd.bits ? countOnes(cmd.bits.toString()) : 1);
      let blockCt = cmd.bits != null ? countOnes(cmd.bits.toString()) : 1;
      if (commands.length != 0 && cmd.item == commands[commands.length-1].item) {
        commands[commands.length-1].count += blockCt;
      }
      else {
        commands.push({item:cmd.item, count:blockCt, equalsStr:""});
      }
      incr(itemCt, cmd.item, blockCt);
    }
  }
  for (let i=0; i<commands.length; i++) {
    let cmd = commands[i];
    if (starterQ) {
      let foundItem = starterShip.find((v:{it:Item, ct:number})=>{return v.it == cmd.item});
      if (foundItem) {
        cmd.count -= foundItem.ct;
        cmd.count = Math.max(0, cmd.count);
      }
    }
    if (cmd.item == Item.PUSHER || cmd.item == Item.ITEM_HATCH || cmd.item == Item.LOADER_NEW || cmd.item == Item.LOADER) {
      cmd.equalsStr = `=${Math.floor(cmd.count/3)}x3${cmd.count % 3 == 0 ? "" : "+"+cmd.count % 3}`;
    }
    else if (cmd.item.stackable && cmd.count > 16) {
      cmd.equalsStr = `~${Math.ceil(cmd.count/16)}stk`;
    }
    else {
      cmd.equalsStr = "";
    }
    
  }
  for (let key of itemCt.keys()) {
    let it = key;
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
    out.push({it: Item.getById(key).name, ct: matsCost.get(key)!, link: Item.getById(key).image!});
    console.log("itemID", Item.getById(key).name, "x", matsCost.get(key))
  }
  return {bom:out, order:commands, width:bp.width!, height:bp.height!, cmdCt:bp.commands!.length};
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

class BuildCmd_A extends BuildCmd 
{
  currConfig:ConfigCmd = new ConfigCmd(); 
  idx:number = 0;
};

export interface sortOptions {
  sortY:boolean,
  safeMode:boolean,
  restoreMode:boolean
}

export async function sortByItem(bString:string, config:sortOptions={sortY:false, safeMode:false, restoreMode:false}) {
  console.log("config=", config);
  let bp = decode(bString);
  if (!bp) return JSON.stringify([]);
  let activeConfig = new ConfigCmd();
  if (bp.commands == null) { // no commands to sort!
    return JSON.stringify({bp:new Encoder().encodeSync(bp)});
  }

  // store the active configuration for every command to be compressed later
  for (let i=0; i<bp.commands.length; i++) {
    let cmd = bp.commands[i];
    if (cmd instanceof ConfigCmd) {
      if (config.safeMode) {
        cmd.filterMode = FilterMode.BLOCK_ALL;
        cmd.pusher = {maxBeamLength:0};
      }
      activeConfig = cmd;
    }
    else if (cmd instanceof BuildCmd) {
      let bcmd = cmd as BuildCmd_A;
      bcmd.currConfig = activeConfig;
      bcmd.idx = i;
    }
  }
  let cmds = bp.commands as (BuildCmd_A|ConfigCmd)[];
  // remove all (now-redundant) config commands
  cmds = cmds.filter((i:any) => {
    if (i instanceof BuildCmd) {
      if (config.restoreMode) 
        return i.item == Item.LOADER_NEW || i.item == Item.PUSHER || 
               i.item == Item.ITEM_HATCH || i.item == Item.ITEM_HATCH_STARTER ||
               i.item == Item.LOADER;
      else return true;
    }
    else return false;
  })
  // sort build commands by item, then by order
  cmds = cmds.sort((i1:BuildCmd_A|ConfigCmd, i2:BuildCmd_A|ConfigCmd)=>{
    i1 = i1 as BuildCmd_A;
    i2 = i2 as BuildCmd_A;
    if (i1.item == null || i2.item == null) {
      console.log("ERROR ON NULL ITEM", i1, i2);
      return -1;
    } 
    if (i1.item.id == i2.item.id) {
      if (config.sortY && i1.y! != i2.y!) {
        return i1.y! - i2.y!;
      }
      return i1.idx - i2.idx;
    }
    else return i1.item.id - i2.item.id;
  });
  activeConfig = new ConfigCmd();
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