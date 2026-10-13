import { MODELS, estimateMemory, modelFor, planLocalSetup } from "./local-model-planner.ts";
import { effectiveInput, validSelection, type Selection } from "./local-setup-selection.ts";

export const TASKS = [
  { id: "design", label: "Understand a technical design", goal: "deep" },
  { id: "writing", label: "Draft a personal message", goal: "quick" },
  { id: "code", label: "Explain or repair code", goal: "balanced" },
  { id: "documents", label: "Ask questions about documents", goal: "balanced" },
] as const;
export const WORKFLOWS = [
  { id: "retrieval", label: "Search a folder of documents", need: "A text model alone does not index a folder. Evaluate a retrieval app; verify its local embedding and storage settings.", licenseName: "MIT", name: "AnythingLLM desktop", link: "https://docs.anythingllm.com/installation-desktop/overview", license: "https://github.com/Mintplex-Labs/anything-llm/blob/master/LICENSE" },
  { id: "ocr", label: "Read scans or images", need: "Extract text before using this text-only setup. Review extraction errors against the original.", licenseName: "MPL-2.0", name: "OCRmyPDF", link: "https://ocrmypdf.readthedocs.io/en/latest/installation.html", license: "https://github.com/ocrmypdf/OCRmyPDF/blob/main/LICENSE" },
  { id: "voice", label: "Speak or search audio", need: "Speech transcription and audio search need separate tools. Start with existing text transcripts, or evaluate a local transcription workflow.", licenseName: "MIT", name: "whisper.cpp", link: "https://github.com/ggml-org/whisper.cpp#quick-start", license: "https://github.com/ggml-org/whisper.cpp/blob/master/LICENSE" },
  { id: "ide", label: "Work inside a code editor", need: "Editor integration, repository context and tool permissions are separate from chat setup.", licenseName: "Apache-2.0", name: "Continue", link: "https://docs.continue.dev/guides/ollama-guide", license: "https://github.com/continuedev/continue/blob/main/LICENSE" },
] as const;
export type TaskId = typeof TASKS[number]["id"];
export type WorkflowId = typeof WORKFLOWS[number]["id"];

// ponytail: conservative phrase rules, never a semantic model or a quality score.
export function interpretGoal(text: string) {
  const tasks: TaskId[] = [];
  const workflows: WorkflowId[] = [];
  const rules: [TaskId, RegExp][] = [["design", /\b(design|engineering|technical|architecture)\b/i], ["writing", /\b(message|relationship|partner|letter|draft|writing)\b/i], ["code", /\b(code|coding|python|function|debug|programming)\b/i], ["documents", /\b(document|documents|pdfs?|summari[sz]e|report|reports)\b/i]];
  const features: [WorkflowId, RegExp][] = [["retrieval", /\b(folder|search|retrieval)\b/i], ["ocr", /\b(scan|scans|scanned|image|images|ocr)\b/i], ["voice", /\b(voice|audio|speech|speak)\b/i], ["ide", /\b(ide|editor|repository|repo)\b/i]];
  for (const [id, pattern] of rules) if (pattern.test(text)) tasks.push(id);
  for (const [id, pattern] of features) if (pattern.test(text)) workflows.push(id);
  const negated = /\b(no|not|never|without|don't|do not|exclude|except)\b/i.test(text);
  return { tasks, workflows, warning: negated ? "Negation detected. Suggested matches may include things you do not want; remove them before applying." : tasks.length > 1 || workflows.length ? "Several needs detected. Confirm each choice; some require separate tools." : !tasks.length ? "No task matched. Choose a task manually; the text has not changed your plan." : "Review the suggested task before applying." };
}

export function normalizeSelection(previous: Selection, patch: Partial<Selection>): Selection | null {
  let next = { ...previous, ...patch };
  if (patch.platform && patch.platform !== previous.platform) next = { ...next, ram: 0, vram: -1, gpuName: "", offload: false, origin: "own" };
  if (["qwen35", "qwen359", "qwen27", "qwen36"].includes(modelFor(effectiveInput(next)).id) && next.parallel > 1) next = { ...next, parallel: 1, parallelChanged: true };
  return validSelection(next) ? next : null;
}

export function applyIntent(selection: Selection, tasks: TaskId[], baseRevision: number, currentRevision: number) {
  if (baseRevision !== currentRevision || !tasks.length || tasks.some(id => !TASKS.some(task => task.id === id))) return null;
  const goal = tasks.includes("design") ? "deep" : tasks.includes("code") || tasks.includes("documents") ? "balanced" : "quick";
  // Keep explicit catalog/custom choice, ownership, hardware and context intact.
  return normalizeSelection(selection, { goal, goalChosen: true });
}

export function trialProfiles(selection: Selection) {
  const input = effectiveInput(selection), model = modelFor(input);
  return { comparison: estimateMemory(model, 4096, 1), everyday: estimateMemory(model, input.context, input.parallel) };
}

export function trialCandidates(selection: Selection, tasks: TaskId[]) {
  const input = effectiveInput(selection), selected = modelFor(input);
  if (!selected.tag || selected.deployment) return [];
  const pair = tasks.includes("documents") ? ["qwen35", "qwen359"] : tasks.includes("writing") && tasks.length === 1 ? ["llama3", "qwen8"] : ["qwen8", "qwen14"];
  return [selected, ...pair.map(id => MODELS.find(m => m.id === id)!)].filter((m, i, list) => list.findIndex(other => other.id === m.id) === i).map(model => ({ model, result: planLocalSetup({ ...input, modelId: model.id, context: 4096, parallel: 1 }) }));
}

export function trialSheet(selection: Selection, tasks: TaskId[], workflows: WorkflowId[], examples: string[], success: string, ratings: string[], reasons: string[] = []) {
  const input = effectiveInput(selection), model = modelFor(input), profiles = trialProfiles(selection);
  return `PERSONAL LOCAL-MODEL TRIAL — nothing sent\nPlanning snapshot: ${JSON.stringify(selection)}\nWhy local: ${reasons.join(", ") || "not specified"}\nTasks: ${tasks.join(", ") || "manual"}\nSeparate components: ${workflows.join(", ") || "none selected"}\nSelected model: ${model.name}; ${model.tag || "not an installable Ollama package"}\nExact digest / actual precision / runtime / engine / requested and effective reasoning mode: RECORD FROM YOUR INSTALL\nComparison: same 4096-token context, one request, same mode and answer budget on both candidates; estimated ${profiles.comparison.low.toFixed(2)}–${profiles.comparison.high.toFixed(2)} GiB\nEveryday: ${input.context} tokens, ${input.parallel} request(s); estimated ${profiles.everyday.low.toFixed(2)}–${profiles.everyday.high.toFixed(2)} GiB\nPreflight: check original rendered input plus history/template/tools and reserved answer/thinking budget. Response token counts do not prove no truncation.\nSuccess means: ${success || "Define correctness, completeness and acceptable wait before running."}\n\n${examples.map((example, index) => `Task ${index + 1}: ${example || "Choose a representative example, including one difficult case."}\nCurrent selected-model outcome: ${ratings[index] || "not run"}\nCandidate A / B: ____ / ____\nPass / usable with edits / fail; errors, wait and observed tokens/sec: ____\n`).join("\n")}\nUse the same tasks and controls for both candidates. Built-in short checks are smoke tests, not usefulness evidence. Save actual answers privately. No measurement upload or trained prediction is implemented.\nDecision: smaller is enough / larger helps / neither is enough / not tested\n`;
}
