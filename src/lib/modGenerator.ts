import type { GeneratedMod, ModFile, ModPlatform } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { extractModName, slugifyName } from "./modName";

function detectFeatures(prompt: string) {
  const p = prompt.toLowerCase();
  return {
    block: /block|ore|stone|wood|brick|glass|dirt|grass|plank|crystal|gem|mineral|node|log/.test(p),
    item: /item|sword|tool|weapon|food|apple|gem|crystal|staff|pickaxe|axe|shovel|hoe|bow|arrow|grenade|bomb|throwable|projectile/.test(p),
    mob: /mob|entity|creature|animal|zombie|skeleton|dragon|boss|npc|golem|pet|companion|monster/.test(p),
    armor: /armor|helmet|chestplate|leggings|boots|suit/.test(p),
    recipe: /recipe|craft|smelt|brew|furnace|table/.test(p),
    grenade: /grenade|bomb|explosive|throwable|projectile/.test(p),
    glowing: /glow|light|lumin|bright|neon|shine/.test(p),
    food: /food|eat|hunger|apple|meat|bread|soup/.test(p),
  };
}

function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  const table = crcTable();
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

let _crcTable: number[] | null = null;
function crcTable() {
  if (_crcTable) return _crcTable;
  const t: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  _crcTable = t;
  return t;
}

function deflateStore(data: Uint8Array): Uint8Array {
  const blocks: number[] = [];
  blocks.push(0x78, 0x01);
  let offset = 0;
  while (offset < data.length) {
    const chunk = Math.min(65535, data.length - offset);
    const isLast = offset + chunk >= data.length;
    blocks.push(isLast ? 0x01 : 0x00);
    blocks.push(chunk & 0xff, (chunk >> 8) & 0xff);
    blocks.push(~chunk & 0xff, (~chunk >> 8) & 0xff);
    for (let i = 0; i < chunk; i++) blocks.push(data[offset + i]);
    offset += chunk;
  }
  let s1 = 1, s2 = 0;
  for (let i = 0; i < data.length; i++) {
    s1 = (s1 + data[i]) % 65521;
    s2 = (s2 + s1) % 65521;
  }
  const adler = ((s2 << 16) | s1) >>> 0;
  blocks.push((adler >>> 24) & 0xff, (adler >>> 16) & 0xff, (adler >>> 8) & 0xff, adler & 0xff);
  return new Uint8Array(blocks);
}

function buildPng(w: number, h: number, idat: Uint8Array): Uint8Array {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  function chunk(type: string, data: number[] | Uint8Array) {
    const typeBytes = type.split("").map((c) => c.charCodeAt(0));
    const d = data instanceof Uint8Array ? Array.from(data) : data;
    const len = d.length;
    const body = new Uint8Array([...typeBytes, ...d]);
    const crc = crc32(body);
    return [
      (len >>> 24) & 0xff, (len >>> 16) & 0xff, (len >>> 8) & 0xff, len & 0xff,
      ...typeBytes, ...d,
      (crc >>> 24) & 0xff, (crc >>> 16) & 0xff, (crc >>> 8) & 0xff, crc & 0xff,
    ];
  }
  const ihdr = [
    (w >>> 24) & 0xff, (w >>> 16) & 0xff, (w >>> 8) & 0xff, w & 0xff,
    (h >>> 24) & 0xff, (h >>> 16) & 0xff, (h >>> 8) & 0xff, h & 0xff,
    8, 6, 0, 0, 0,
  ];
  const bytes = [...signature, ...chunk("IHDR", ihdr), ...chunk("IDAT", idat), ...chunk("IEND", [])];
  return new Uint8Array(bytes);
}

function makePng(r: number, g: number, b: number, a = 255): Uint8Array {
  const width = 16, height = 16;
  const raw: number[] = [];
  for (let y = 0; y < height; y++) {
    raw.push(0);
    for (let x = 0; x < width; x++) {
      const border = x === 0 || y === 0 || x === 15 || y === 15;
      const checker = (x + y) % 2 === 0;
      if (border) raw.push(Math.min(255, r + 40), Math.min(255, g + 40), Math.min(255, b + 40), a);
      else if (checker) raw.push(r, g, b, a);
      else raw.push(Math.max(0, r - 30), Math.max(0, g - 30), Math.max(0, b - 30), a);
    }
  }
  return buildPng(width, height, deflateStore(new Uint8Array(raw)));
}

