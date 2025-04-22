/*! dsabp-js v0.4.11 @license MIT https://github.com/Blueyescat/dsabp-js */
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  BPCmd: () => BPCmd,
  Blueprint: () => Blueprint,
  BuildBits: () => BuildBits,
  BuildCmd: () => BuildCmd,
  ConfigCmd: () => ConfigCmd,
  Decoder: () => Decoder,
  Encoder: () => Encoder,
  Enum: () => Enum,
  FilterMode: () => FilterMode,
  FixedAngle: () => FixedAngle,
  Item: () => Item,
  LoaderPoint: () => LoaderPoint,
  LoaderPriority: () => LoaderPriority,
  PREFIX: () => PREFIX,
  PusherMode: () => PusherMode,
  Shape: () => Shape,
  decode: () => decode,
  decodeConfigCmd: () => decodeConfigCmd,
  decodeConfigCmdSync: () => decodeConfigCmdSync,
  decodeSync: () => decodeSync,
  encode: () => encode,
  encodeSync: () => encodeSync
});
module.exports = __toCommonJS(index_exports);

// src/BPCmd.ts
var BPCmd = class {
};

// src/BuildBits.ts
var BuildBits = class {
  int;
  constructor(input) {
    if (input == null) {
      this.int = 0n;
      return;
    }
    if (typeof input == "string") {
      input = "0b" + reverse(input);
    } else if (typeof input != "number" && typeof input != "bigint") {
      throw new TypeError("input must be a number, bigint or string");
    }
    this.int = BigInt(input);
  }
  set(index) {
    if (index < 0 || index > 63) throw new RangeError("index must be between [0,63]");
    this.int |= mask(index);
    return this;
  }
  clear(index) {
    if (index < 0 || index > 63) throw new RangeError("index must be between [0,63]");
    this.int &= ~mask(index);
    return this;
  }
  toggle(index, force) {
    if (index < 0 || index > 63) throw new RangeError("index must be between [0,63]");
    if (typeof force == "undefined")
      this.int ^= mask(index);
    else if (force === true)
      this.set(index);
    else if (force === false)
      this.clear(index);
    return this;
  }
  isSet(index) {
    if (index < 0 || index > 63) return false;
    return !!(this.int & mask(index));
  }
  isZero() {
    return this.int == 0n;
  }
  isOne() {
    return this.int == 1n;
  }
  trimLeadZeros() {
    if (this.int)
      this.int /= -this.int & this.int;
    return this;
  }
  get size() {
    return this.int.toString(2).length;
  }
  *[Symbol.iterator]() {
    for (const b of reverse(this.int.toString(2))) {
      yield b == "1";
    }
  }
  toArray() {
    return Array.from(this);
  }
  toString() {
    return reverse(this.int.toString(2));
  }
  get [Symbol.toStringTag]() {
    return this.toString();
  }
  equals(target) {
    return this.int === target?.int;
  }
  clone() {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }
};
function mask(i) {
  return 1n << BigInt(i);
}
function reverse(str) {
  if (str.length < 1) return str;
  return str.split("").reduce((r, c) => c + r);
}

// src/constants/Enum.ts
var Enum = class _Enum {
  static maps = /* @__PURE__ */ new Map();
  static getMap() {
    return this.maps.get(this.name)[0];
  }
  static getReverseMap() {
    return this.maps.get(this.name)[1];
  }
  static getByName(name) {
    return this.getMap().get(name);
  }
  static getByValue(value) {
    return this.getMap().get(
      this.getReverseMap().get(value)
    );
  }
  static end() {
    this.maps.set(this.name, [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()]);
    const map = this.getMap();
    const reverseMap = this.getReverseMap();
    for (const key in this) {
      const value = this[key];
      if (value instanceof _Enum) {
        value.enumName = key;
        map.set(key, value);
        reverseMap.set(value.enumValue, key);
      }
    }
  }
  constructor(value) {
    this.enumValue = value;
  }
  enumName;
  enumValue;
  toString() {
    return this.constructor.name + "." + this.enumName;
  }
};

