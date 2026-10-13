export const NEW_MODEL_IDS = ["qwen359", "r1full"];
export const NEW_MODEL_KEY = "public-local-model-guide-first-seen-v1";
export const NEW_MODEL_WEEK = 7 * 24 * 60 * 60 * 1000;

// A presentation-only hint. Missing browser storage must never block a plan.
export function newlySeenModels(storage: Pick<Storage, "getItem" | "setItem"> | null, now = Date.now()): string[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(NEW_MODEL_KEY);
    let seen: Record<string, unknown> = {};
    try {
      const parsed = JSON.parse(raw ?? "{}");
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) seen = parsed;
    } catch { /* Replace only the malformed presentation record. */ }
    for (const id of NEW_MODEL_IDS) {
      if (typeof seen[id] !== "number" || !Number.isFinite(seen[id]) || (seen[id] as number) < 0 || (seen[id] as number) > now) seen[id] = now;
    }
    const updated = JSON.stringify(seen);
    if (updated !== raw) storage.setItem(NEW_MODEL_KEY, updated);
    return NEW_MODEL_IDS.filter(id => now - (seen[id] as number) < NEW_MODEL_WEEK);
  } catch { return []; }
}
