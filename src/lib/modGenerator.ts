import type { GeneratedMod, ModFile } from "@/types";
import { v4 as uuidv4 } from "uuid";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 32) || "custom_mod";
}

function extractName(prompt: string): string {
  const clean = prompt.replace(/["']/g, "").trim();
  const words = clean.split(/\s+/).slice(0, 4);
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "Custom Mod";
}

export function generateModFromPrompt(prompt: string): Omit<GeneratedMod, "id" | "createdAt" | "updatedAt"> {
  const name = extractName(prompt);
  const namespace = slugify(name);
  const version = "1.0.0";
  const uuidBP = uuidv4();
  const uuidRP = uuidv4();

  const isBlock = /block|ore|stone|wood|brick|glass|dirt|grass|plank/i.test(prompt);
  const isItem = /item|sword|tool|weapon|food|apple|gem|crystal|staff/i.test(prompt);
  const isMob = /mob|entity|creature|animal|zombie|skeleton|dragon|boss|npc/i.test(prompt);
  const isArmor = /armor|helmet|chestplate|leggings|boots/i.test(prompt);

  const files: ModFile[] = [];

  files.push({
    path: "BP/manifest.json",
    type: "json",
    content: JSON.stringify(
      {
        format_version: 2,
        header: {
          name: `${name} Behavior`,
          description: prompt.slice(0, 200),
          uuid: uuidBP,
          version: [1, 0, 0],
          min_engine_version: [1, 20, 0],
        },
        modules: [{ type: "data", uuid: uuidv4(), version: [1, 0, 0] }],
        dependencies: [{ uuid: uuidRP, version: [1, 0, 0] }],
      },
      null,
      2
    ),
  });

  files.push({
    path: "BP/pack_icon.png",
    type: "png",
    content: "[AI Generated 128x128 Pack Icon - placeholder binary]",
  });

  if (isBlock) {
    const blockId = `${namespace}:custom_block`;
    files.push({
      path: `BP/blocks/${namespace}_block.json`,
      type: "json",
      content: JSON.stringify(
        {
          format_version: "1.20.50",
          "minecraft:block": {
            description: { identifier: blockId, menu_category: { category: "construction" } },
            components: {
              "minecraft:destructible_by_mining": { seconds_to_destroy: 1.5 },
              "minecraft:destructible_by_explosion": { explosion_resistance: 6 },
              "minecraft:friction": 0.6,
              "minecraft:map_color": "#4CAF50",
              "minecraft:light_emission": 0,
              "minecraft:collision_box": true,
              "minecraft:selection_box": true,
              "minecraft:geometry": "geometry.custom_block",
              "minecraft:material_instances": {
                "*": { texture: `${namespace}_block`, render_method: "opaque" },
              },
            },
          },
        },
        null,
        2
      ),
    });
  }

  if (isItem || isArmor) {
    const itemId = `${namespace}:custom_item`;
    files.push({
      path: `BP/items/${namespace}_item.json`,
      type: "json",
      content: JSON.stringify(
        {
          format_version: "1.20.50",
          "minecraft:item": {
            description: { identifier: itemId, menu_category: { category: "equipment" } },
            components: {
              "minecraft:max_stack_size": 64,
              "minecraft:icon": { texture: `${namespace}_item` },
              "minecraft:display_name": { value: name },
              ...(isArmor
                ? { "minecraft:wearable": { slot: "slot.armor.chest", protection: 5 } }
                : {}),
            },
          },
        },
        null,
        2
      ),
    });
  }

  if (isMob) {
    const entityId = `${namespace}:custom_mob`;
    files.push({
      path: `BP/entities/${namespace}_mob.json`,
      type: "json",
      content: JSON.stringify(
        {
          format_version: "1.20.50",
          "minecraft:entity": {
            description: {
              identifier: entityId,
              is_spawnable: true,
              is_summonable: true,
              is_experimental: false,
            },
            components: {
              "minecraft:type_family": { family: ["custom", "mob"] },
              "minecraft:health": { value: 20, max: 20 },
              "minecraft:movement": { value: 0.25 },
              "minecraft:navigation.walk": { can_walk: true, can_swim: true },
              "minecraft:behavior.look_at_player": { priority: 2, look_distance: 8 },
              "minecraft:physics": {},
              "minecraft:pushable": { is_pushable: true },
            },
            events: {},
          },
        },
        null,
        2
      ),
    });
  }

  files.push({
    path: `BP/recipes/${namespace}_craft.json`,
    type: "json",
    content: JSON.stringify(
      {
        format_version: "1.20.50",
        "minecraft:recipe_shaped": {
          description: { identifier: `${namespace}:craft_item` },
          tags: ["crafting_table"],
          pattern: ["###", "# #", "###"],
          key: { "#": { item: "minecraft:diamond" } },
          result: {
            item: isItem ? `${namespace}:custom_item` : `${namespace}:custom_block`,
            count: 1,
          },
        },
      },
      null,
      2
    ),
  });

  files.push({
    path: "RP/manifest.json",
    type: "json",
    content: JSON.stringify(
      {
        format_version: 2,
        header: {
          name: `${name} Resources`,
          description: `Textures & models for ${name}`,
          uuid: uuidRP,
          version: [1, 0, 0],
          min_engine_version: [1, 20, 0],
        },
        modules: [{ type: "resources", uuid: uuidv4(), version: [1, 0, 0] }],
      },
      null,
      2
    ),
  });

  files.push({
    path: "RP/pack_icon.png",
    type: "png",
    content: "[AI Generated 128x128 Pack Icon - placeholder binary]",
  });

  files.push({
    path: "RP/textures/item_texture.json",
    type: "json",
    content: JSON.stringify(
      {
        resource_pack_name: namespace,
        texture_name: "atlas.items",
        texture_data: {
          [`${namespace}_item`]: { textures: `textures/items/${namespace}_item` },
        },
      },
      null,
      2
    ),
  });

  files.push({
    path: "RP/textures/terrain_texture.json",
    type: "json",
    content: JSON.stringify(
      {
        resource_pack_name: namespace,
        texture_name: "atlas.terrain",
        padding: 8,
        num_mip_levels: 4,
        texture_data: {
          [`${namespace}_block`]: { textures: `textures/blocks/${namespace}_block` },
        },
      },
      null,
      2
    ),
  });

  files.push({
    path: `RP/textures/items/${namespace}_item.png`,
    type: "png",
    content: "[AI Generated 16x16 Item Texture - vibrant custom design]",
  });
  files.push({
    path: `RP/textures/blocks/${namespace}_block.png`,
    type: "png",
    content: "[AI Generated 16x16 Block Texture - seamless tileable]",
  });

  if (isBlock) {
    files.push({
      path: `RP/models/blocks/${namespace}_block.geo.json`,
      type: "json",
      content: JSON.stringify(
        {
          format_version: "1.12.0",
          "minecraft:geometry": [
            {
              description: {
                identifier: "geometry.custom_block",
                texture_width: 16,
                texture_height: 16,
                visible_bounds_width: 2,
                visible_bounds_height: 2.5,
                visible_bounds_offset: [0, 0.75, 0],
              },
              bones: [
                {
                  name: "block",
                  pivot: [0, 0, 0],
                  cubes: [
                    {
                      origin: [-8, 0, -8],
                      size: [16, 16, 16],
                      uv: {
                        north: { uv: [0, 0], uv_size: [16, 16] },
                        east: { uv: [0, 0], uv_size: [16, 16] },
                        south: { uv: [0, 0], uv_size: [16, 16] },
                        west: { uv: [0, 0], uv_size: [16, 16] },
                        up: { uv: [0, 0], uv_size: [16, 16] },
                        down: { uv: [0, 0], uv_size: [16, 16] },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        null,
        2
      ),
    });
  }

  files.push({
    path: "RP/texts/en_US.lang",
    type: "lang",
    content: `tile.${namespace}:custom_block.name=${name} Block\nitem.${namespace}:custom_item.name=${name}\nentity.${namespace}:custom_mob.name=${name} Mob\npack.name=${name}\npack.description=${prompt.slice(0, 120)}`,
  });

  files.push({
    path: "RP/sounds/sound_definitions.json",
    type: "json",
    content: JSON.stringify(
      {
        format_version: "1.14.0",
        sound_definitions: {
          [`${namespace}.custom`]: {
            category: "block",
            sounds: [`sounds/${namespace}/custom`],
          },
        },
      },
      null,
      2
    ),
  });

  if (isMob) {
    files.push({
      path: `RP/animation_controllers/${namespace}.animation_controllers.json`,
      type: "json",
      content: JSON.stringify(
        {
          format_version: "1.10.0",
          animation_controllers: {
            [`controller.animation.${namespace}.general`]: {
              initial_state: "default",
              states: {
                default: {
                  animations: ["idle"],
                  transitions: [{ walk: "query.modified_move_speed > 0.1" }],
                },
                walk: {
                  animations: ["walk"],
                  transitions: [{ default: "query.modified_move_speed <= 0.1" }],
                },
              },
            },
          },
        },
        null,
        2
      ),
    });
  }

  files.push({
    path: "README.md",
    type: "other",
    content: `# ${name}\n\nGenerated by **ModForge AI**\n\n## Prompt\n${prompt}\n\n## Contents\n- Behavior Pack (BP)\n- Resource Pack (RP)\n\n## How to install\n1. Download the .mcaddon\n2. Open with Minecraft (Bedrock)\n3. Enable both packs in world settings\n\n## Files generated\n${files.map((f) => `- ${f.path}`).join("\n")}\n\n---\nCreated with ModForge AI — Instant advanced mods from text.\n`,
  });

  const tags: string[] = [];
  if (isBlock) tags.push("block");
  if (isItem) tags.push("item");
  if (isMob) tags.push("mob");
  if (isArmor) tags.push("armor");
  tags.push("ai-generated", "bedrock");

  return {
    name,
    description: prompt.slice(0, 180),
    prompt,
    version,
    published: false,
    files,
    tags,
    sizeEstimate: `~${Math.max(45, files.length * 8)} KB`,
  };
}

export async function createMcaddonBlob(mod: GeneratedMod): Promise<Blob> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  for (const file of mod.files) {
    if (file.type === "png") {
      zip.file(file.path + ".txt", file.content);
    } else {
      zip.file(file.path, file.content);
    }
  }

  zip.file(
    "GENERATED_BY_MODFORGE_AI.txt",
    `This .mcaddon was generated by ModForge AI.\nPrompt: ${mod.prompt}\nDate: ${mod.createdAt}\n\nIn a full production version, real PNG textures, 3D models and audio would be generated by specialized AI models.`
  );

  return zip.generateAsync({ type: "blob" });
}