// src/constants/ItemEnum.ts
var Item = class _Item extends Enum {
  name;
  description;
  stackable;
  rarity;
  constructor(id, name, description, stackable, rarity, image, recipe, buildInfo, blacklist_autobuild, fab_type) {
    super(id);
    this.name = name;
    this.description = description;
    this.stackable = stackable;
    this.rarity = rarity;
    if (image !== void 0) this.image = image;
    if (recipe !== void 0) this.recipe = recipe;
    if (buildInfo !== void 0) this.buildInfo = buildInfo;
    if (blacklist_autobuild !== void 0) this.blacklist_autobuild = blacklist_autobuild;
    if (fab_type !== void 0) this.fab_type = fab_type;
  }
  get id() {
    return this.enumValue;
  }
  get isBuildable() {
    return !!this.buildInfo;
  }
  get isBlock() {
    return !!this.buildInfo?.[0]?.block;
  }
  static getById(id) {
    return _Item.getByValue(id);
  }
  static NULL = new this(0, "", "", false, NaN);
  static RES_METAL = new this(1, "Iron", "Material. Used to produce most items.", true, 0, "item/res_iron");
  static RES_GUNPOWDER = new this(2, "Explosives", "Material. Used to produce munitions.", true, 0, "item/res_explosives");
  static RES_HYPER_RUBBER = new this(4, "Hyper Rubber", "Material. High Elasticity.", true, 2, "item/res_hyper_rubber");
  static RES_FLUX = new this(5, "Flux Crystals", "Material. Used to produce advanced machinery.", true, 2, "item/res_flux_crystals");
  static RES_FUEL = new this(6, "Thruster Fuel", "Refined fuel. Powers thrusters. More efficient than explosives.", true, 0, "item/fuel", { count: 1, time: 30, input: [{ item: 2, count: 1 }], built_by: ["Munitions"] });
  static COMPRESSED_EXPLOSIVES = new this(49, "Compressed Explosives", "Explosives, compressed into a flux matrix at a 16:1 ratio. Unpack with a recycler.", true, 2, "item/comp_exp");
  static COMPRESSED_IRON = new this(50, "Compressed Iron", "Iron, compressed into a flux matrix at a 24:1 ratio. Unpack with a recycler.", true, 2, "item/comp_iron");
  static BALL_VOLLEY = new this(51, "Volleyball", "\u{1F3D0}", false, 2, "item/ball_volley");
  static BALL_VOLLEY_GOLD = new this(52, "Golden Volleyball", "\u{1F31F}\u{1F3D0}\u{1F31F}", false, 2, "item/ball_vg");
  static BALL_BASKET = new this(53, "Basketball", "\u{1F3C0}", false, 2, "item/ball_basket");
  static BALL_BASKET_GOLD = new this(54, "Golden Basketball", "\u{1F31F}\u{1F3C0}\u{1F31F}", false, 2, "item/ball_bg");
  static BALL_BEACH = new this(55, "Beach Ball", "\u{1F334}", false, 2, "item/ball_beach");
  static BALL_SOCCER = new this(56, "Football", "\u26BD", false, 2, "item/ball_soccer");
  static WRENCH = new this(100, "Wrench", "Used to take stuff apart.", false, 0, "item/wrench", { count: 1, time: 5, input: [{ item: 1, count: 4 }], built_by: ["Starter", "Engineering"] });
  static SHREDDER = new this(101, "Item Shredder", "Destroys items.", false, 0, "item/item_shredder", { count: 1, time: 5, input: [{ item: 1, count: 4 }], built_by: ["Starter", "Engineering"] });
  static SHREDDER_GOLD = new this(102, "Golden Item Shredder", "Destroys items quickly, with style.", false, 9, "item/item_shredder_g");
  static REPAIR_TOOL = new this(103, "Repair Tool", "Used to repair blocks and objects.", false, 0, "item/repair_tool", { count: 1, time: 5, input: [{ item: 1, count: 4 }], built_by: ["Starter", "Engineering"] });
  static HAND_PUSHER = new this(104, "Handheld Pusher", "A pusher you can hold in your hand.", false, 2, "item/pusher_hand", { count: 1, time: 5, input: [{ item: 1, count: 4 }, { item: 5, count: 16 }], built_by: ["Engineering"] });
  static SHIELD_BOOSTER = new this(105, "Ship Shield Booster", "An inferior power source for shield generators.", false, 0, "item/repairkit", { count: 1, time: 3, input: [{ item: 1, count: 2 }], built_by: ["Engineering", "Munitions"] });
  static SHIP_EMBIGGENER = new this(106, "Ship Embiggener", "Makes your ship bigger. Press R to change axis.", false, 0, "item/ship_embiggener", { count: 1, time: 3, input: [{ item: 1, count: 4 }], built_by: ["Starter", "Engineering"] });
  static SHIP_SHRINKINATOR = new this(107, "Ship Shrinkinator", "Makes your ship smaller. Space must be completely empty. Press R to change axis.", false, 0, "item/ship_shrinkinator", { count: 1, time: 3, input: [{ item: 1, count: 4 }], built_by: ["Engineering"] });
  static EQUIPMENT_BACKPACK = new this(108, "Backpack", "Equipment (Back). Lets you hold more items.", false, 1, "item/eq_backpack");
  static EQUIPMENT_SPEED_SKATES = new this(109, "Speed Skates", "Equipment (Feet). SPEED.", false, 2, "item/eq_speed_skates", { count: 1, time: 20, input: [{ item: 1, count: 8 }, { item: 4, count: 4 }, { item: 5, count: 16 }], built_by: ["Equipment"] });
  static EQUIPMENT_BOOSTER_BOOTS = new this(110, "Booster Boots", "Equipment (Feet). Provides a double-jump and slightly more powerful jumps.", false, 2, "item/eq_booster_boots", { count: 1, time: 20, input: [{ item: 1, count: 8 }, { item: 4, count: 8 }, { item: 5, count: 16 }], built_by: ["Equipment"] });
  static EQUIPMENT_LAUNCHER_GAUNTLETS = new this(111, "Launcher Gauntlets", "Equipment (Hands). Throw items more powerfully.", false, 2, "item/eq_launcher_gauntlets", { count: 1, time: 20, input: [{ item: 1, count: 8 }, { item: 4, count: 8 }, { item: 5, count: 8 }], built_by: ["Equipment"] });
  static EQUIPMENT_CONSTRUCTION_GAUNTLETS = new this(112, "Construction Gauntlets", "Equipment (Hands). While in a safe zone: Doubles build/destruct/repair/use range and speed, and allows using objects through walls.", false, 2, "item/eq_construction_gauntlets", { count: 1, time: 20, input: [{ item: 1, count: 8 }, { item: 4, count: 4 }, { item: 5, count: 32 }], built_by: ["Equipment"] });
  static EQUIPMENT_ROCKET_PACK = new this(113, "Rocket Pack", "Equipment (Back). Speedy Flight.", false, 2, "item/eq_rocket_pack", { count: 1, time: 20, input: [{ item: 1, count: 16 }, { item: 4, count: 4 }, { item: 5, count: 32 }], built_by: ["Equipment"] });
  static EQUIPMENT_HOVER_PACK = new this(114, "Hover Pack", "Equipment (Back). Controlled Flight.", false, 2, "item/eq_hover_pack", { count: 1, time: 20, input: [{ item: 1, count: 16 }, { item: 4, count: 4 }, { item: 5, count: 32 }], built_by: ["Equipment"] });
  static SCANNER_MANIFEST = new this(115, "Manifest Scanner", "Generate a list of items on your ship.", false, 2, "item/scanner_manifest");
  static SCANNER_BOM = new this(116, "BoM Scanner", "Generate a list of materials used to build your ship.", false, 2, "item/scanner_bom");
  static WRENCH_STARTER = new this(117, "Starter Wrench", "Useful for getting you out of a bind. Slow. Disappears if dropped.", false, -1, "item/wrench_starter");
  static SHREDDER_STARTER = new this(118, "Starter Shredder", "Destroys items. Slow. Disappears if dropped.", false, -1, "item/item_shredder_starter");
  static HAND_CANNON = new this(119, "Hand Cannon", "[TEST EXCLUSIVE] A small, handheld cannon. Uses ammo in your inventory.", false, 0, "item/hand_cannon");
  static SCANNER_BLUEPRINT = new this(120, "Blueprint Scanner", "Generates blueprint strings, which describe how to rebuild ships or parts of ships. Click and drag to select a region.", false, 2, "item/scanner_blueprint");
  static RCD_SANDBOX = new this(121, "Sandbox RCD", "Buildable. Used for automated construction. This test-exclusive variant can spawn items and doesn't need fuel. It works faster on ships owned by patrons.", false, -1, "item/rcd_sandbox", void 0, [{ bounds: { x: 2.5, y: 2.5 }, shape: { verts: [{ x: -1.25, y: -0.5 }, { x: -0.5, y: -1.25 }, { x: 0.5, y: -1.25 }, { x: 1.25, y: -0.5 }, { x: 1.25, y: 0.5 }, { x: 0.5, y: 1.25 }, { x: -0.5, y: 1.25 }, { x: -1.25, y: 0.5 }] }, allow_non_solids: true, image: "rcd_sandbox", image_only: true }], true);
  static RCD_FLUX = new this(122, "Flux RCD", "Buildable. Used for automated construction. Consumes flux as fuel.", false, 2, "item/rcd_flux", void 0, [{ bounds: { x: 2.5, y: 2.5 }, shape: { verts: [{ x: -1.25, y: -0.5 }, { x: -0.5, y: -1.25 }, { x: 0.5, y: -1.25 }, { x: 1.25, y: -0.5 }, { x: 1.25, y: 0.5 }, { x: 0.5, y: 1.25 }, { x: -0.5, y: 1.25 }, { x: -1.25, y: 0.5 }] }, allow_non_solids: true, image: "rcd_flux", image_only: true }], true);
  static SHIELD_CORE = new this(123, "Shield Core", "A power source for shield generators.", false, 1, "item/shield_core");
  static AMMO_STANDARD = new this(150, "Standard Ammo", "Regular bullets.", true, 0, "item/ammo_standard", { count: 4, time: 1, input: [{ item: 1, count: 1 }, { item: 2, count: 1 }], built_by: ["Starter", "Munitions"] });
  static AMMO_SCATTER = new this(151, "ScatterShot Ammo", "Shoots multiple projectiles. Significant damage at close range, with knock-back.", true, 0, "item/ammo_scattershot", { count: 4, time: 1, input: [{ item: 1, count: 1 }, { item: 2, count: 1 }], built_by: ["Munitions"] });
  static AMMO_FLAK = new this(152, "Flak Ammo", "Explodes into more bullets in flight.", true, 0, "item/ammo_flak", { count: 4, time: 1, input: [{ item: 1, count: 1 }, { item: 2, count: 1 }], built_by: ["Munitions"] });
  static AMMO_SNIPER = new this(153, "Sniper Ammo", "Speedy. Gains power from bouncing.", true, 0, "item/ammo_sniper", { count: 4, time: 1, input: [{ item: 1, count: 1 }, { item: 2, count: 1 }], built_by: ["Munitions"] });
  static AMMO_PUNCH = new this(154, "Punch Ammo", "Pushes objects away.", true, 0, "item/ammo_punch", { count: 4, time: 1, input: [{ item: 1, count: 1 }, { item: 2, count: 1 }], built_by: ["Munitions"] });
  static AMMO_YANK = new this(155, "Yank Ammo", "Pulls objects.", true, 0, "item/ammo_yank", { count: 4, time: 1, input: [{ item: 1, count: 1 }, { item: 2, count: 1 }], built_by: ["Munitions"] });
  static AMMO_SLUG = new this(156, "Slug Ammo", "Slow bullet. Gains speed and damage as it falls.", true, 0, "item/ammo_slug", { count: 4, time: 1, input: [{ item: 1, count: 1 }, { item: 2, count: 1 }], built_by: ["Munitions"] });
  static AMMO_TRASH = new this(157, "Trash Box", "Low quality, but free! Decays over time.", true, 0, "item/ammo_trash", { count: 1, time: 3, input: [], built_by: ["Munitions"] });
  static FUEL_BOOSTER_LOW = new this(159, "Booster Fuel (Low Grade)", "Increases thruster power for a short time.", false, 0, "item/booster_low", { count: 1, time: 30, input: [{ item: 2, count: 16 }], built_by: ["Munitions"] });
  static FUEL_BOOSTER_HIGH = new this(160, "Booster Fuel (High Grade)", "Increases thruster power for a short time.", false, 2, "item/booster_high", { count: 4, time: 30, input: [{ item: 2, count: 64 }, { item: 5, count: 1 }], built_by: ["Munitions"] });
  static VOID_ORB = new this(161, "Void Orb", "DO NOT EAT!", false, 10, "item/void_orb");
  static TURRET_BOOSTER_RAPID = new this(162, "Turret Booster - Rapid Fire", "Boosts a re-configurable turret's fire rate by 50%, with reduced accuracy.", false, 2, "item/turret_booster_rapid");
  static TURRET_BOOSTER_RAPID_USED = new this(163, "Turret Booster - Rapid Fire (Depleted)", "Boosts a re-configurable turret's fire rate by 25%, with reduced accuracy. Nearly depleted!", false, 2, "item/turret_booster_rapid_used");
  static TURRET_BOOSTER_PRESERVATION = new this(164, "Turret Booster - Preservation", "Boosts a re-configurable turret's ammo preservation by 10%, with reduced rotational aiming limits.", false, 2, "item/turret_booster_preservation");
  static TURRET_BOOSTER_PRESERVATION_USED = new this(165, "Turret Booster - Preservation (Depleted)", "Boosts a re-configurable turret's ammo preservation by 5%, with reduced rotational aiming limits. Nearly depleted!", false, 2, "item/turret_booster_preservation_used");
  static COOLING_CELL = new this(166, "Cooling Cell", "Prevents machine cannons from damaging themselves.", false, 0, "item/cooling_cell", { count: 1, time: 1, input: [{ item: 234, count: 4 }], built_by: ["Munitions"] });
  static COOLING_CELL_HOT = new this(167, "Cooling Cell (Hot)", "Will take some time to cool back down.", false, 0, "item/cooling_cell_hot");
  static BURST_CHARGE = new this(168, "Burst Charge", "Power source for burst cannons. Overcharging cannons may result in damage!", false, 0, "item/burst_charge", { count: 1, time: 1, input: [{ item: 2, count: 4 }], built_by: ["Munitions"] });
  static HELM = new this(215, "Helm (Packaged)", "Buildable. Used to pilot your ship.", false, 0, "item/helm", { count: 1, time: 10, input: [{ item: 1, count: 8 }], built_by: ["Engineering"] }, [{ snap_y: true, offset: { x: 0, y: 0.3 }, bounds: { x: 1.5, y: 1.5 }, require_blocks: [{ x: 0, y: -1, block: "_BUILD_SURFACE" }], allow_solids: true, image: "helm_wheel", image_only: true }]);
  static HELM_STARTER = new this(216, "Helm (Starter, Packaged)", "Buildable Starter Item. Used to pilot your ship.", false, -1, "item/helm_starter", void 0, [{ snap_y: true, offset: { x: 0, y: 0.3 }, bounds: { x: 1.5, y: 1.5 }, require_blocks: [{ x: 0, y: -1, block: "_BUILD_SURFACE" }], allow_solids: true, image: "helm_wheel_starter", image_only: true }]);
  static COMMS_STATION = new this(217, "Comms Station (Packaged)", "Buildable. Used to communicate with other ships.", false, 0, "item/comms", { count: 1, time: 10, input: [{ item: 1, count: 8 }], built_by: ["Engineering"] }, [{ snap_y: true, offset: { x: 0, y: -0.25 }, bounds: { x: 1.25, y: 2.5 }, require_blocks: [{ x: 0, y: -2, block: "_BUILD_SURFACE" }], allow_solids: true, image: "comms_station", image_only: true }]);
  static SIGN = new this(218, "Sign (Packaged)", "Buildable. Can display a short message.", false, 0, "item/sign", { count: 1, time: 10, input: [{ item: 1, count: 8 }], built_by: ["Engineering"] }, [{ snap_x: true, snap_y: true, bounds: { x: 1, y: 1 }, allow_solids: true, image: "sign" }], true);
  static SPAWN_POINT = new this(219, "Spawn Point (Packaged)", "Buildable. Can be set to spawn a specific rank.", false, 0, "item/spawn", { count: 1, time: 10, input: [{ item: 1, count: 8 }], built_by: ["Engineering"] }, [{ snap_y: true, offset: { x: 0, y: 0.5 }, bounds: { x: 1, y: 2 }, require_blocks: [{ x: 0, y: -2, block: "_BUILD_SURFACE" }], allow_solids: true, image: "spawn" }], true);
  static DOOR = new this(220, "Door (Packaged)", "Buildable. Can be restricted to specific ranks. Press R to rotate.", false, 0, "item/door", { count: 1, time: 10, input: [{ item: 1, count: 8 }], built_by: ["Engineering"] }, [{ buildDirection: "HORIZONTAL", snap_x: true, snap_y: true, offset: { x: 0.5, y: 0 }, bounds: { x: 2, y: 0.45 }, image: "door_full" }, { buildDirection: "VERTICAL", snap_x: true, snap_y: true, offset: { x: 0, y: 0.5 }, bounds: { x: 0.45, y: 2 }, image: "door_full" }], true);
  static ITEM_HATCH = new this(221, "Cargo Hatch (Packaged)", "Buildable. Drops items picked up by the ship.", false, 0, "item/item_hatch", { count: 1, time: 10, input: [{ item: 1, count: 8 }], built_by: ["Engineering"] }, [{ snap_x: true, snap_y: true, bounds: { x: 1, y: 1 }, allow_solids: true }]);
  static ITEM_HATCH_STARTER = new this(222, "Cargo Hatch (Starter, Packaged)", "Buildable Starter Item. Drops items picked up by the ship.", false, -1, "item/item_hatch_starter", void 0, [{ snap_x: true, snap_y: true, bounds: { x: 1, y: 1 }, allow_solids: true }]);
  static ITEM_EJECTOR = new this(223, "Cargo Ejector (Packaged)", "Buildable. Ejects items from the ship.", false, 0, "item/item_ejector", { count: 1, time: 10, input: [{ item: 1, count: 8 }], built_by: ["Engineering"] }, [{ buildDirection: "HORIZONTAL", snap_x: true, snap_y: true, bounds: { x: 2.8, y: 0.8 }, require_blocks: [{ x: 0, y: 0, block: "HULL_H" }, { x: 1, y: 0, block: "HULL_H" }, { x: -1, y: 0, block: "HULL_H" }], allow_world: true }, { buildDirection: "VERTICAL", snap_x: true, snap_y: true, bounds: { x: 0.8, y: 2.8 }, require_blocks: [{ x: 0, y: 0, block: "HULL_V" }, { x: 0, y: 1, block: "HULL_V" }, { x: 0, y: -1, block: "HULL_V" }], allow_world: true }, { snap_x: true, snap_y: true, bounds: { x: 1, y: 1 }, build_angle: "Fixed", image: "arrow_shape", image_only: true }]);
  static TURRET_CONTROLLER = new this(224, "Turret Controller (Packaged)", "Buildable. Controls adjacent turrets.", false, 0, "item/turret_controller", { count: 1, time: 10, input: [{ item: 1, count: 8 }], built_by: ["Engineering"] }, [{ buildDirection: "HORIZONTAL", snap_x: true, snap_y: true, bounds: { x: 2.8, y: 0.8 }, require_blocks: [{ x: 0, y: 0, block: "HULL_H" }, { x: 1, y: 0, block: "HULL_H" }, { x: -1, y: 0, block: "HULL_H" }], allow_world: true }, { buildDirection: "VERTICAL", snap_x: true, snap_y: true, bounds: { x: 0.8, y: 2.8 }, require_blocks: [{ x: 0, y: 0, block: "HULL_V" }, { x: 0, y: 1, block: "HULL_V" }, { x: 0, y: -1, block: "HULL_V" }], allow_world: true }]);
  static TURRET_REMOTE = new this(226, "Cannon (Packaged)", "Buildable. A normal cannon that you can use to shoot at stuff.", false, 1, "item/turret_rc", void 0, [{ buildDirection: "HORIZONTAL", snap_x: true, snap_y: true, bounds: { x: 2.8, y: 0.8 }, require_blocks: [{ x: 0, y: 0, block: "HULL_H" }, { x: 1, y: 0, block: "HULL_H" }, { x: -1, y: 0, block: "HULL_H" }], allow_world: true }, { buildDirection: "VERTICAL", snap_x: true, snap_y: true, bounds: { x: 0.8, y: 2.8 }, require_blocks: [{ x: 0, y: 0, block: "HULL_V" }, { x: 0, y: 1, block: "HULL_V" }, { x: 0, y: -1, block: "HULL_V" }], allow_world: true }]);
  static TURRET_REMOTE_STARTER = new this(227, "Starter Cannon (Packaged)", "Buildable Starter Item. Slowly re-generates ammo when empty.", false, -1, "item/turret_rc_starter", void 0, [{ buildDirection: "HORIZONTAL", snap_x: true, snap_y: true, bounds: { x: 2.8, y: 0.8 }, require_blocks: [{ x: 0, y: 0, block: "HULL_H" }, { x: 1, y: 0, block: "HULL_H" }, { x: -1, y: 0, block: "HULL_H" }], allow_world: true }, { buildDirection: "VERTICAL", snap_x: true, snap_y: true, bounds: { x: 0.8, y: 2.8 }, require_blocks: [{ x: 0, y: 0, block: "HULL_V" }, { x: 0, y: 1, block: "HULL_V" }, { x: 0, y: -1, block: "HULL_V" }], allow_world: true }]);
  static TURRET_BURST = new this(228, "Burst Cannon (Packaged)", "Buildable. Fires a burst of shots when supplied with burst charges. May damage itself.", false, 1, "item/turret_burst", void 0, [{ buildDirection: "HORIZONTAL", snap_x: true, snap_y: true, bounds: { x: 2.8, y: 0.8 }, require_blocks: [{ x: 0, y: 0, block: "HULL_H" }, { x: 1, y: 0, block: "HULL_H" }, { x: -1, y: 0, block: "HULL_H" }], allow_world: true }, { buildDirection: "VERTICAL", snap_x: true, snap_y: true, bounds: { x: 0.8, y: 2.8 }, require_blocks: [{ x: 0, y: 0, block: "HULL_V" }, { x: 0, y: 1, block: "HULL_V" }, { x: 0, y: -1, block: "HULL_V" }], allow_world: true }]);
  static TURRET_AUTO = new this(229, "Machine Cannon (Packaged)", "Buildable. A fully automatic gun that takes time to wind up. Requires cooling.", false, 1, "item/turret_auto", void 0, [{ buildDirection: "HORIZONTAL", snap_x: true, snap_y: true, bounds: { x: 2.8, y: 0.8 }, require_blocks: [{ x: 0, y: 0, block: "HULL_H" }, { x: 1, y: 0, block: "HULL_H" }, { x: -1, y: 0, block: "HULL_H" }], allow_world: true }, { buildDirection: "VERTICAL", snap_x: true, snap_y: true, bounds: { x: 0.8, y: 2.8 }, require_blocks: [{ x: 0, y: 0, block: "HULL_V" }, { x: 0, y: 1, block: "HULL_V" }, { x: 0, y: -1, block: "HULL_V" }], allow_world: true }]);
  static THRUSTER = new this(230, "Thruster (Packaged)", "Buildable. Moves your ship. Fuelled with explosives.", false, 0, "item/thruster", { count: 1, time: 10, input: [{ item: 1, count: 8 }], built_by: ["Engineering"] }, [{ buildDirection: "HORIZONTAL", snap_x: true, snap_y: true, bounds: { x: 2.8, y: 0.8 }, require_blocks: [{ x: 0, y: 0, block: "HULL_H" }, { x: 1, y: 0, block: "HULL_H" }, { x: -1, y: 0, block: "HULL_H" }], allow_world: true }, { buildDirection: "VERTICAL", snap_x: true, snap_y: true, bounds: { x: 0.8, y: 2.8 }, require_blocks: [{ x: 0, y: 0, block: "HULL_V" }, { x: 0, y: 1, block: "HULL_V" }, { x: 0, y: -1, block: "HULL_V" }], allow_world: true }]);
  static THRUSTER_STARTER = new this(231, "Thruster (Starter, Packaged)", "Buildable Starter Item. Moves your ship. Doesn't need fuel.", false, -1, "item/thruster_starter", void 0, [{ snap_x: true, snap_y: true, bounds: { x: 0.8, y: 0.8 }, require_blocks: [{ x: 0, y: 0, block: "HULL_CORNER" }], allow_world: true }]);
  static BLOCK = new this(232, "Iron Block", "Buildable. Used for interior walls/floors.", true, 0, "item/block", { count: 1, time: 1, input: [{ item: 1, count: 2 }], built_by: ["Starter", "Engineering"] }, [{ snap_x: true, snap_y: true, bounds: { x: 1, y: 1 }, block: 4, block_shaped: true }]);
  static BLOCK_HYPER_RUBBER = new this(233, "Hyper Rubber Block", "Buildable. Bouncy.", true, 2, "item/block_hrubber", { count: 1, time: 1, input: [{ item: 4, count: 2 }], built_by: ["Engineering"] }, [{ snap_x: true, snap_y: true, bounds: { x: 1, y: 1 }, block: 13, block_shaped: true }]);
  static BLOCK_ICE_GLASS = new this(234, "Hyper Ice Block", "Buildable. Low-friction ice that can't melt for some reason.", true, 0, "item/block_sglass", void 0, [{ snap_x: true, snap_y: true, bounds: { x: 1, y: 1 }, block: 14, block_shaped: true }]);
  static BLOCK_LADDER = new this(235, "Ladder", "Buildable. You can climb them.", true, 0, "item/ladder", { count: 1, time: 1, input: [{ item: 1, count: 2 }], built_by: ["Starter", "Engineering"] }, [{ snap_x: true, snap_y: true, bounds: { x: 1, y: 1 }, block: 5 }]);
  static BLOCK_WALKWAY = new this(236, "Walkway", "Buildable. Blocks players but not items.", true, 0, "item/walkway", { count: 1, time: 1, input: [{ item: 1, count: 2 }], built_by: ["Engineering"] }, [{ snap_x: true, snap_y: true, bounds: { x: 1, y: 1 }, block: 6, block_shaped: true }]);
  static BLOCK_ITEM_NET = new this(237, "Item Net", "Buildable. Blocks items but not players.", true, 0, "item/item_net", { count: 1, time: 1, input: [{ item: 1, count: 2 }], built_by: ["Engineering"] }, [{ snap_x: true, snap_y: true, bounds: { x: 1, y: 1 }, block: 7, block_shaped: true }]);
  static PAINT = new this(239, "Paint", "Used to paint your ship's background. Hold R to select color.", true, 0, "item/color_panel", { count: 1, time: 1, input: [{ item: 1, count: 2 }], built_by: ["Engineering"] }, [{ snap_x: true, snap_y: true, bounds: { x: 1, y: 1 }, block_is_colored: true, allow_world: true, allow_any: true }], true);
  static EXPANDO_BOX = new this(240, "Expando Box (Packaged)", "Buildable. Flexible bulk storage.", false, 0, "item/exbox", { count: 1, time: 10, input: [{ item: 1, count: 8 }], built_by: ["Engineering"] }, [{ bounds: { x: 2, y: 2 }, shape: { verts: [{ x: -0.95, y: -0.75 }, { x: -0.75, y: -0.95 }, { x: 0.75, y: -0.95 }, { x: 0.95, y: -0.75 }, { x: 0.95, y: 0.75 }, { x: 0.75, y: 0.95 }, { x: -0.75, y: 0.95 }, { x: -0.95, y: 0.75 }] }, allow_non_solids: true, build_angle: "Any", image: "exbox_base", image_only: true }]);
  static FREEPORT_ANCHOR = new this(241, "Safety Anchor", "Buildable. Prevents teleports out of safe zones while placed.", false, 0, "item/anchor", { count: 1, time: 20, input: [{ item: 1, count: 16 }], built_by: ["Engineering"] }, [{ bounds: { x: 3, y: 3 }, snap_x: true, snap_y: true, image: "anchor" }]);
  static PUSHER = new this(242, "Pusher (Packaged)", "Buildable. Pushes things.", false, 2, "item/pusher", { count: 1, time: 10, input: [{ item: 1, count: 8 }, { item: 5, count: 4 }], built_by: ["Engineering"] }, [{ snap_x: true, snap_y: true, bounds: { x: 1, y: 1 }, image: "loader_base", image_anim: "pusher", image_only: true }]);
  static ITEM_LAUNCHER = new this(243, "Item Launcher (Packaged)", "Buildable. Launches items at a configurable speed and angle.", false, 2, "item/item_launcher", { count: 1, time: 10, input: [{ item: 1, count: 8 }, { item: 4, count: 8 }, { item: 5, count: 8 }], built_by: ["Engineering"] }, [{ snap_x: true, snap_y: true, bounds: { x: 1, y: 1 }, image: "item_launcher", image_only: true }], true);
  static LOADER = new this(244, "DEPRECATED ITEM", "DEPRECATED ITEM", false, 2, "item/loader_old");
  static RECYCLER = new this(245, "Recycler (Packaged)", "Buildable. Converts items back into resources.", false, 0, "item/recycler", { count: 1, time: 10, input: [{ item: 1, count: 8 }], built_by: ["Engineering"] }, [{ snap_y: true, offset: { x: 0, y: 0.25 }, bounds: { x: 2.25, y: 3.5 }, require_blocks: [{ x: 0, y: -2, block: "_BUILD_SURFACE" }], allow_solids: true, image: "recycler", image_only: true }]);
  static FABRICATOR_GOLD = new this(246, "Fabricator (Legacy, Packaged)", "Buildable. It doesn't do anything.", false, 9, "item/fabricator_legacy", void 0, [{ snap_y: true, bounds: { x: 2.5, y: 3 }, require_blocks: [{ x: 0, y: -2, block: "_BUILD_SURFACE" }], allow_solids: true, image: "fab_lod", image_only: true }], void 0, "Legacy");
  static FABRICATOR_STARTER = new this(247, "Fabricator (Starter, Packaged)", "Buildable Starter Item. Used to craft basic items.", false, -1, "item/fabricator_starter", void 0, [{ snap_y: true, bounds: { x: 2.5, y: 3 }, require_blocks: [{ x: 0, y: -2, block: "_BUILD_SURFACE" }], allow_solids: true, image: "fab_lod", image_only: true }], void 0, "Starter");
  static FABRICATOR_MUNITIONS = new this(248, "Fabricator (Munitions, Packaged)", "Buildable. Used to craft ammo and other consumables.", false, 0, "item/fabricator_munitions", { count: 1, time: 20, input: [{ item: 1, count: 16 }], built_by: ["Starter", "Engineering"] }, [{ snap_y: true, bounds: { x: 2.5, y: 3 }, require_blocks: [{ x: 0, y: -2, block: "_BUILD_SURFACE" }], allow_solids: true, image: "fab_lod", image_only: true }], void 0, "Munitions");
  static FABRICATOR_ENGINEERING = new this(249, "Fabricator (Engineering, Packaged)", "Buildable. Used to craft tools, blocks, and security items.", false, 0, "item/fabricator_engineering", { count: 1, time: 20, input: [{ item: 1, count: 16 }], built_by: ["Starter", "Engineering"] }, [{ snap_y: true, bounds: { x: 2.5, y: 3 }, require_blocks: [{ x: 0, y: -2, block: "_BUILD_SURFACE" }], allow_solids: true, image: "fab_lod", image_only: true }], void 0, "Engineering");
  static FABRICATOR_MACHINE_DEPRECATED = new this(250, "Fabricator (DEPRECATED, Packaged)", "DEPRECATED ITEM", false, 0, "item/fabricator_machine", { count: 1, time: 20, input: [{ item: 1, count: 16 }], built_by: [] }, [{ snap_y: true, bounds: { x: 2.5, y: 3 }, require_blocks: [{ x: 0, y: -2, block: "_BUILD_SURFACE" }], allow_solids: true, image: "fab_lod", image_only: true }], void 0, "Engineering");
  static FABRICATOR_EQUIPMENT = new this(251, "Fabricator (Equipment, Packaged)", "Buildable. Used to craft wearable equipment.", false, 0, "item/fabricator_equipment", { count: 1, time: 20, input: [{ item: 1, count: 16 }], built_by: ["Engineering"] }, [{ snap_y: true, bounds: { x: 2.5, y: 3 }, require_blocks: [{ x: 0, y: -2, block: "_BUILD_SURFACE" }], allow_solids: true, image: "fab_lod", image_only: true }], void 0, "Equipment");
  static LOADER_NEW = new this(252, "Loader (Packaged)", "Buildable. Loads items into machines.", false, 2, "item/loader", { count: 1, time: 10, input: [{ item: 1, count: 8 }, { item: 5, count: 2 }], built_by: ["Engineering"] }, [{ snap_x: true, snap_y: true, bounds: { x: 1, y: 1 }, image: "loader_base", image_anim: "loader", image_only: true }]);
  static LOCKDOWN_OVERRIDE_GREEN = new this(253, "Lockdown Override Unit", "Buildable. Allows a limited number of green rarity items to be removed from a ship while in lockdown mode.", false, 2, "item/lockdown_override_green", { count: 1, time: 20, input: [{ item: 5, count: 64 }], built_by: ["Engineering"] }, [{ bounds: { x: 1, y: 1 }, snap_x: true, snap_y: true, image: "lockdown_override_green", is_lockdown_override: true }], true);
  static BLOCK_ANNIHILATOR = new this(254, "Annihilator Tile", "[TEST EXCLUSIVE] Buildable. Destroys objects.", true, 0, "item/annihilator_tile", void 0, [{ snap_x: true, snap_y: true, bounds: { x: 1, y: 1 }, block: 15 }]);
  static FLUID_TANK = new this(255, "Fluid Tank", "Buildable. Stores fluids.", false, 0, "item/tank", { count: 1, time: 20, input: [{ item: 1, count: 64 }], built_by: ["Engineering"] }, [{ bounds: { x: 2, y: 2 }, snap_x: true, snap_y: true, offset: { x: 0.5, y: 0.5 }, offset2: { x: -0.5, y: -0.5 }, image: "tank" }]);
  static SHIELD_GENERATOR = new this(256, "Shield Generator", "Buildable. Generates shield fluid.", false, 2, "item/shield_generator", void 0, [{ bounds: { x: 4, y: 2 }, snap_x: true, snap_y: true, offset: { x: 0.5, y: 0.5 }, offset2: { x: -0.5, y: -0.5 }, image: "shield_generator", build_angle: "Fixed", image_only: true }]);
  static SHIELD_PROJECTOR = new this(257, "Shield Projector", "Buildable. Used to activate an adjacent bank of shield tanks.", false, 2, "item/shield_projector", void 0, [{ bounds: { x: 1, y: 1 }, snap_x: true, snap_y: true, image: "shield_projector_1" }]);
  static TURRET_CONTROLLER_NEW = new this(258, "Enhanced Turret Controller", "Buildable. Used to control turrets remotely.", false, 2, "item/turret_controller_new", void 0, [{ bounds: { x: 1, y: 1 }, snap_x: true, snap_y: true }]);
  static BULK_EJECTOR = new this(259, "Bulk Ejector (Packaged)", "Buildable. WIP / UNOBTAINABLE", false, 2, "item/bulk_ejector", void 0, [{ bounds: { x: 2, y: 2 }, snap_x: true, snap_y: true, offset: { x: 0.5, y: 0.5 }, offset2: { x: -0.5, y: -0.5 }, build_angle: "Fixed" }]);
  static BULK_BAY_MARKER = new this(260, "Bulk Loading Bay Designator (Packaged)", "Buildable. WIP / UNOBTAINABLE", false, 2, "item/bulk_bay_marker", void 0, [{ bounds: { x: 1, y: 1 }, snap_x: true, snap_y: true }]);
  static NAV_UNIT = new this(261, "Navigation Unit (Starter, Packaged)", "Buildable Starter Item. Used to select a destination zone and initiate emergency warps. Also functions as a simple shield projector.", false, -1, "item/nav_unit", void 0, [{ bounds: { x: 1, y: 1 }, snap_x: true, snap_y: true }]);
  static BLOCK_LOGISTICS_RAIL = new this(262, "Logistics Rail", "Buildable. Used by munitions supply units to deliver munitions.", true, 0, "item/logistics_rail", { count: 1, time: 1, input: [{ item: 1, count: 2 }], built_by: ["Engineering"] }, [{ snap_x: true, snap_y: true, bounds: { x: 1, y: 1 }, block: 16 }]);
  static TURRET_ACUTE = new this(263, "Acute Cannon (Packaged)", "Buildable. A gun with a limited firing angle, and a slightly improved fire-rate.", false, 1, "item/turret_acute", void 0, [{ buildDirection: "HORIZONTAL", snap_x: true, snap_y: true, bounds: { x: 2.8, y: 0.8 }, require_blocks: [{ x: 0, y: 0, block: "HULL_H" }, { x: 1, y: 0, block: "HULL_H" }, { x: -1, y: 0, block: "HULL_H" }], allow_world: true }, { buildDirection: "VERTICAL", snap_x: true, snap_y: true, bounds: { x: 0.8, y: 2.8 }, require_blocks: [{ x: 0, y: 0, block: "HULL_V" }, { x: 0, y: 1, block: "HULL_V" }, { x: 0, y: -1, block: "HULL_V" }], allow_world: true }]);
  static MUNITIONS_SUPPLY_UNIT = new this(264, "Munitions Supply Unit (Packaged)", "Buildable. Sends munitions to turrets via logistics rails.", false, 1, "item/msu", void 0, [{ bounds: { x: 2, y: 2 }, snap_x: true, snap_y: true, offset: { x: 0.5, y: 0.5 }, offset2: { x: -0.5, y: -0.5 } }]);
  static TURRET_OBTUSE = new this(265, "Obtuse Cannon (Packaged)", "Buildable. A gun which preserves ammo, and has a slightly reduced fire-rate.", false, 1, "item/turret_obtuse", void 0, [{ buildDirection: "HORIZONTAL", snap_x: true, snap_y: true, bounds: { x: 2.8, y: 0.8 }, require_blocks: [{ x: 0, y: 0, block: "HULL_H" }, { x: 1, y: 0, block: "HULL_H" }, { x: -1, y: 0, block: "HULL_H" }], allow_world: true }, { buildDirection: "VERTICAL", snap_x: true, snap_y: true, bounds: { x: 0.8, y: 2.8 }, require_blocks: [{ x: 0, y: 0, block: "HULL_V" }, { x: 0, y: 1, block: "HULL_V" }, { x: 0, y: -1, block: "HULL_V" }], allow_world: true }]);
  static ETERNAL_WRENCH_BRONZE = new this(300, "Eternal Bronze Wrench", "Patron reward. Will not despawn. Thank you for your support! \u{1F600}", false, -1, "item/wrench_bronze_et");
  static ETERNAL_WRENCH_SILVER = new this(301, "Eternal Silver Wrench", "Patron reward. Will not despawn. Thank you for your support! \u{1F600}", false, -1, "item/wrench_silver_et");
  static ETERNAL_WRENCH_GOLD = new this(302, "Eternal Gold Wrench", "Patron reward. Will not despawn. Thank you for your support! \u{1F600}", false, -1, "item/wrench_gold_et");
  static ETERNAL_WRENCH_FLUX = new this(303, "Eternal Flux Wrench", "Patron reward. Will not despawn. Thank you for your support! \u{1F600}", false, -1, "item/wrench_flux_et");
  static ETERNAL_WRENCH_PLATINUM = new this(304, "Eternal Platinum Wrench", "Patron reward. Will not despawn. Thank you for your support! \u{1F600}", false, -1, "item/wrench_platinum_et");
  static TROPHY_NULL = new this(305, "Gold Null Trophy", "RIP 0x items.", false, 9, "item/trophy_null");
  static TROPHY_BUG_HUNTER = new this(306, "Bug Hunter Trophy", "Rewarded for reporting a serious problem.", false, -1, "item/trophy_bug");
  static TROPHY_NULL_SILVER = new this(307, "Silver Null Trophy", "RIP 0x items.", false, 9, "item/trophy_null_silver");
  static PAT_WRENCH_BRONZE = new this(308, "Bronze Wrench", "Patron reward. Thank you for your support! \u{1F600}", false, 0, "item/wrench_bronze", { count: 1, time: 5, input: [{ item: 1, count: 4 }], built_by: ["Starter", "Engineering"] });
  static PAT_WRENCH_SILVER = new this(309, "Silver Wrench", "Patron reward. Thank you for your support! \u{1F600}", false, 0, "item/wrench_silver", { count: 1, time: 5, input: [{ item: 1, count: 4 }], built_by: ["Starter", "Engineering"] });
  static PAT_WRENCH_GOLD = new this(310, "Gold Wrench", "Patron reward. Thank you for your support! \u{1F600}", false, 0, "item/wrench_gold", { count: 1, time: 5, input: [{ item: 1, count: 4 }], built_by: ["Starter", "Engineering"] });
  static PAT_WRENCH_PLATINUM = new this(311, "Platinum Wrench", "Patron reward. Thank you for your support! \u{1F600}", false, 0, "item/wrench_platinum", { count: 1, time: 5, input: [{ item: 1, count: 4 }], built_by: ["Starter", "Engineering"] });
  static PAT_WRENCH_FLUX = new this(312, "Flux Wrench", "Patron reward. Thank you for your support! \u{1F600}", false, 0, "item/wrench_flux", { count: 1, time: 5, input: [{ item: 1, count: 4 }], built_by: ["Starter", "Engineering"] });
  static COS_LESSER_CAP = new this(313, "Lesser Cap", "Cosmetic Equipment (Head). Patron reward.", false, 0, "item/cap", { count: 1, time: 5, input: [{ item: 1, count: 4 }], built_by: ["Equipment"] });
  static COS_GOOFY_GLASSES = new this(314, "Goofy Glasses", "Cosmetic Equipment (Face). Patron reward.", false, 0, "item/glasses", { count: 1, time: 5, input: [{ item: 1, count: 4 }], built_by: ["Equipment"] });
  static COS_SHADES = new this(315, "Shades", "Cosmetic Equipment (Face). Patron reward.", false, 0, "item/shades", { count: 1, time: 5, input: [{ item: 1, count: 4 }], built_by: ["Equipment"] });
  static COS_TOP_HAT = new this(316, "Top Hat", "Cosmetic Equipment (Head). Patron reward.", false, 0, "item/top_hat", { count: 1, time: 5, input: [{ item: 1, count: 4 }], built_by: ["Equipment"] });
  static COS_HORNS = new this(317, "Demon Horns", "Cosmetic Equipment (Head). Patron reward.", false, 0, "item/horns", { count: 1, time: 5, input: [{ item: 1, count: 4 }], built_by: ["Equipment"] });
  static COS_MASK_ALIEN = new this(318, "Alien Mask", "Cosmetic Equipment (Face). Patron reward.", false, 0, "item/mask_alien", { count: 1, time: 5, input: [{ item: 1, count: 4 }], built_by: ["Equipment"] });
  static COS_MASK_CLOWN = new this(319, "Clown Mask", "Cosmetic Equipment (Face). Patron reward.", false, 0, "item/mask_clown", { count: 1, time: 5, input: [{ item: 1, count: 4 }], built_by: ["Equipment"] });
  static COS_MASK_GOBLIN = new this(320, "Goblin Mask", "Cosmetic Equipment (Face). Patron reward.", false, 0, "item/mask_goblin", { count: 1, time: 5, input: [{ item: 1, count: 4 }], built_by: ["Equipment"] });
  static COS_PUMPKIN = new this(321, "Pumpkin", "Cosmetic Equipment (Face). Patron reward.", false, 0, "item/mask_pumpkin", { count: 1, time: 5, input: [{ item: 1, count: 4 }], built_by: ["Equipment"] });
  static COS_WITCH_HAT = new this(322, "Witch Hat", "Cosmetic Equipment (Head). Patron reward.", false, 0, "item/witch_hat", { count: 1, time: 5, input: [{ item: 1, count: 4 }], built_by: ["Equipment"] });
  static GREMLIN_RED = new this(323, "Wild Gremlin (Red)", "It looks upset.", false, 0, "item/gremlin_red");
  static GREMLIN_ORANGE = new this(324, "Wild Gremlin (Orange)", "It looks upset.", false, 0, "item/gremlin_orange");
  static GREMLIN_YELLOW = new this(325, "Wild Gremlin (Yellow)", "It looks upset.", false, 0, "item/gremlin_yellow");
  static ELIMINATION_LOOT_BOX = new this(326, "Elimination Loot Box", "Recycle in a safe zone to unbox.", true, 2, "item/loot_box");
  static ELIMINATION_LOOT_BOX_LOCKED = new this(327, "Elimination Loot Box (Locked)", "Recycle in a safe zone to unbox.", true, 2, "item/loot_box_locked");
  static {
    this.end();
  }
};