function colorFromPrompt(prompt: string): [number, number, number] {
  const p = prompt.toLowerCase();
  if (/grenade|bomb|explosive|fire|lava|red/.test(p)) return [220, 60, 40];
  if (/crystal|diamond|ice|blue|water/.test(p)) return [60, 140, 230];
  if (/emerald|slime|poison|green/.test(p)) return [50, 200, 90];
  if (/gold|yellow|sun/.test(p)) return [240, 200, 40];
  if (/purple|magic|ender|void/.test(p)) return [150, 60, 220];
  if (/iron|steel|gray|stone/.test(p)) return [140, 140, 150];
  return [80, 180, 120];
}

function javaPackage(namespace: string) {
  return `com.modforge.${namespace}`;
}

function generateBedrock(prompt: string, name: string, namespace: string): ModFile[] {
  const files: ModFile[] = [];
  const features = detectFeatures(prompt);
  const uuidBP = uuidv4();
  const uuidRP = uuidv4();
  const [r, g, b] = colorFromPrompt(prompt);
  const iconPng = makePng(r, g, b);
  const itemPng = makePng(Math.min(255, r + 20), g, Math.max(0, b - 20));
  const blockPng = makePng(Math.max(0, r - 20), Math.min(255, g + 15), b);
  const itemId = `${namespace}:core_item`;
  const blockId = `${namespace}:core_block`;
  const entityId = `${namespace}:core_mob`;

  files.push({
    path: "BP/manifest.json",
    type: "json",
    content: JSON.stringify({
      format_version: 2,
      header: { name: `${name} BP`, description: prompt.slice(0, 200), uuid: uuidBP, version: [1, 0, 0], min_engine_version: [1, 20, 60] },
      modules: [
        { type: "data", uuid: uuidv4(), version: [1, 0, 0] },
        { type: "script", language: "javascript", uuid: uuidv4(), version: [1, 0, 0], entry: "scripts/main.js" },
      ],
      dependencies: [{ uuid: uuidRP, version: [1, 0, 0] }],
    }, null, 2),
  });

  files.push({
    path: "RP/manifest.json",
    type: "json",
    content: JSON.stringify({
      format_version: 2,
      header: { name: `${name} RP`, description: `Resources for ${name}`, uuid: uuidRP, version: [1, 0, 0], min_engine_version: [1, 20, 60] },
      modules: [{ type: "resources", uuid: uuidv4(), version: [1, 0, 0] }],
    }, null, 2),
  });

  files.push({ path: "BP/pack_icon.png", type: "png", content: iconPng, binary: true });
  files.push({ path: "RP/pack_icon.png", type: "png", content: iconPng, binary: true });

  const isThrowable = features.grenade;
  files.push({
    path: `BP/items/${namespace}_item.json`,
    type: "json",
    content: JSON.stringify({
      format_version: "1.20.50",
      "minecraft:item": {
        description: { identifier: itemId, menu_category: { category: "equipment", group: "itemGroup.name.sword" } },
        components: {
          "minecraft:max_stack_size": isThrowable ? 16 : 64,
          "minecraft:icon": { texture: `${namespace}_item` },
          "minecraft:display_name": { value: name },
          ...(isThrowable
            ? { "minecraft:throwable": { do_swing_animation: true }, "minecraft:projectile": { projectile_entity: `${namespace}:thrown_projectile` } }
            : { "minecraft:damage": { value: 6 }, "minecraft:hand_equipped": true }),
        },
      },
    }, null, 2),
  });

  files.push({ path: `RP/textures/items/${namespace}_item.png`, type: "png", content: itemPng, binary: true });
  files.push({
    path: "RP/textures/item_texture.json",
    type: "json",
    content: JSON.stringify({
      resource_pack_name: namespace,
      texture_name: "atlas.items",
      texture_data: { [`${namespace}_item`]: { textures: `textures/items/${namespace}_item` } },
    }, null, 2),
  });

  files.push({
    path: `BP/blocks/${namespace}_block.json`,
    type: "json",
    content: JSON.stringify({
      format_version: "1.20.50",
      "minecraft:block": {
        description: { identifier: blockId, menu_category: { category: "construction" } },
        components: {
          "minecraft:destructible_by_mining": { seconds_to_destroy: 2.5 },
          "minecraft:map_color": `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`,
          "minecraft:light_emission": features.glowing ? 12 : 0,
          "minecraft:friction": 0.6,
          "minecraft:material_instances": { "*": { texture: `${namespace}_block`, render_method: "opaque" } },
        },
      },
    }, null, 2),
  });
  files.push({ path: `RP/textures/blocks/${namespace}_block.png`, type: "png", content: blockPng, binary: true });
  files.push({
    path: "RP/textures/terrain_texture.json",
    type: "json",
    content: JSON.stringify({
      resource_pack_name: namespace,
      texture_name: "atlas.terrain",
      padding: 8,
      num_mip_levels: 4,
      texture_data: { [`${namespace}_block`]: { textures: `textures/blocks/${namespace}_block` } },
    }, null, 2),
  });
  files.push({
    path: `RP/models/blocks/${namespace}_block.geo.json`,
    type: "json",
    content: JSON.stringify({
      format_version: "1.12.0",
      "minecraft:geometry": [{
        description: { identifier: `geometry.${namespace}.block`, texture_width: 16, texture_height: 16, visible_bounds_width: 2, visible_bounds_height: 2.5, visible_bounds_offset: [0, 0.75, 0] },
        bones: [{ name: "block", pivot: [0, 0, 0], cubes: [{ origin: [-8, 0, -8], size: [16, 16, 16], uv: [0, 0] }] }],
      }],
    }, null, 2),
  });

  if (features.mob) {
    files.push({
      path: `BP/entities/${namespace}_mob.json`,
      type: "json",
      content: JSON.stringify({
        format_version: "1.20.60",
        "minecraft:entity": {
          description: { identifier: entityId, is_spawnable: true, is_summonable: true, is_experimental: false },
          components: {
            "minecraft:type_family": { family: [namespace, "mob"] },
            "minecraft:health": { value: 30, max: 30 },
            "minecraft:attack": { damage: 4 },
            "minecraft:movement": { value: 0.25 },
            "minecraft:navigation.walk": { can_walk: true },
            "minecraft:movement.basic": {},
            "minecraft:jump.static": {},
            "minecraft:physics": {},
            "minecraft:pushable": { is_pushable: true, is_pushable_by_piston: true },
          },
        },
      }, null, 2),
    });
    files.push({
      path: `RP/entity/${namespace}_mob.entity.json`,
      type: "json",
      content: JSON.stringify({
        format_version: "1.10.0",
        "minecraft:client_entity": {
          description: {
            identifier: entityId,
            materials: { default: "entity_alphatest" },
            textures: { default: `textures/entity/${namespace}_mob` },
            geometry: { default: `geometry.${namespace}.mob` },
            render_controllers: ["controller.render.default"],
            spawn_egg: { base_color: `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`, overlay_color: "#ffffff" },
          },
        },
      }, null, 2),
    });
    files.push({
      path: `RP/models/entity/${namespace}_mob.geo.json`,
      type: "json",
      content: JSON.stringify({
        format_version: "1.12.0",
        "minecraft:geometry": [{
          description: { identifier: `geometry.${namespace}.mob`, texture_width: 64, texture_height: 64, visible_bounds_width: 2, visible_bounds_height: 2, visible_bounds_offset: [0, 1, 0] },
          bones: [
            { name: "body", pivot: [0, 12, 0], cubes: [{ origin: [-4, 8, -3], size: [8, 8, 6], uv: [0, 16] }] },
            { name: "head", parent: "body", pivot: [0, 16, 0], cubes: [{ origin: [-4, 16, -4], size: [8, 8, 8], uv: [0, 0] }] },
          ],
        }],
      }, null, 2),
    });
    files.push({ path: `RP/textures/entity/${namespace}_mob.png`, type: "png", content: makePng(r, Math.max(0, g - 40), Math.min(255, b + 40)), binary: true });
  }

  if (features.grenade) {
    files.push({
      path: `BP/entities/${namespace}_projectile.json`,
      type: "json",
      content: JSON.stringify({
        format_version: "1.20.60",
        "minecraft:entity": {
          description: { identifier: `${namespace}:thrown_projectile`, is_spawnable: false, is_summonable: true },
          components: {
            "minecraft:projectile": {
              on_hit: {
                impact_damage: { damage: 8, knockback: true },
                remove_on_hit: {},
                particle_on_hit: { particle_type: "minecraft:huge_explosion_emitter", num_particles: 8 },
              },
              power: 1.4, gravity: 0.05, angle_offset: 0,
            },
            "minecraft:physics": {},
            "minecraft:pushable": { is_pushable: false },
          },
        },
      }, null, 2),
    });
  }

  files.push({
    path: `BP/recipes/${namespace}_item_recipe.json`,
    type: "json",
    content: JSON.stringify({
      format_version: "1.20.50",
      "minecraft:recipe_shaped": {
        description: { identifier: `${namespace}:core_item_recipe` },
        tags: ["crafting_table"],
        pattern: [" X ", " # ", " # "],
        key: { X: { item: "minecraft:iron_ingot" }, "#": { item: "minecraft:stick" } },
        result: { item: itemId, count: 1 },
      },
    }, null, 2),
  });

  files.push({
    path: `BP/functions/${namespace}/init.mcfunction`,
    type: "mcfunction",
    content: `# ${name} init\ngamerule sendcommandfeedback false\ntellraw @a {"rawtext":[{"text":"§a[ModForge] ${name} loaded"}]}\n`,
  });

  files.push({
    path: "BP/scripts/main.js",
    type: "other",
    content: `import { world } from "@minecraft/server";\n\nworld.afterEvents.itemUse.subscribe((event) => {\n  const item = event.itemStack;\n  if (!item || !item.typeId.includes("${namespace}")) return;\n  event.source.sendMessage("§e[ModForge] ${name} item used!");\n});\n\nconsole.log("[ModForge AI] ${name} script loaded");\n`,
  });

  files.push({
    path: "RP/texts/en_US.lang",
    type: "lang",
    content: `item.${itemId}.name=${name}\ntile.${blockId}.name=${name} Block\nentity.${entityId}.name=${name} Mob\n`,
  });

  files.push({
    path: "RP/texts/languages.json",
    type: "json",
    content: JSON.stringify(["en_US"], null, 2),
  });

  files.push({
    path: "README.md",
    type: "other",
    content: `# ${name}\n\nGenerated by **ModForge AI** from your description.\n\n> ${prompt}\n\n## Install (Bedrock)\n1. Open the .mcaddon\n2. Enable BP + RP in world settings\n\n- Item id: \`${itemId}\`\n- Block id: \`${blockId}\`\n`,
  });

  return files;
}

