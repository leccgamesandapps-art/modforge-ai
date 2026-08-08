/** Derive a clean display name + namespace from a free-text mod description. */

const STOP = new Set([
  "a", "an", "the", "and", "or", "of", "for", "to", "in", "on", "with", "that",
  "create", "make", "add", "build", "generate", "please", "want", "need",
  "mod", "addon", "pack", "minecraft", "bedrock", "java", "fabric",
  "new", "my", "me", "i", "it", "is", "be", "can", "will", "from", "into",
]);

function titleCase(words: string[]): string {
  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function extractModName(prompt: string): string {
  let clean = prompt.replace(/["'`]/g, " ").replace(/\s+/g, " ").trim();

  // "Create a Grenade Mod" / "Grenade mod that..."
  const namedMod = clean.match(
    /(?:create|make|build|generate|add)?\s*(?:a|an|the)?\s*([a-z0-9][\w\s'-]{1,48}?)\s+mod\b/i
  );
  if (namedMod) {
    const raw = namedMod[1]
      .split(/\s+/)
      .filter((w) => w && !STOP.has(w.toLowerCase()));
    if (raw.length) return titleCase(raw.slice(0, 5));
  }

  // "called X" / "named X"
  const called = clean.match(/(?:called|named|name(?:d)?\s*:?)\s+["']?([a-z0-9][\w\s'-]{1,40})["']?/i);
  if (called) {
    const raw = called[1].split(/\s+/).filter((w) => w && !STOP.has(w.toLowerCase()));
    if (raw.length) return titleCase(raw.slice(0, 5));
  }

  // Fallback: meaningful keywords (prefer nouns like grenade, sword, dragon)
  const tokens = clean
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));

  const priority =
    tokens.find((w) =>
      /grenade|bomb|sword|axe|bow|armor|dragon|golem|crystal|ore|staff|pickaxe|helmet|mob|pet/.test(w)
    ) || tokens[0];

  if (!priority) return "Custom Mod";

  // Build short name: priority + up to 2 following content words
  const idx = tokens.indexOf(priority);
  const slice = tokens.slice(idx, idx + 3).filter((w) => !STOP.has(w));
  return titleCase(slice.length ? slice : [priority]);
}

export function slugifyName(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "")
      .slice(0, 40) || "custom_mod"
  );
}