// src/constants/ShapeEnum.ts
var Shape = class _Shape extends Enum {
  constructor(v, vertices) {
    super(v);
    this.vertices = vertices;
  }
  get isBuildSurface() {
    return _Shape.buildSurfaceShapes.has(this);
  }
  static BLOCK = new this(0, [{ x: -0.5, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: 0.5, y: 0.5 }, { x: -0.5, y: 0.5 }]);
  static RAMP_UR = new this(1, [{ x: -0.5, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: -0.5, y: 0.5 }]);
  static RAMP_DR = new this(2, [{ x: -0.5, y: -0.5 }, { x: 0.5, y: 0.5 }, { x: -0.5, y: 0.5 }]);
  static RAMP_DL = new this(3, [{ x: 0.5, y: -0.5 }, { x: 0.5, y: 0.5 }, { x: -0.5, y: 0.5 }]);
  static RAMP_UL = new this(4, [{ x: -0.5, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: 0.5, y: 0.5 }]);
  static SLAB_U = new this(5, [{ x: -0.5, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: 0.5, y: 0 }, { x: -0.5, y: 0 }]);
  static SLAB_R = new this(6, [{ x: -0.5, y: -0.5 }, { x: 0, y: -0.5 }, { x: 0, y: 0.5 }, { x: -0.5, y: 0.5 }]);
  static SLAB_D = new this(7, [{ x: -0.5, y: 0 }, { x: 0.5, y: 0 }, { x: 0.5, y: 0.5 }, { x: -0.5, y: 0.5 }]);
  static SLAB_L = new this(8, [{ x: 0, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: 0.5, y: 0.5 }, { x: 0, y: 0.5 }]);
  static HALF_RAMP_1_U = new this(9, [{ x: -0.5, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: -0.5, y: 0 }]);
  static HALF_RAMP_1_R = new this(10, [{ x: -0.5, y: -0.5 }, { x: 0, y: 0.5 }, { x: -0.5, y: 0.5 }]);
  static HALF_RAMP_1_D = new this(11, [{ x: 0.5, y: 0 }, { x: 0.5, y: 0.5 }, { x: -0.5, y: 0.5 }]);
  static HALF_RAMP_1_L = new this(12, [{ x: 0, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: 0.5, y: 0.5 }]);
  static HALF_RAMP_2_U = new this(13, [{ x: -0.5, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: 0.5, y: 0 }, { x: -0.5, y: 0.5 }]);
  static HALF_RAMP_2_R = new this(14, [{ x: -0.5, y: -0.5 }, { x: 0, y: -0.5 }, { x: 0.5, y: 0.5 }, { x: -0.5, y: 0.5 }]);
  static HALF_RAMP_2_D = new this(15, [{ x: -0.5, y: 0 }, { x: 0.5, y: -0.5 }, { x: 0.5, y: 0.5 }, { x: -0.5, y: 0.5 }]);
  static HALF_RAMP_2_L = new this(16, [{ x: -0.5, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: 0.5, y: 0.5 }, { x: 0, y: 0.5 }]);
  static HALF_RAMP_1_UI = new this(17, [{ x: -0.5, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: 0.5, y: 0 }]);
  static HALF_RAMP_1_RI = new this(18, [{ x: -0.5, y: -0.5 }, { x: 0, y: -0.5 }, { x: -0.5, y: 0.5 }]);
  static HALF_RAMP_1_DI = new this(19, [{ x: -0.5, y: 0 }, { x: 0.5, y: 0.5 }, { x: -0.5, y: 0.5 }]);
  static HALF_RAMP_1_LI = new this(20, [{ x: 0.5, y: -0.5 }, { x: 0.5, y: 0.5 }, { x: 0, y: 0.5 }]);
  static HALF_RAMP_2_UI = new this(21, [{ x: -0.5, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: 0.5, y: 0.5 }, { x: -0.5, y: 0 }]);
  static HALF_RAMP_2_RI = new this(22, [{ x: -0.5, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: 0, y: 0.5 }, { x: -0.5, y: 0.5 }]);
  static HALF_RAMP_2_DI = new this(23, [{ x: -0.5, y: -0.5 }, { x: 0.5, y: 0 }, { x: 0.5, y: 0.5 }, { x: -0.5, y: 0.5 }]);
  static HALF_RAMP_2_LI = new this(24, [{ x: 0, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: 0.5, y: 0.5 }, { x: -0.5, y: 0.5 }]);
  static HALF_RAMP_3_U = new this(25, [{ x: -0.5, y: 0 }, { x: 0.5, y: 0 }, { x: -0.5, y: 0.5 }]);
  static HALF_RAMP_3_R = new this(26, [{ x: 0, y: -0.5 }, { x: 0.5, y: 0.5 }, { x: 0, y: 0.5 }]);
  static HALF_RAMP_3_D = new this(27, [{ x: 0.5, y: -0.5 }, { x: 0.5, y: 0 }, { x: -0.5, y: 0 }]);
  static HALF_RAMP_3_L = new this(28, [{ x: -0.5, y: -0.5 }, { x: 0, y: -0.5 }, { x: 0, y: 0.5 }]);
  static HALF_RAMP_3_UI = new this(29, [{ x: -0.5, y: 0 }, { x: 0.5, y: 0 }, { x: 0.5, y: 0.5 }]);
  static HALF_RAMP_3_RI = new this(30, [{ x: 0, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: 0, y: 0.5 }]);
  static HALF_RAMP_3_DI = new this(31, [{ x: -0.5, y: -0.5 }, { x: 0.5, y: 0 }, { x: -0.5, y: 0 }]);
  static HALF_RAMP_3_LI = new this(32, [{ x: 0, y: -0.5 }, { x: 0, y: 0.5 }, { x: -0.5, y: 0.5 }]);
  static QUARTER_UR = new this(33, [{ x: -0.5, y: -0.5 }, { x: 0, y: -0.5 }, { x: 0, y: 0 }, { x: -0.5, y: 0 }]);
  static QUARTER_DR = new this(34, [{ x: -0.5, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0.5 }, { x: -0.5, y: 0.5 }]);
  static QUARTER_DL = new this(35, [{ x: 0, y: 0 }, { x: 0.5, y: 0 }, { x: 0.5, y: 0.5 }, { x: 0, y: 0.5 }]);
  static QUARTER_UL = new this(36, [{ x: 0, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: 0.5, y: 0 }, { x: 0, y: 0 }]);
  static QUARTER_RAMP_UR = new this(37, [{ x: -0.5, y: -0.5 }, { x: 0, y: -0.5 }, { x: -0.5, y: 0 }]);
  static QUARTER_RAMP_DR = new this(38, [{ x: -0.5, y: 0 }, { x: 0, y: 0.5 }, { x: -0.5, y: 0.5 }]);
  static QUARTER_RAMP_DL = new this(39, [{ x: 0.5, y: 0 }, { x: 0.5, y: 0.5 }, { x: 0, y: 0.5 }]);
  static QUARTER_RAMP_UL = new this(40, [{ x: 0, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: 0.5, y: 0 }]);
  static BEVEL_UR = new this(41, [{ x: -0.5, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: 0.5, y: 0 }, { x: 0, y: 0.5 }, { x: -0.5, y: 0.5 }]);
  static BEVEL_DR = new this(42, [{ x: -0.5, y: -0.5 }, { x: 0, y: -0.5 }, { x: 0.5, y: 0 }, { x: 0.5, y: 0.5 }, { x: -0.5, y: 0.5 }]);
  static BEVEL_DL = new this(43, [{ x: 0, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: 0.5, y: 0.5 }, { x: -0.5, y: 0.5 }, { x: -0.5, y: 0 }]);
  static BEVEL_UL = new this(44, [{ x: -0.5, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: 0.5, y: 0.5 }, { x: 0, y: 0.5 }, { x: -0.5, y: 0 }]);
  static {
    this.end();
  }
  static buildSurfaceShapes = /* @__PURE__ */ new Set([this.BLOCK, this.RAMP_DR, this.RAMP_DL, this.SLAB_D, this.HALF_RAMP_1_D, this.HALF_RAMP_2_R, this.HALF_RAMP_2_D, this.HALF_RAMP_1_DI, this.HALF_RAMP_2_DI, this.HALF_RAMP_2_LI, this.BEVEL_DR, this.BEVEL_DL]);
};

