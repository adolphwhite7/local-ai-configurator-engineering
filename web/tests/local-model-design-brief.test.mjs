import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { MODELS, INITIAL, planLocalSetup } from "../lib/local-model-planner.ts";
import { PRACTITIONER_EXAMPLES } from "../lib/local-model-examples.ts";
import { parseBriefBlock, briefInlineParts } from "../lib/brief-format.ts";

const brief = readFileSync(new URL("../content/local-model-design-brief.md", import.meta.url), "utf8");
const headings = [...brief.matchAll(/^## (.+)$/gm)].map((match) => match[1]);
test("brief renders scannable semantic blocks without allowing HTML or unsafe links", () => {
  assert.deepEqual(parseBriefBlock("### A model"), { kind: "heading", level: 3, text: "A model" });
  assert.deepEqual(parseBriefBlock("- First\n- Second"), { kind: "list", items: ["First", "Second"] });
  assert.deepEqual(briefInlineParts("**Choice**").filter(p => p.text), [{ kind: "strong", text: "Choice" }]);
  assert.deepEqual(briefInlineParts("[Source](https://example.com)" ).filter(p => p.text), [{ kind: "link", text: "Source", href: "https://example.com" }]);
  for (const text of ["<script>alert(1)</script>", "[Run](javascript:alert)"]) {
    assert.deepEqual(briefInlineParts(text), [{ kind: "text", text }]);
  }
  assert.ok((brief.match(/^### /gm) ?? []).length >= 25);
  assert.ok((brief.match(/^- /gm) ?? []).length >= 30);
});
test("Design Brief covers every selectable model and demonstration speed", () => {
  for (const model of MODELS) assert.ok(brief.includes(model.name), `Explain ${model.name}`);
  for (const example of PRACTITIONER_EXAMPLES) assert.ok(brief.includes(example.speed.replace("tokens/sec", "tokens per second")), `Explain ${example.id}`);
});
test("serial-request explanation names the affected models without a release-specific exception", () => {
  const journey = readFileSync(new URL("../app/local-models/journey.tsx", import.meta.url), "utf8");
  assert.match(brief, /Qwen 3\.5 · 4B and 9B, Qwen 3\.8 · 27B and Qwen 3\.6 · 35B run one request at a time in this setup/);
  assert.doesNotMatch(brief, /Ollama 0\.34\.4 runs Qwen/);
  assert.match(journey, /supports one request at a time in this setup/);
  assert.match(journey, /This architecture is limited to one request at a time\./);
  assert.doesNotMatch(journey, /one request at a time in Ollama 0\.34\.4/);
});
test("research-only models stay outside the selectable-model section", () => {
  const current = brief.split("## Every model in the current drop-down\n")[1]?.split("## Advanced local hosting research\n")[0];
  const advanced = brief.split("## Advanced local hosting research\n")[1]?.split("## Explore a model that is not listed\n")[0];
  assert.ok(current && advanced);
  for (const model of MODELS) assert.ok(current.includes(`### ${model.name}`), `Current section: ${model.name}`);
  for (const name of ["DeepSeek V4 Flash", "DeepSeek V4 Pro", "DeepSeek V4.1 Flash"]) {
    assert.ok(!current.includes(`### ${name}`), `Research-only model in selectable section: ${name}`);
    assert.ok(advanced.includes(`### ${name}`), `Missing advanced research model: ${name}`);
  }
});
test("opening illustration matches the actual default calculation", () => {
  const result = planLocalSetup(INITIAL);
  assert.equal(result.model.id, "qwen14");
  assert.ok(brief.includes(`${result.memory.low.toFixed(1)}–${result.memory.high.toFixed(1)} GiB`));
  assert.ok(brief.includes(`${result.memory.storage} GB of suggested free disk space`));
});
test("README preserves current/proposed and client-facing boundaries", () => {
  assert.ok(brief.includes("Those additions are not yet choices in the calculator."));
  assert.ok(brief.includes("not a best-to-worst leaderboard"));
  assert.doesNotMatch(brief, /internal review|orchestrat|natural.language narrative|GPU stands for|graphics processing unit|random.access memory/i);
  assert.equal(new Set(headings.map(h => h.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))).size, headings.length);
  for (const title of ["Every model in the current drop-down", "Why these six demonstrations are here", "Models being considered next: practical computers", "Models being considered next: advanced capacity"]) assert.ok(headings.includes(title));
});
test("anonymous reading page and emitted download consume one canonical document", () => {
  const page = readFileSync(new URL("../app/local-models/design-brief/page.tsx", import.meta.url), "utf8");
  const config = readFileSync(new URL("../vite.config.ts", import.meta.url), "utf8");
  const source = readFileSync(new URL("../lib/design-brief.ts", import.meta.url), "utf8");
  assert.match(source, /content\/local-model-design-brief\.md\?raw/);
  assert.match(config, /content\/local-model-design-brief\.md/);
  assert.match(config, /generateBundle/);
  assert.doesNotMatch(page + config, /hasWorkroomAccess|JoinForm/);
  assert.doesNotMatch(page, /dangerouslySetInnerHTML/);
});
