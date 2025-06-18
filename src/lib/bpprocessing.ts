'use client';
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
  error:string|undefined
}

let errorSummary = {bom:[], order:[], width:0, height:0, cmdCt:0, RCDCost:0, error:"Blueprint decode error."};

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

// export async function getBlueprintSummary(bString:string, starterQ:boolean) {
//   return await getSummaryJSON(bString, starterQ);
// }

function getBuildEntries(bp:Blueprint) {
  let itemCt : Map<Item, number> = new Map();
  let commands : BuildEntry[] = [];
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
  return {commands:commands, itemCt:itemCt};
}

export async function getSummaryJSON(bString:string, starterQ:boolean, subtractBP:string) : Promise<BPSummary> {
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
  let matsCost = new Map();
  if (bString == "") return {bom:[],order:[], width:0, height:0, cmdCt:0, RCDCost:0, error:"Blueprint processing error."};
  let bp = decode(bString);
  if (bp == null) return errorSummary;

  let {commands, itemCt} = getBuildEntries(bp);
  

  let subtractMode = true;
  let bp2 = decode(subtractBP);
  if (!bp2) subtractMode = false; 
  // let sCommands : BuildCmd_A[] = [];
  // if (subtractMode) sCommands = addConfigInfo(bp2!.commands!, noConfig) as BuildCmd_A[];
 
  let out: BoMEntry[] = [];
  
  if (subtractMode) {
    let sCommands = getBuildEntries(bp2!).commands;
    for (let sCmd of sCommands) {
      if (sCmd.count == 0) continue;
      // remove from applicable build order
      for (let cmd of commands) {
        if (cmd.item == sCmd.item) { // don't even bother to check shape
          let delta = Math.min(cmd.count, sCmd.count);
          cmd.count -= delta;
          sCmd.count -= delta;
          let iCt = itemCt.get(cmd.item);
          itemCt.set(cmd.item, iCt - delta);
        }
      }
    } // all sub commands
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
        let iCt = itemCt.get(cmd.item);
        itemCt.set(cmd.item, iCt - delta);
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
  let rcdcost = Math.ceil(itemsUsed/10);
  commands.unshift({count:rcdcost, equalsStr:rcdcost < 16 ? "" : `~${Math.ceil(rcdcost/16)}stk`, item:Item.RES_FLUX});
  
  let loaderIdx = commands.findIndex((it:BuildEntry)=>{return (it.item == Item.LOADER_NEW);});
  if (loaderIdx >= 0) {
    commands.splice(loaderIdx, 0, {count: 0, equalsStr:"Place doors, launchers and other non-RCDables here...", item:Item.DOOR});
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
  for (let key of matsCost.keys()) {
    out.push({it: Item.getById(key), ct: matsCost.get(key)!});
    // console.log("itemID", Item.getById(key).name, "x", matsCost.get(key))
  }

  // remove from bom
  // if (subtractMode) {
  //   let sCommands = getBuildEntries(bp2!).commands;
  //   for (let sCmd of sCommands) {
  //     let idx = out.findIndex((e:BoMEntry)=>{return e.it ==sCmd.item});
  //     if (idx > 0) {
  //       out[idx].ct -= sCmd.count;
  //     }
  //     else console.log("error in removing bom item", sCmd.item);
  //   }
  // }
  return {bom:out, order:commands, width:bp.width!, height:bp.height!, cmdCt:bp.commands!.length, RCDCost:rcdcost, error:undefined};
}

function configFrag(item:any, config:ConfigCmd) : ConfigCmd{
  switch (item) {
    case Item.EXPANDO_BOX: 
      return new ConfigCmd({angle: config.angle});
    case Item.SHIELD_GENERATOR:
    case Item.ITEM_EJECTOR:
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

export interface sortConfig {
  sortY:boolean,
  safeMode:boolean,
  restoreMode:boolean,
  alignExpandoes:boolean,
  firstItems:Item[],
  lastItems:Item[],
}

const noConfig: sortConfig = {
  sortY:false,
  safeMode:false,
  restoreMode:false,
  alignExpandoes:false,
  firstItems:[],
  lastItems:[]
}

interface Coord {
  x:number, y:number;
}

// prevent the stupid minimiser from optimising out my stupid code when it's not MEANT TO
Item;

function addConfigInfo(inCmds:BPCmd[], config:sortConfig) {
  let activeConfig = new ConfigCmd();
  for (let i=0; i<inCmds.length; i++) {
    let cmd = inCmds[i];
    if (cmd instanceof ConfigCmd) {
      activeConfig = cmd;
    }
    else if (cmd instanceof BuildCmd) {
      let bcmd = cmd as BuildCmd_A;
      bcmd.currConfig = activeConfig;
      if (config.safeMode && bcmd.item != Item.PUSHER) {
        bcmd.currConfig.filterMode = FilterMode.BLOCK_ALL;
        // cmd.pusher = {maxBeamLength:0};
      }
      bcmd.idx = i;
    }
  }
  let cmds = inCmds as (BuildCmd_A|ConfigCmd)[];
  cmds = cmds.filter((i:any) => {
    if (i instanceof BuildCmd) {
      return true;
    }
    else return false;
  })
  return cmds;
}

export async function sortByItem(bString:string, config:sortConfig=noConfig) : Promise<{bps:string[], combined:string}> {
  console.log("config=", config);
  let bp = decode(bString);
  if (!bp) return {bps:[""], combined:""};

  if (bp.commands == null) { // no commands to sort!
    let out = new Encoder().encodeSync(bp);
    return {bps:[out], combined:out};
  }
  // console.log(Item);

  // store the active configuration for every command to be compressed later
  let cmds = addConfigInfo(bp.commands, config);
  let cmds2 : BuildCmd_A[] = [];
  if (config.restoreMode) 
    cmds = cmds.filter((i:any) => {
      return i.item == Item.LOADER_NEW || 
              i.item == Item.ITEM_HATCH || i.item == Item.ITEM_HATCH_STARTER ||
              i.item == Item.LOADER;
    })
  // remove all (now-redundant) config commands
  console.log(cmds);
  let coordMap = new Map<Coord, BuildCmd_A[]>()
  for (let cmd of cmds) {
    cmd = cmd as BuildCmd_A;
    let found = coordMap.get({x:cmd.x!, y:cmd.y!});
    if (found == undefined) found = [cmd];
    else found.push(cmd);
  }

  // cmds = [];
  // for (let c of coordMap.values()) {
  //   cmds.concat(c);
  // }
  // sort build commands by item, then by order
  cmds = cmds.sort((i1:BuildCmd_A|ConfigCmd, i2:BuildCmd_A|ConfigCmd)=>{
    i1 = i1 as BuildCmd_A;
    i2 = i2 as BuildCmd_A;
    if (i1.item == null || i2.item == null) {
      console.log(i1, i2);
      console.log("ERROR ON NULL ITEM", i1.item?.name, i2.item?.name);
      return -1;
    } 

    let idxF1 = config.firstItems.indexOf(i1.item!);
    let idxF2 = config.firstItems.indexOf(i2.item!);
    let idxL1 = config.lastItems.indexOf(i1.item!);
    let idxL2 = config.lastItems.indexOf(i2.item!);
    if (idxF1 >= 0 && idxF2 < 0) {
      return -1;
    }
    else if (idxF1 >= 0 && idxF2 >= 0 && idxF1 != idxF2) {
      return idxF1 - idxF2;
    }
    else if (idxF1 < 0 && idxF2 >= 0) {
      return 1;
    }
    else if (idxL1 >= 0 && idxL2 < 0) {
      return 1;
    }
    else if (idxL1 >= 0 && idxL2 >= 0 && idxL1 != idxL2) {
      return idxL1 - idxL2;
    }
    else if (idxL1 < 0 && idxL2 >= 0) {
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
  let activeConfig = new ConfigCmd();
  let lastBuildCmd : BuildCmd_A = cmds[0] as BuildCmd_A;
  // console.log("lbc=",lastBuildCmd);
  for (let i=0; i<cmds.length; i++) {
    let cmd = cmds[i] as BuildCmd_A;
    // snap expandoes if delta < 5 degrees
    if (cmd.item == Item.EXPANDO_BOX && config.alignExpandoes) {
      cmd.currConfig.angle! %= 90;
      if (Math.abs(cmd.currConfig.angle!) < 5) {
        cmd.currConfig.angle = 0;
      }
    }
    // optimisation broken, fix before putting it back, if ever. in any case, it appears the rcd does this optimisation already.
    // if (i != 0 && lastBuildCmd.bits && cmd.bits && cmd.y == lastBuildCmd.y && 
    //   cmd.item == lastBuildCmd.item && cmd.shape == lastBuildCmd.shape && 
    //   compatibleItem(cmd.item!, cmd.currConfig, activeConfig)) {
    //   console.log("x=", cmd.x);
    //   let dist = 0;
    //   let x1 = cmd.x!+0.5, x2 = lastBuildCmd.x!+0.5;
    //   dist = x2>x1 ? x2-x1+lastBuildCmd.bits!.toString().length-1 : x1-x2+cmd.bits!.toString().length-1;
    //   if (dist <= 64) {
    //     lastBuildCmd.bits = new BuildBits(
    //       (x2 > x1) ? cmd.bits!.toString() +zeroes(Math.max(x1, x2)-Math.min(x1, x2)) + lastBuildCmd.bits?.toString()
    //       : lastBuildCmd.bits!.toString() +zeroes(Math.max(x1, x2)-Math.min(x1, x2)) + lastBuildCmd.bits?.toString()
    //     ); 
    //     console.log("optimised!", lastBuildCmd.bits.toString());
    //     cmds.splice(i, 1);
    //     i--;
    //   }
    // }
    if (!configFrag(cmd.item, cmd.currConfig).equals(configFrag(cmd.item, activeConfig))) {
      cmds.splice(i, 0, cmd.currConfig);
      activeConfig = cmd.currConfig;
    }
  }
  let enc = new Encoder();
  bp.commands = cmds;
  let combined = enc.encodeSync(bp);
  if (bp.commands.length > 1000) {
    let bp2 = bp.clone();
    bp2.commands = bp2.commands!.slice(1000);
    bp.commands = bp.commands.slice(0, 1000);
    
    return {bps:[enc.encodeSync(bp), enc.encodeSync(bp2)], combined:combined}
  }
  else return {bps:[enc.encodeSync(bp)], combined:enc.encodeSync(bp)};
}

function compatibleItem(it: Item, config1:ConfigCmd, config2:ConfigCmd) {
  return configFrag(it, config1).equals(configFrag(it, config2));
}

function zeroes(n:number) {
  let str = "";
  for (let i=0; i<n; i++) str += "0";
  return str;
}