// src/BuildCmd.ts
var BuildCmd = class extends BPCmd {
  x;
  y;
  item;
  bits;
  shape;
  constructor(input) {
    super();
    for (const prop in this)
      Object.defineProperty(this, prop, { configurable: false });
    if (input != null) {
      if (Object.getPrototypeOf(input) != Object.prototype)
        throw new TypeError("input must be an object literal");
      this.set(input);
    }
  }
  set(input) {
    return Object.assign(this, input);
  }
  fillFromArray(arr) {
    this.x = arr[1 /* X */];
    this.y = arr[2 /* Y */];
    this.item = Item.getById(arr[3 /* ITEM */]);
    this.bits = typeof arr[4 /* BITS */] != "undefined" ? new BuildBits(arr[4 /* BITS */]) : void 0;
    this.shape = Shape.getByValue(arr[5 /* SHAPE */]);
    return this;
  }
  toArray() {
    const arr = [];
    arr[0 /* TYPE */] = 0 /* BUILD */;
    if (this.x !== void 0)
      arr[1 /* X */] = this.x;
    if (this.y !== void 0)
      arr[2 /* Y */] = this.y;
    if (this.item !== void 0)
      arr[3 /* ITEM */] = this.item.id;
    if (this.bits !== void 0)
      arr[4 /* BITS */] = this.bits.int;
    if (this.shape !== void 0 && this.shape != Shape.BLOCK) {
      arr[5 /* SHAPE */] = this.shape.enumValue;
      if (typeof arr[4 /* BITS */] == "undefined")
        arr[4 /* BITS */] = 1n;
    }
    return arr;
  }
  clone() {
    const clone = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    if (this.bits)
      clone.bits = this.bits.clone();
    return clone;
  }
};

