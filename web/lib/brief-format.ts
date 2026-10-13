export type BriefBlock =
  | { kind: "heading"; level: 1 | 2 | 3; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "paragraph"; text: string };

// Deliberately bounded Markdown: no raw HTML, embeds, or executable content.
export function parseBriefBlock(block: string): BriefBlock {
  const heading = block.match(/^(#{1,3}) (.+)$/);
  if (heading) return { kind: "heading", level: heading[1].length as 1 | 2 | 3, text: heading[2] };
  const lines = block.split("\n");
  if (lines.every(line => line.startsWith("- "))) return { kind: "list", items: lines.map(line => line.slice(2)) };
  return { kind: "paragraph", text: block };
}

export function briefInlineParts(text: string) {
  return text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https:\/\/[^\s)]+\))/g).map(part => {
    const link = part.match(/^\[([^\]]+)\]\((https:\/\/[^\s)]+)\)$/);
    if (link) return { kind: "link" as const, text: link[1], href: link[2] };
    if (part.startsWith("**") && part.endsWith("**")) return { kind: "strong" as const, text: part.slice(2, -2) };
    return { kind: "text" as const, text: part };
  });
}