function generateJava(prompt: string, name: string, namespace: string): ModFile[] {
  const files: ModFile[] = [];
  const features = detectFeatures(prompt);
  const pkg = javaPackage(namespace);
  const pkgPath = pkg.replace(/\./g, "/");
  const classBase = name.replace(/[^a-zA-Z0-9]/g, "") || "CustomMod";
  const [r, g, b] = colorFromPrompt(prompt);
  const iconPng = makePng(r, g, b);
  const itemPng = makePng(Math.min(255, r + 20), g, Math.max(0, b - 20));

  files.push({
    path: "build.gradle",
    type: "gradle",
    content: `plugins {\n    id 'fabric-loom' version '1.7-SNAPSHOT'\n    id 'maven-publish'\n}\nversion = project.mod_version\ngroup = project.maven_group\nbase { archivesName = project.archives_base_name }\nrepositories { mavenCentral() }\ndependencies {\n    minecraft "com.mojang:minecraft:\${project.minecraft_version}"\n    mappings "net.fabricmc:yarn:\${project.yarn_mappings}:v2"\n    modImplementation "net.fabricmc:fabric-loader:\${project.loader_version}"\n    modImplementation "net.fabricmc.fabric-api:fabric-api:\${project.fabric_version}"\n}\njava { withSourcesJar(); sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }\n`,
  });

  files.push({
    path: "gradle.properties",
    type: "properties",
    content: `minecraft_version=1.20.4\nyarn_mappings=1.20.4+build.3\nloader_version=0.15.6\nfabric_version=0.95.1+1.20.4\nmod_version=1.0.0\nmaven_group=${pkg}\narchives_base_name=${namespace}\n`,
  });

  files.push({
    path: "src/main/resources/fabric.mod.json",
    type: "json",
    content: JSON.stringify({
      schemaVersion: 1,
      id: namespace,
      version: "${version}",
      name,
      description: prompt.slice(0, 200),
      authors: ["ModForge AI"],
      license: "MIT",
      icon: `assets/${namespace}/icon.png`,
      environment: "*",
      entrypoints: { main: [`${pkg}.${classBase}Mod`], client: [`${pkg}.client.${classBase}Client`] },
      depends: { fabricloader: ">=0.15.0", minecraft: "~1.20.4", java: ">=17", fabric_api: "*" },
    }, null, 2),
  });

  files.push({
    path: `src/main/java/${pkgPath}/${classBase}Mod.java`,
    type: "java",
    content: `package ${pkg};\n\nimport net.fabricmc.api.ModInitializer;\nimport net.minecraft.item.Item;\nimport net.minecraft.item.ItemGroups;\nimport net.minecraft.registry.Registries;\nimport net.minecraft.registry.Registry;\nimport net.minecraft.util.Identifier;\nimport net.fabricmc.fabric.api.itemgroup.v1.ItemGroupEvents;\nimport org.slf4j.Logger;\nimport org.slf4j.LoggerFactory;\n\npublic class ${classBase}Mod implements ModInitializer {\n    public static final String MOD_ID = "${namespace}";\n    public static final Logger LOGGER = LoggerFactory.getLogger(MOD_ID);\n    public static final Item CORE_ITEM = new Item(new Item.Settings().maxCount(${features.grenade ? 16 : 64}));\n\n    @Override\n    public void onInitialize() {\n        Registry.register(Registries.ITEM, Identifier.of(MOD_ID, "core_item"), CORE_ITEM);\n        ItemGroupEvents.modifyEntriesEvent(ItemGroups.COMBAT).register(entries -> entries.add(CORE_ITEM));\n        LOGGER.info("ModForge AI loaded: ${name}");\n    }\n}\n`,
  });

  files.push({
    path: `src/main/java/${pkgPath}/client/${classBase}Client.java`,
    type: "java",
    content: `package ${pkg}.client;\n\nimport net.fabricmc.api.ClientModInitializer;\n\npublic class ${classBase}Client implements ClientModInitializer {\n    @Override\n    public void onInitializeClient() {}\n}\n`,
  });

  files.push({
    path: `src/main/resources/assets/${namespace}/lang/en_us.json`,
    type: "json",
    content: JSON.stringify({ [`item.${namespace}.core_item`]: name, [`block.${namespace}.core_block`]: `${name} Block` }, null, 2),
  });

  files.push({
    path: `src/main/resources/assets/${namespace}/models/item/core_item.json`,
    type: "json",
    content: JSON.stringify({ parent: "item/generated", textures: { layer0: `${namespace}:item/core_item` } }, null, 2),
  });

  files.push({ path: `src/main/resources/assets/${namespace}/textures/item/core_item.png`, type: "png", content: itemPng, binary: true });
  files.push({ path: `src/main/resources/assets/${namespace}/icon.png`, type: "png", content: iconPng, binary: true });

  files.push({
    path: "README.md",
    type: "other",
    content: `# ${name} (Fabric / Java)\n\nGenerated by **ModForge AI**\n\n> ${prompt}\n\nBuild: ./gradlew build\n`,
  });

  return files;
}