// src/constants/public.ts
var PREFIX = "DSA:";
var PusherMode = class extends Enum {
  static PUSH = new this(0);
  static PULL = new this(1);
  static DO_NOTHING = new this(2);
  static {
    this.end();
  }
};
var LoaderPoint = class extends Enum {
  static TOP_LEFT = new this(0);
  static TOP = new this(1);
  static TOP_RIGHT = new this(2);
  static LEFT = new this(3);
  static RIGHT = new this(4);
  static BOTTOM_LEFT = new this(5);
  static BOTTOM = new this(6);
  static BOTTOM_RIGHT = new this(7);
  static {
    this.end();
  }
};
var LoaderPriority = class extends Enum {
  static LOW = new this(0);
  static NORMAL = new this(1);
  static HIGH = new this(2);
  static {
    this.end();
  }
};
var FilterMode = class extends Enum {
  static ALLOW_ALL = new this(0);
  static BLOCK_FILTER_ONLY = new this(1);
  static ALLOW_FILTER_ONLY = new this(2);
  static BLOCK_ALL = new this(3);
  static {
    this.end();
  }
};
var FixedAngle = class extends Enum {
  static RIGHT = new this(0);
  static UP = new this(1);
  static LEFT = new this(2);
  static DOWN = new this(3);
  static {
    this.end();
  }
};

