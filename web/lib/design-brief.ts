import source from "@/content/local-model-design-brief.md?raw";

// The page and downloadable README share one source; never maintain a second copy.
export const designBriefMarkdown = source;
export const designBriefDate = new Date((source.match(/^date: (.+)$/m)?.[1] ?? "2026-09-24") + "T12:00:00Z").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
export const designBriefMinutes = source.match(/^target_duration_minutes: (\d+)$/m)?.[1] ?? "37";
export const designBriefBody = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();
export const briefAnchor = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const briefBlocks = designBriefBody.split(/\n\s*\n/);
export const briefContents = briefBlocks.filter((block) => block.startsWith("## ")).map((block) => ({ title: block.slice(3), id: briefAnchor(block.slice(3)) }));