export function generateModFromPrompt(
  prompt: string,
  platform: ModPlatform = "bedrock"
): Omit<GeneratedMod, "id" | "createdAt" | "updatedAt"> {
  // Auto-name from description
  const name = extractModName(prompt);
  const namespace = slugifyName(name);
  const version = "1.0.0";
  const features = detectFeatures(prompt);
  const files = platform === "java" ? generateJava(prompt, name, namespace) : generateBedrock(prompt, name, namespace);
  const tags: string[] = ["ai-generated", platform];
  if (features.block) tags.push("block");
  if (features.item) tags.push("item");
  if (features.mob) tags.push("mob");
  if (features.armor) tags.push("armor");
  if (features.grenade) tags.push("grenade");

  const binaryBytes = files.reduce((sum, f) => sum + (f.binary && f.content instanceof Uint8Array ? f.content.length : 0), 0);
  const textBytes = files.reduce((sum, f) => sum + (typeof f.content === "string" ? f.content.length : 0), 0);
  const totalKb = Math.max(12, Math.round((binaryBytes + textBytes) / 1024));

  return {
    name,
    description: prompt.slice(0, 180),
    prompt,
    version,
    platform,
    published: false,
    files,
    tags,
    sizeEstimate: `~${totalKb} KB`,
  };
}

export async function createDownloadBlob(mod: GeneratedMod): Promise<{ blob: Blob; filename: string }> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  for (const file of mod.files) {
    if (file.binary) {
      if (file.content instanceof Uint8Array) {
        zip.file(file.path, file.content);
      } else if (typeof file.content === "string") {
        const bin = Uint8Array.from(atob(file.content), (c) => c.charCodeAt(0));
        zip.file(file.path, bin);
      }
    } else {
      zip.file(file.path, file.content as string);
    }
  }

  zip.file(
    "GENERATED_BY_MODFORGE_AI.txt",
    `ModForge AI\nName: ${mod.name}\nPrompt: ${mod.prompt}\nPlatform: ${mod.platform}\nFiles: ${mod.files.length}\n`
  );

  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  if (mod.platform === "java") {
    return { blob, filename: `${mod.name.replace(/\s+/g, "_")}_fabric.zip` };
  }
  return { blob, filename: `${mod.name.replace(/\s+/g, "_")}.mcaddon` };
}

export async function createMcaddonBlob(mod: GeneratedMod): Promise<Blob> {
  const { blob } = await createDownloadBlob(mod);
  return blob;
}