// src/ConfigCmd.ts
var defaults = {
  filterMode: FilterMode.ALLOW_ALL,
  filterItems: [Item.NULL, Item.NULL, Item.NULL],
  angle: 0,
  fixedAngle: FixedAngle.RIGHT,
  pusher: {
    defaultMode: PusherMode.DO_NOTHING,
    filteredMode: PusherMode.PUSH,
    angle: 0,
    targetSpeed: 20,
    filterByInventory: false,
    maxBeamLength: 1e3
  },
  loader: {
    pickupPoint: LoaderPoint.LEFT,
    dropPoint: LoaderPoint.RIGHT,
    priority: LoaderPriority.NORMAL,
    stackLimit: 16,
    cycleTime: 20,
    requireOutputInventory: false,
    waitForStackLimit: false
  }
};
var msgKey_prop = {
  filter_config: "filterMode",
  filter_items: "filterItems",
  angle: "angle",
  angle_fixed: "fixedAngle",
  config_pusher: "pusher",
  config_loader: "loader"
};
for (const key in msgKey_prop) {
  msgKey_prop[msgKey_prop[key]] = key;
}
var ConfigCmd = class extends BPCmd {
  static get defaults() {
    return defaults;
  }
  static set defaults(input) {
    if (input != null && Object.getPrototypeOf(input) != Object.prototype)
      throw new TypeError("defaults can only be set to an object literal");
    defaults = input;
  }
  rawData;
  filterMode;
  filterItems;
  angle;
  fixedAngle;
  pusher = {};
  loader = {};
  constructor(input) {
    super();
    for (const prop in this)
      Object.defineProperty(this, prop, { configurable: false });
    if (input != null) {
      if (Object.getPrototypeOf(input) != Object.prototype)
        throw new TypeError("input must be an object literal");
      this.set(input);
    }
  }
  set(input) {
    return Object.assign(this, input);
  }
  fillFromArray(arr) {
    if (arr[1 /* DATA */] == null)
      return this;
    if (arr[1 /* DATA */] instanceof Uint8Array)
      return this.rawData = arr[1 /* DATA */], this;
    arr = arr[1 /* DATA */];
    for (let i = 0; i < arr.length; i++) {
      if (i <= 1) continue;
      if (typeof arr[i] == "string" && arr[i + 1] === 0) {
        const msgKey = arr[i];
        let val = arr[i + 2];
        if (Array.isArray(val))
          val = cfgArrToObj(msgKey, val) ?? val;
        this[msgKey_prop[msgKey] ?? msgKey] = val;
        i += 2;
      }
    }
    return this;
  }
  fillDataFromArray(data) {
    const arr = [];
    arr[0 /* TYPE */] = 1 /* CONFIG */;
    arr[1 /* DATA */] = data;
    return this.fillFromArray(arr);
  }
  toArray() {
    const arr = [];
    arr[0 /* TYPE */] = 1 /* CONFIG */;
    if (this.isRaw) {
      arr[1 /* DATA */] = this.rawData;
      return arr;
    }
    arr[1 /* DATA */] = [0, 0];
    for (const prop of Object.keys(this)) {
      let val = structuredClone(this[prop]);
      const msgKey = msgKey_prop[prop] ?? prop;
      if (val === void 0) continue;
      if (msgKey == "filter_config" /* FILTER_CONFIG */) {
        val = [(val ?? defaults.filterMode).enumValue];
      } else if (msgKey == "filter_items" /* FILTER_ITEMS */) {
        if (val === null)
          val = defaults.filterItems;
        else
          for (let i = 0; i < val.length; i++)
            val[i] = (val[i] ?? defaults.filterItems[i]).enumValue;
      } else if (msgKey == "angle_fixed" /* ANGLE_FIXED */) {
        val = [(val ?? defaults.fixedAngle).enumValue];
      } else if (val === null || Object.getPrototypeOf(val) == Object.prototype) {
        if (val !== null && !Object.keys(val).length)
          continue;
        val = cfgObjToArr(msgKey, val);
      } else if (!Array.isArray(val)) {
        val = [val];
      }
      arr[1 /* DATA */].push(msgKey, 0, val);
    }
    return arr;
  }
  get isRaw() {
    return this.rawData instanceof Uint8Array;
  }
  equals(target) {
    return deepEquals(this, target);
  }
  clone() {
    const clone = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    clone.pusher = { ...this.pusher };
    clone.loader = { ...this.loader };
    if (this.rawData)
      clone.rawData = new Uint8Array(this.rawData);
    return clone;
  }
};
function deepEquals(a, b) {
  if (a === b) return true;
  if (a?.constructor !== b?.constructor) return false;
  const keysA = Object.keys(a);
  return a && b && typeof a === "object" && typeof b === "object" ? keysA.length === Object.keys(b).length && keysA.every((key) => deepEquals(a[key], b[key])) : a === b;
}
function cfgArrToObj(key, arr) {
  switch (key) {
    case "angle" /* ANGLE */:
      return arr[0];
    case "filter_config" /* FILTER_CONFIG */:
      return FilterMode.getByValue(arr[0]);
    case "filter_items" /* FILTER_ITEMS */:
      for (let i = 0; i < arr.length; i++)
        arr[i] = Item.getById(arr[i]);
      return arr;
    case "config_loader" /* LOADER */:
      return {
        pickupPoint: LoaderPoint.getByValue(arr[0 /* PICKUP_POINT */]),
        dropPoint: LoaderPoint.getByValue(arr[1 /* DROP_POINT */]),
        priority: LoaderPriority.getByValue(arr[2 /* PRIORTY */]),
        stackLimit: arr[3 /* STACK_LIMIT */],
        cycleTime: arr[4 /* CYCLE_TIME */],
        requireOutputInventory: arr[5 /* REQUIRE_OUTPUT_INVENTORY */],
        waitForStackLimit: arr[6 /* WAIT_FOR_STACK_LIMIT */]
      };
    case "config_pusher" /* PUSHER */:
      return {
        defaultMode: PusherMode.getByValue(arr[0 /* DEFAULT_MODE */]),
        filteredMode: PusherMode.getByValue(arr[1 /* FILTERED_MODE */]),
        angle: arr[2 /* ANGLE */],
        targetSpeed: arr[3 /* TARGET_SPEED */],
        filterByInventory: arr[4 /* FILTER_BY_INVENTORY */],
        maxBeamLength: arr[5 /* MAX_BEAM_LENGTH */]
      };
    case "angle_fixed" /* ANGLE_FIXED */:
      return FixedAngle.getByValue(arr[0]);
  }
}
function cfgObjToArr(key, obj) {
  const a = [];
  if (obj !== null) {
    for (const key2 in obj)
      if (obj[key2] === null)
        delete obj[key2];
  }
  switch (key) {
    case "config_loader" /* LOADER */:
      obj = { ...defaults.loader, ...obj };
      a[0 /* PICKUP_POINT */] = obj.pickupPoint?.enumValue;
      a[1 /* DROP_POINT */] = obj.dropPoint?.enumValue;
      a[2 /* PRIORTY */] = obj.priority?.enumValue;
      a[3 /* STACK_LIMIT */] = obj.stackLimit;
      a[4 /* CYCLE_TIME */] = obj.cycleTime;
      a[5 /* REQUIRE_OUTPUT_INVENTORY */] = obj.requireOutputInventory;
      a[6 /* WAIT_FOR_STACK_LIMIT */] = obj.waitForStackLimit;
      break;
    case "config_pusher" /* PUSHER */:
      obj = { ...defaults.pusher, ...obj };
      a[0 /* DEFAULT_MODE */] = obj.defaultMode?.enumValue;
      a[1 /* FILTERED_MODE */] = obj.filteredMode?.enumValue;
      a[2 /* ANGLE */] = obj.angle;
      a[3 /* TARGET_SPEED */] = obj.targetSpeed;
      a[4 /* FILTER_BY_INVENTORY */] = obj.filterByInventory;
      a[5 /* MAX_BEAM_LENGTH */] = obj.maxBeamLength;
      break;
  }
  return a;
}

