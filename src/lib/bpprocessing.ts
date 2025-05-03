'use client';
// import  from '@/lib/dsabp.cjs';
import {Item, Decoder, Encoder, Blueprint, BPCmd, BuildCmd, ConfigCmd, FixedAngle, LoaderConfig, PusherConfig, FilterMode, BuildBits } from './dsabp';

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
  return count;
}

export interface BoMEntry {
  it: Item,
  ct: number,
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
  cmdCt:number,
  RCDCost:number,
  error:boolean
}

let errorSummary = {bom:[], order:[], width:0, height:0, cmdCt:0, RCDCost:0, error:true};

// const starterShip = [
//   {it:Item.HELM_STARTER, ct:1},
//   {it:Item.ITEM_HATCH_STARTER, ct:1},
//   {it:Item.ITEM_EJECTOR, ct:1},
//   {it:Item.TURRET_REMOTE_STARTER, ct:2},
//   {it:Item.THRUSTER_STARTER, ct:2},
//   {it:Item.BLOCK, ct:2},
//   {it:Item.BLOCK_LADDER, ct:3},
//   {it:Item.BLOCK_WALKWAY, ct:2},
//   {it:Item.BLOCK_ITEM_NET, ct:3},
//   {it:Item.EXPANDO_BOX, ct:1},
//   {it:Item.FABRICATOR_STARTER, ct:1},
//   {it:Item.FLUID_TANK, ct:2},
//   {it:Item.NAV_UNIT, ct:1},
// ]

// https://blueyescat.github.io/dsabp-js/

export async function getBlueprintSummary(bString:string, starterQ:boolean) {
  return await getSummaryJSON(bString, starterQ);
}

async function getSummaryJSON(bString:string, starterQ:boolean) : Promise<BPSummary> {
  let currStarter = [
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
  ];
  let itemCt : Map<any, number> = new Map();
  let matsCost = new Map();
  let bp = decode(bString);
  if (bp == null) return errorSummary;
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
  let itemsUsed = 0;
  for (let i=0; i<commands.length; i++) {
    let cmd = commands[i];
    itemsUsed += cmd.count;
    if (starterQ) {
      
      let foundItem = currStarter.find((v:{it:Item, ct:number})=>{return v.it == cmd.item});
      if (foundItem) {
        let delta = Math.min(cmd.count, foundItem.ct);
        cmd.count -= delta;
        foundItem.ct -= delta;
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
    out.push({it: Item.getById(key), ct: matsCost.get(key)!});
    console.log("itemID", Item.getById(key).name, "x", matsCost.get(key))
  }
  return {bom:out, order:commands, width:bp.width!, height:bp.height!, cmdCt:bp.commands!.length, RCDCost:Math.ceil(itemsUsed/10), error:false};
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
  restoreMode:boolean,
  alignExpandoes:boolean
}
Item;

export async function sortByItem(bString:string, config:sortOptions={sortY:false, safeMode:false, restoreMode:false, alignExpandoes:true}) {
  console.log("config=", config);
  let bp = decode(bString);
  if (!bp) return JSON.stringify([]);
  let activeConfig = new ConfigCmd();
  if (bp.commands == null) { // no commands to sort!
    return JSON.stringify({bp:new Encoder().encodeSync(bp)});
  }
  // console.log(Item);

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
      console.log(i1, i2);
      console.log("ERROR ON NULL ITEM", i1.item?.name, i2.item?.name);
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
  let lastBuildCmd : BuildCmd_A = cmds[0] as BuildCmd_A;
  for (let i=0; i<cmds.length; i++) {
    let cmd = cmds[i] as BuildCmd_A;
    if (cmd.item == Item.EXPANDO_BOX && config.alignExpandoes) {
      cmd.currConfig.angle! %= 90;
      if (Math.abs(cmd.currConfig.angle!) < 5) {
        cmd.currConfig.angle = 0;
      }
    }
    if (lastBuildCmd.bits && cmd.bits && cmd.y == lastBuildCmd.y && cmd.item == lastBuildCmd.item && cmd.shape == lastBuildCmd.shape && 
      compatibleItem(cmd.item!, cmd.currConfig, activeConfig)) {
      let dist = 0;
      let x1 = cmd.x!+0.5, x2 = lastBuildCmd.x!+0.5;
      dist = x2>x1 ? x2-x1+lastBuildCmd.bits!.toString().length-1 : x1-x2+cmd.bits!.toString().length-1;
      if (dist <= 64) {
        lastBuildCmd.bits = new BuildBits(
          (x2 > x1) ? cmd.bits!.toString() +zeroes(Math.max(x1, x2)-Math.min(x1, x2)) + lastBuildCmd.bits?.toString()
          : lastBuildCmd.bits!.toString() +zeroes(Math.max(x1, x2)-Math.min(x1, x2)) + lastBuildCmd.bits?.toString()
        ); 
        console.log("optimised!", lastBuildCmd.bits);
        cmds.splice(i, 1);
        i--;
      }

    }
    else if (!configFrag(cmd.item, cmd.currConfig).equals(configFrag(cmd.item, activeConfig))) {
      cmds.splice(i, 0, cmd.currConfig);
      activeConfig = cmd.currConfig;
    }
  }
  bp.commands = cmds;
  return JSON.stringify({bp:new Encoder().encodeSync(bp)});
}

function compatibleItem(it: Item, config1:ConfigCmd, config2:ConfigCmd) {
  return configFrag(it, config1).equals(configFrag(it, config2));
}

function zeroes(n:number) {
  let str = "";
  for (let i=0; i<n; i++) str += "0";
  return str;
}