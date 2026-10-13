import { INITIAL, MODELS, modelFor, type PlannerInput } from "./local-model-planner.ts";

export const PLAN_REVISION = "2026-09-26.deepseek-capacity1";
export type Selection = PlannerInput & {
  platformKnown: boolean; goalChosen: boolean; gpuName: string;
  origin: "own" | "example" | "hypothetical";
  priority: "" | "responsive" | "patient";
  spending: "" | "existing" | "compare";
  contextChanged: boolean; parallelChanged: boolean;
};
export const EMPTY_SELECTION: Selection = { ...INITIAL, ram: 0, vram: -1, offload: false,
  platformKnown: false, goalChosen: false, gpuName: "", origin: "own", priority: "", spending: "",
  contextChanged: false, parallelChanged: false };

export function missingFacts(s: Selection): string[] {
  const missing: string[] = [];
  if (!s.platformKnown) missing.push("computer platform");
  if (!s.goalChosen && s.modelId === "auto") missing.push("the work you want to do");
  if (s.mode === "hardware") {
    if (!s.ram) missing.push(s.platform === "mac" ? "unified memory" : "system RAM");
    if (s.platformKnown && s.platform === "windows") {
      if (s.vram < 0) missing.push("dedicated GPU memory (or CPU-only)");
    }
  }
  return missing;
}

export function gpuLabel(s: Selection): string {
  if (s.platform === "mac") return "Apple silicon Mac";
  if (s.vram < 0) return "GPU memory not specified";
  if (s.vram === 0) return "CPU-only";
  return s.gpuName.trim() || "NVIDIA GPU — model not specified";
}

// One effective input feeds sizing, instructions, help and printing.
export function effectiveInput(s: Selection): PlannerInput {
  if (s.mode !== "model") return s;
  // Shopping starts without hardware; prior hidden entries cannot drive its guide.
  const shopping = { ...s, ram: 0, vram: -1, offload: false };
  if (s.modelId !== "auto") return shopping;
  const id = s.goal === "quick" ? "llama3" : s.goal === "balanced"
    ? (s.priority === "responsive" ? "qwen8" : "qwen14")
    : (s.priority === "responsive" ? "qwen14" : "qwen27");
  return { ...shopping, modelId: id };
}

export function editedHardwareOrigin(s: Selection): Selection["origin"] {
  return s.origin === "own" ? "own" : "hypothetical";
}

export function validSelection(value: unknown): value is Selection {
  if (!value || typeof value !== "object") return false;
  const s = value as Selection;
  return ["hardware", "model"].includes(s.mode) && ["mac", "windows"].includes(s.platform)
    && ["quick", "balanced", "deep"].includes(s.goal)
    && ["auto", "custom", ...MODELS.map(m => m.id)].includes(s.modelId)
    && [0,8,16,24,32,36,48,64,96,128,192,256,512,768,1024,1536,2048].includes(s.ram)
    && !(s.platform === "mac" && s.ram > 512)
    && [-1,0,4,6,8,12,16,24,32,48,64,96,128].includes(s.vram)
    && [2048,4096,8192,16384,32768].includes(s.context) && [1,2,4].includes(s.parallel)
    && Number.isFinite(s.customParameters) && s.customParameters >= 1 && s.customParameters <= 700
    && [4,8,16].includes(s.customBits)
    && [s.offload,s.platformKnown,s.goalChosen,s.contextChanged,s.parallelChanged].every(x => typeof x === "boolean")
    && ["own","example","hypothetical"].includes(s.origin)
    && ["","responsive","patient"].includes(s.priority) && ["","existing","compare"].includes(s.spending)
    && typeof s.gpuName === "string" && s.gpuName.length <= 100 && !/[\r\n<>]/.test(s.gpuName)
    && !(["qwen35","qwen359","qwen27","qwen36"].includes(modelFor(effectiveInput(s)).id) && s.parallel>1);
}