// src/Blueprint.ts
var Blueprint = class {
  version;
  width;
  height;
  commands;
  constructor(input) {
    for (const prop in this)
      Object.defineProperty(this, prop, { configurable: false });
    if (input == null) {
      this.version = 0;
      this.width = 1;
      this.height = 1;
      this.commands = [];
    } else if (Object.getPrototypeOf(input) == Object.prototype) {
      this.version = input.version ?? 0;
      this.width = input.width ?? 1;
      this.height = input.height ?? 1;
      if (input.commands == null) {
        this.commands = [];
      } else {
        if (!Array.isArray(input.commands))
          throw new TypeError("input.commands must be an array");
        this.commands = input.commands;
      }
    } else {
      throw new TypeError("input must be an object literal");
    }
  }
  set(input) {
    return Object.assign(this, input);
  }
  fillFromArray(arr, shallow) {
    this.version = arr[0 /* VER */];
    this.width = arr[1 /* WIDTH */];
    this.height = arr[2 /* HEIGHT */];
    this.commands = shallow ? arr[3 /* CMDS */] : arr[3 /* CMDS */].map((cmd) => {
      if (cmd[0 /* TYPE */] == 0 /* BUILD */)
        return new BuildCmd().fillFromArray(cmd);
      if (cmd[0 /* TYPE */] == 1 /* CONFIG */)
        return new ConfigCmd().fillFromArray(cmd);
    });
    return this;
  }
  toArray(shallow) {
    const arr = [];
    arr[0 /* VER */] = this.version;
    arr[1 /* WIDTH */] = this.width;
    arr[2 /* HEIGHT */] = this.height;
    arr[3 /* CMDS */] = shallow ? this.commands : this.commands.map((c) => c.toArray());
    return arr;
  }
  clone() {
    const clone = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    if (this.commands)
      clone.commands = this.commands.map((c) => c.clone());
    return clone;
  }
};

// src/Decoder.ts
var import_buffer = require("buffer");
var import_zlib = require("zlib");
var arrTypeMap = {
  [0 /* NONE */]: 2 /* TOP */,
  [2 /* TOP */]: 3 /* CMDS */,
  [3 /* CMDS */]: 4 /* CMD */,
  [4 /* CMD */]: 5 /* CFG */
};
var Decoder = class {
  #textDecoder;
  #bytes;
  #view;
  #pos;
  #lastArrType;
  options;
  constructor() {
    this.#textDecoder = new TextDecoder("utf-8");
  }
  #init(buff, lastArrType) {
    this.#bytes = new Uint8Array(buff);
    this.#view = new DataView(buff.buffer);
    this.#pos = 0;
    this.#lastArrType = lastArrType ?? 0 /* NONE */;
  }
  decodeSync(input, options = {}) {
    if (typeof input != "string")
      throw new TypeError("input must be a string");
    if (input.substring(0, PREFIX.length).toUpperCase() == PREFIX)
      input = input.substring(PREFIX.length);
    if (typeof options.ignoreConfigCmdData == "undefined")
      options.ignoreConfigCmdData = false;
    this.options = options;
    let inflated;
    if (typeof import_zlib.inflateRawSync != "undefined") {
      const b64decoded = import_buffer.Buffer.from(input, "base64");
      inflated = (0, import_zlib.inflateRawSync)(b64decoded);
    } else {
      const b64decoded = b64toUi8(input);
      inflated = fflate_inflateSync(b64decoded);
    }
    this.#init(inflated, 0 /* NONE */);
    return new Blueprint().fillFromArray(this.#read(), true);
  }
  decodeConfigCmdSync(cmd) {
    if (!(cmd instanceof ConfigCmd))
      throw new TypeError(`input must be a ${ConfigCmd.name}`);
    if (!cmd.isRaw) return cmd;
    const dataArr = this.decodeConfigCmdData(cmd.rawData);
    cmd.rawData = void 0;
    return cmd.fillDataFromArray(dataArr);
  }
  decodeConfigCmdData(rawCmd) {
    this.#init(rawCmd, 4 /* CMD */);
    return this.#read();
  }
  #read() {
    while (this.#pos < this.#bytes.length) {
      const b = this.#bytes[this.#pos++];
      if (b <= 63) return b;
      if (b <= 127) return b - 128;
      switch (b) {
        case 144 /* ARRAY_BEGIN */:
          return this.#readArray();
        case 128 /* U8 */:
          return this.#readU8();
        case 129 /* U16 */:
          return this.#readU16();
        case 130 /* U32 */:
          return this.#readU32();
        case 131 /* U64 */:
          return this.#readU64();
        case 132 /* I8 */:
          return this.#readI8();
        case 133 /* I16 */:
          return this.#readI16();
        case 134 /* I32 */:
          return this.#readI32();
        case 135 /* I64 */:
          return this.#readI64();
        case 136 /* F32 */:
          return this.#readF32();
        case 137 /* F64 */:
          return this.#readF64();
        case 143 /* NULL */:
          return null;
        case 141 /* TRUE */:
          return true;
        case 142 /* FALSE */:
          return false;
        case 148 /* BYTES_L1 */:
          return this.#readBytes(this.#getU8(), 1);
        case 149 /* BYTES_L2 */:
          return this.#readBytes(this.#getU16(), 2);
        case 150 /* BYTES_L4 */:
          return this.#readBytes(this.#getU32(), 4);
        case 138 /* STR_L1 */:
          return this.#readStr(this.#getU8(), 1);
        case 139 /* STR_L2 */:
          return this.#readStr(this.#getU16(), 2);
        case 140 /* STR_L4 */:
          return this.#readStr(this.#getU32(), 4);
      }
      throw new Error(`unsupported byte: ${b} (0x${b.toString(16)})`);
    }
  }
  #readArray() {
    const arr = [];
    const prevArrType = this.#lastArrType;
    this.#lastArrType = arrTypeMap[prevArrType] ?? 1 /* UNKNOWN */;
    const currArrType = this.#lastArrType;
    while (this.#pos < this.#bytes.length) {
      if (this.#bytes[this.#pos] == 145 /* ARRAY_END */) {
        this.#pos++;
        this.#lastArrType = prevArrType;
        if (currArrType == 4 /* CMD */) {
          if (arr[0 /* TYPE */] === 0 /* BUILD */)
            return new BuildCmd().fillFromArray(arr);
          if (arr[0 /* TYPE */] === 1 /* CONFIG */)
            return new ConfigCmd().fillFromArray(arr);
        }
        return arr;
      }
      arr.push(this.#read());
    }
  }
  #readU8() {
    const v = this.#view.getUint8(this.#pos);
    this.#pos++;
    return v;
  }
  #readU16() {
    const v = this.#view.getUint16(this.#pos, true);
    this.#pos += 2;
    return v;
  }
  #readU32() {
    const v = this.#view.getUint32(this.#pos, true);
    this.#pos += 4;
    return v;
  }
  #readU64() {
    const v = this.#view.getBigUint64(this.#pos, true);
    this.#pos += 8;
    return v;
  }
  #readI8() {
    const v = this.#view.getInt8(this.#pos);
    this.#pos++;
    return v;
  }
  #readI16() {
    const v = this.#view.getInt16(this.#pos, true);
    this.#pos += 2;
    return v;
  }
  #readI32() {
    const v = this.#view.getInt32(this.#pos, true);
    this.#pos += 4;
    return v;
  }
  #readI64() {
    const v = this.#view.getBigInt64(this.#pos, true);
    this.#pos += 8;
    return v;
  }
  #readF32() {
    const v = this.#view.getFloat32(this.#pos, true);
    this.#pos += 4;
    return v;
  }
  #readF64() {
    const v = this.#view.getFloat64(this.#pos, true);
    this.#pos += 8;
    return v;
  }
  #getU8() {
    return this.#view.getUint8(this.#pos);
  }
  #getU16() {
    return this.#view.getUint16(this.#pos, true);
  }
  #getU32() {
    return this.#view.getUint32(this.#pos, true);
  }
  #readStr(byteLength, headerOffset) {
    const offset = this.#pos + headerOffset;
    const str = this.#textDecoder.decode(this.#bytes.slice(offset, offset + byteLength));
    this.#pos += headerOffset + byteLength;
    return str;
  }
  #readBytes(byteLength, headOffset) {
    const readConfig = this.options.ignoreConfigCmdData !== true && this.#lastArrType == 4 /* CMD */;
    const offset = this.#pos + headOffset;
    const arr = this.#bytes.slice(offset, offset + byteLength);
    this.#pos = offset;
    if (readConfig)
      return this.#read();
    this.#pos += byteLength;
    return arr;
  }
};

// src/Encoder.ts
var import_zlib2 = require("zlib");
var Encoder = class _Encoder {
  #textEncoder;
  #bytes;
  #view;
  #pos;
  constructor() {
    this.#textEncoder = new TextEncoder();
  }
  #init(size) {
    this.#view = new DataView(new ArrayBuffer(size));
    this.#bytes = new Uint8Array(this.#view.buffer);
    this.#pos = 0;
  }
  encodeSync(bp) {
    if (!(bp instanceof Blueprint))
      throw new TypeError(`input must be an instance of ${Blueprint.name}`);
    const initSize = bp.commands.length ? Math.max(bp.commands.length * 20, 512) : 4096;
    this.#init(initSize);
    this.#write(bp.toArray(true));
    const encoded = this.#bytes.slice(0, this.#pos);
    if (typeof import_zlib2.deflateRawSync != "undefined") {
      const deflated = (0, import_zlib2.deflateRawSync)(encoded, { level: 9 });
      return deflated.toString("base64");
    } else {
      const deflated = fflate_deflateSync(encoded, { level: 9 });
      return ui8tob64(deflated);
    }
  }
  #encodeArray(arr) {
    this.#init(128);
    this.#write(arr);
    return this.#bytes.slice(0, this.#pos);
  }
  #write(obj) {
    if (typeof obj == "number" || typeof obj == "bigint") {
      this.#writeNumber(obj);
    } else if (typeof obj == "boolean") {
      this.#writeU8(obj ? 141 /* TRUE */ : 142 /* FALSE */);
    } else if (typeof obj == "string") {
      this.#writeStr(obj);
    } else if (obj == null) {
      this.#writeU8(143 /* NULL */);
    } else if (Array.isArray(obj)) {
      this.#writeArr(obj);
    } else if (obj instanceof Uint8Array) {
      this.#writeBin(obj);
    } else if (obj instanceof BuildCmd) {
      this.#writeArr(obj.toArray());
    } else if (obj instanceof ConfigCmd) {
      const arr = obj.toArray();
      if (Array.isArray(arr[1 /* DATA */]))
        arr[1 /* DATA */] = new Uint8Array(new _Encoder().#encodeArray(arr[1 /* DATA */]));
      this.#writeArr(arr);
    } else {
      throw new Error(`unsupported object: ${obj.constructor?.name} ${obj}`);
    }
  }
  #writeNumber(v, isSigned) {
    let isBigInt = typeof v == "bigint";
    if (isBigInt && v <= 4294967295) {
      v = Number(v);
      isBigInt = false;
    }
    if (!Number.isSafeInteger(v) && !isBigInt) {
      this.#writeU8(136 /* F32 */);
      this.#writeF32(v);
      return;
    }
    if (v >= -64 && v <= -1)
      return this.#writeI8(64 | v & 127);
    else if (v >= 0 && v <= 63)
      return this.#writeI8(v);
    if (v < 0 || isSigned) {
      if (-128 <= v && v <= 127) {
        this.#writeU8(132 /* I8 */);
        this.#writeU8(v);
      } else if (-32768 <= v && v <= 32767) {
        this.#writeU8(133 /* I16 */);
        this.#writeI16(v);
      } else if (-2147483648 <= v && v <= 2147483647) {
        this.#writeU8(134 /* I32 */);
        this.#writeI32(v);
      } else {
        this.#writeU8(135 /* I64 */);
        this.#writeI64(BigInt(v));
      }
    } else {
      if (v <= 255) {
        this.#writeU8(128 /* U8 */);
        this.#writeU8(v);
      } else if (v <= 65535) {
        this.#writeU8(129 /* U16 */);
        this.#writeU16(v);
      } else if (v <= 4294967295) {
        this.#writeU8(130 /* U32 */);
        this.#writeU32(v);
      } else {
        this.#writeU8(131 /* U64 */);
        this.#writeU64(BigInt(v));
      }
    }
  }
  #writeStr(v) {
    const utf8arr = this.#textEncoder.encode(v);
    const len = utf8arr.byteLength;
    if (len <= 255) {
      this.#writeU8(138 /* STR_L1 */);
      this.#writeU8(len);
    } else if (len <= 65535) {
      this.#writeU8(139 /* STR_L2 */);
      this.#writeU16(len);
    } else if (len <= 4294967295) {
      this.#writeU8(140 /* STR_L4 */);
      this.#writeU32(len);
    }
    this.#ensureSize(len);
    this.#bytes.set(utf8arr, this.#pos);
    this.#pos += len;
  }
  #writeArr(arr) {
    this.#writeU8(144 /* ARRAY_BEGIN */);
    for (const v of arr)
      this.#write(v);
    this.#writeU8(145 /* ARRAY_END */);
  }
  #writeBin(obj) {
    const size = obj.byteLength;
    if (size <= 255) {
      this.#writeU8(148 /* BYTES_L1 */);
      this.#writeU8(size);
    } else if (size <= 65535) {
      this.#writeU8(149 /* BYTES_L2 */);
      this.#writeU16(size);
    } else if (size <= 4294967295) {
      this.#writeU8(150 /* BYTES_L4 */);
      this.#writeU32(size);
    }
    this.#writeU8arr(obj);
  }
  #writeU8(v) {
    this.#ensureSize(1);
    this.#view.setUint8(this.#pos, v);
    this.#pos++;
  }
  #writeU16(v) {
    this.#ensureSize(2);
    this.#view.setUint16(this.#pos, v, true);
    this.#pos += 2;
  }
  #writeU32(v) {
    this.#ensureSize(4);
    this.#view.setUint32(this.#pos, v, true);
    this.#pos += 4;
  }
  #writeU64(v) {
    this.#ensureSize(8);
    this.#view.setBigUint64(this.#pos, v, true);
    this.#pos += 8;
  }
  #writeI8(v) {
    this.#ensureSize(1);
    this.#view.setInt8(this.#pos, v);
    this.#pos++;
  }
  #writeI16(v) {
    this.#ensureSize(2);
    this.#view.setInt16(this.#pos, v, true);
    this.#pos += 2;
  }
  #writeI32(v) {
    this.#ensureSize(4);
    this.#view.setInt32(this.#pos, v, true);
    this.#pos += 4;
  }
  #writeI64(v) {
    this.#ensureSize(8);
    this.#view.setBigInt64(this.#pos, v, true);
    this.#pos += 8;
  }
  #writeF32(v) {
    this.#ensureSize(4);
    this.#view.setFloat32(this.#pos, v, true);
    this.#pos += 4;
  }
  #writeU8arr(values) {
    this.#ensureSize(values.length);
    this.#bytes.set(values, this.#pos);
    this.#pos += values.length;
  }
  #ensureSize(size) {
    const req = this.#pos + size;
    if (req <= this.#view.byteLength) return;
    const buff = new ArrayBuffer(Math.max(req, this.#view.byteLength + 128));
    const bytes = new Uint8Array(buff);
    const view = new DataView(buff);
    bytes.set(this.#bytes);
    this.#view = view;
    this.#bytes = bytes;
  }
};

// src/util.ts
var import_worker_threads2 = require("worker_threads");

// src/injNode.ts
// var import_worker_threads = require("worker_threads");
// // function createWorker() {
// //   const insideWorker = async (info) => {
// //     const { parentPort: self2 } = require("worker_threads");
// //     let lib;
// //     self2.on("message", async (data) => {
// //       while (!lib) await new Promise((r) => setTimeout(r, 0));
// //       if (data.cmd == "decode") {
// //         try {
// //           data.result = new lib.Decoder().decodeSync(data.args.input, data.args.options).toArray();
// //         } catch (err) {
// //           data.err = err.message;
// //         }
// //         delete data.args;
// //         self2.postMessage(data);
// //       } else if (data.cmd == "decodeConfigCmd") {
// //         try {
// //           data.result = new lib.Decoder().decodeConfigCmdData(data.args.rawData);
// //         } catch (err) {
// //           data.err = err.message;
// //         }
// //         delete data.args;
// //         self2.postMessage(data);
// //       } else if (data.cmd == "encode") {
// //         try {
// //           const bp = new lib.Blueprint().fillFromArray(data.args.input);
// //           data.result = new lib.Encoder().encodeSync(bp);
// //         } catch (err) {
// //           data.err = err.message;
// //         }
// //         delete data.args;
// //         self2.postMessage(data);
// //       }
// //     });
// //     lib = await (info.bundleInfo ? import("@/lib/dsabp.cjs") : import(new URL("index.js", info.path).toString()));
// //   };
// //   const workerData = {
// //     path: __filename,
// //     bundleInfo: { format: "cjs", globalName: "dsabp" }
// //   };
// //   return new import_worker_threads.Worker(
// //     `(${insideWorker.toString()})(${JSON.stringify(workerData)})`,
// //     { eval: true }
// //   );
// // }

// // src/util.ts
// var isNode = globalThis.process?.release?.name == "node";
// var isWorkerThread = isNode ? !import_worker_threads2.isMainThread : typeof WorkerGlobalScope != "undefined" && self instanceof WorkerGlobalScope;
// var wkMsgId = 0;
// var wkRequests = {};
// var worker = isWorkerThread ? null : (isNode ? createWorker : browser_createWorker)();
// function handleWkMessage(data) {
//   if (data.err)
//     wkRequests[data.id].rej(data.err);
//   else
//     wkRequests[data.id].res(data.result);
//   delete wkRequests[data.id];
// }
// if (!isWorkerThread) {
//   if (isNode)
//     worker.on("message", handleWkMessage);
//   else
//     worker.addEventListener("message", (e) => handleWkMessage(e.data));
// }
// function wkPromise(id) {
//   return new Promise((res, rej) => wkRequests[id] = { res, rej });
// }
// async function decodeAsync(input, options) {
//   const id = wkMsgId++;
//   worker.postMessage({ id, cmd: "decode", args: { input, options } });
//   return new Blueprint().fillFromArray(
//     await wkPromise(id)
//   );
// }
// function decodeConfigCmdAsync(rawData) {
//   const id = wkMsgId++;
//   worker.postMessage({ id, cmd: "decodeConfigCmd", args: { rawData } });
//   return wkPromise(id);
// }
// function encodeAsync(input) {
//   const id = wkMsgId++;
//   worker.postMessage({ id, cmd: "encode", args: { input: input.toArray() } });
//   return wkPromise(id);
// }

// src/index.ts
function decodeSync(input, options) {
  return new Decoder().decodeSync(input, options);
}
// async function decode(input, options) {
//   return decodeAsync(input, options);
// }
function decodeConfigCmdSync(cmd) {
  return new Decoder().decodeConfigCmdSync(cmd);
}
async function decodeConfigCmd(cmd) {
  if (!(cmd instanceof ConfigCmd))
    throw new TypeError(`input must be a ${ConfigCmd.name}`);
  if (!cmd.isRaw) return cmd;
  const dataArr = await decodeConfigCmdAsync(cmd.rawData);
  cmd.rawData = void 0;
  return cmd.fillDataFromArray(dataArr);
}
function encodeSync(input) {
  return new Encoder().encodeSync(input);
}
function encode(input) {
  return encodeAsync(input);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BPCmd,
  Blueprint,
  BuildBits,
  BuildCmd,
  ConfigCmd,
  Decoder,
  Encoder,
  Enum,
  FilterMode,
  FixedAngle,
  Item,
  LoaderPoint,
  LoaderPriority,
  PREFIX,
  PusherMode,
  Shape,
  decode,
  decodeConfigCmd,
  decodeConfigCmdSync,
  decodeSync,
  encode,
  encodeSync
});
//# sourceMappingURL=index.cjs.map
