import { DEEPSEEK_ADDITIONS, hardwareOutlook } from "./deepseek-options.ts";
export const REVIEW_DATE = "September 26, 2026";
const GIB = 2 ** 30;
export type PlannerInput = {
  mode: "hardware" | "model"; platform: "mac" | "windows";
  ram: number; vram: number; modelId: string; goal: "quick" | "balanced" | "deep";
  context: number; parallel: number; offload: boolean;
  customParameters: number; customBits: number;
};
export type Model = {
  id: string; name: string; parameters: number; active?: number; tag: string;
  bytes: number; quant: string; kvPerToken: number | null; hybrid?: boolean;
  purpose: string; source: string; architecture: string; minimum?: string;
  deployment?: "specialist";
};
// Artifact metadata: source review Sept 25. Download size is not working RAM.
export const MODELS: Model[] = [
  { id: "llama3", name: "Llama 3.2 · 3B", parameters: 3.2, tag: "llama3.2:3b", bytes: 2000000000, quant: "Q4_K_M", kvPerToken: 114688, purpose: "Lightweight chat, short summaries, and learning the local workflow.", source: "https://ollama.com/library/llama3.2:3b", architecture: "https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct/blob/main/config.json" },
  { id: "qwen35", name: "Qwen 3.5 · 4B", parameters: 4.7, tag: "qwen3.5:4b", bytes: 3389983735, quant: "Q4_K_M", kvPerToken: 32768, hybrid: true, minimum: "0.17.1", purpose: "Compact reasoning and document experiments. A newer small-model option; the 4B name describes the language component.", source: "https://ollama.com/library/qwen3.5:4b", architecture: "https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/config.json" },
  { id: "qwen359", name: "Qwen 3.5 · 9B", parameters: 9.65, tag: "qwen3.5:9b", bytes: 6594474711, quant: "Q4_K_M", kvPerToken: 32768, hybrid: true, minimum: "0.17.1", purpose: "A larger Qwen 3.5 option for multi-step text work, between the compact 4B and larger reasoning models. This plan covers text use.", source: "https://ollama.com/library/qwen3.5:9b", architecture: "https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/config.json" },
  { id: "qwen8", name: "Qwen 3 · 8B", parameters: 8.19, tag: "qwen3:8b-q4_K_M", bytes: 5225388164, quant: "Q4_K_M", kvPerToken: 147456, purpose: "A practical middle ground for everyday writing, document questions, and coding experiments.", source: "https://ollama.com/library/qwen3:8b-q4_K_M", architecture: "https://huggingface.co/Qwen/Qwen3-8B/blob/main/config.json" },
  { id: "qwen14", name: "Qwen 3 · 14B", parameters: 14.8, tag: "qwen3:14b-q4_K_M", bytes: 9276198565, quant: "Q4_K_M", kvPerToken: 163840, purpose: "Compare more involved explanations, coding, and multi-document synthesis with smaller models.", source: "https://ollama.com/library/qwen3:14b-q4_K_M", architecture: "https://huggingface.co/Qwen/Qwen3-14B/blob/main/config.json" },
  { id: "qwen27", name: "Qwen 3.8 · 27B", parameters: 27.3, tag: "qwen3.8:27b", bytes: 17741872154, quant: "Q4_K_M", kvPerToken: 65536, hybrid: true, minimum: "0.32.12", purpose: "A current larger reasoning candidate for complex analysis, synthesis, and coding. The package includes a vision projector; this plan budgets text use.", source: "https://ollama.com/library/qwen3.8:27b", architecture: "https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/config.json" },
  { id: "qwen32", name: "Qwen 3 · 32B", parameters: 32.8, tag: "qwen3:32b-q4_K_M", bytes: 20201253829, quant: "Q4_K_M", kvPerToken: 262144, purpose: "An established larger dense-model comparison for complex writing, coding, and reasoning tasks.", source: "https://ollama.com/library/qwen3:32b-q4_K_M", architecture: "https://huggingface.co/Qwen/Qwen3-32B/blob/main/config.json" },
  { id: "qwen36", name: "Qwen 3.6 · 35B / 3B active", parameters: 35.5, active: 3, tag: "qwen3.6:35b", bytes: 22621314381, quant: "Q4_K_M", kvPerToken: null, hybrid: true, minimum: "0.30.0", purpose: "Sparse mixture-of-experts (MoE) candidate for coding and reasoning. Only part of the model is active per token, but the entire weight set still needs storage and accessible memory.", source: "https://ollama.com/library/qwen3.6:35b", architecture: "https://huggingface.co/Qwen/Qwen3.6-35B-A3B" },
  { id: "r170", name: "DeepSeek R1 distill · 70B", parameters: 70.6, tag: "deepseek-r1:70b", bytes: 42520397873, quant: "Q4_K_M", kvPerToken: 327680, purpose: "Large-model reasoning experiments when capacity and longer waits are acceptable. This is the Llama-based distill, not the full DeepSeek R1 model.", source: "https://ollama.com/library/deepseek-r1:70b", architecture: "https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-70B/blob/main/config.json" },
  { id: "oss120", name: "gpt-oss · 120B / 5.1B active", parameters: 116.8, active: 5.1, tag: "gpt-oss:120b", bytes: 65000000000, quant: "MXFP4", kvPerToken: null, purpose: "A large sparse reasoning model. A 120B MoE is not the same memory or speed proposition as a 120B dense model; practitioner offload examples are shown below.", source: "https://ollama.com/library/gpt-oss:120b", architecture: "https://huggingface.co/openai/gpt-oss-120b" },
  ...DEEPSEEK_ADDITIONS.filter(model => model.id === "r1full"),
];
export const INITIAL: PlannerInput = { mode: "hardware", platform: "windows", ram: 32, vram: 24, modelId: "auto", goal: "balanced", context: 4096, parallel: 1, offload: true, customParameters: 30, customBits: 4 };
export function estimateMemory(model: Model, context: number, parallel: number) {
  const weights = model.bytes / GIB;
  const tokens = Math.max(2048, Math.min(32768, context));
  const sequences = Math.max(1, Math.min(4, parallel));
  const cache = model.kvPerToken === null ? null : model.kvPerToken * tokens * sequences / GIB;
  // Unknown architecture: visible allowance, not a fabricated exact KV calculation.
  const cacheLow = cache ?? 0.25 * (tokens / 4096) * sequences;
  const cacheHigh = cache ?? 1.5 * (tokens / 4096) * sequences;
  const lowBuffer = model.hybrid ? Math.max(1.5, weights * 0.15) : Math.max(1, weights * 0.1);
  const highBuffer = model.hybrid ? Math.max(4, weights * 0.25) : Math.max(3, weights * 0.2);
  return { weights, cache, low: weights + cacheLow + lowBuffer * sequences, high: weights + cacheHigh + highBuffer * sequences, storage: Math.ceil(model.bytes / 1e9 * 2 + 10) };
}
export function availableMemory(input: PlannerInput) {
  return input.platform === "mac" ? Math.max(0, input.ram - Math.max(3, input.ram * 0.2)) : Math.max(0, input.vram - Math.max(1, input.vram * 0.1));
}
function hostMemory(input: PlannerInput) { return Math.max(0, input.ram - Math.max(6, input.ram * 0.2)); }
function candidateBudget(input: PlannerInput) {
  const useHost = input.platform === "windows" && (input.vram === 0 || input.offload);
  return useHost ? Math.max(availableMemory(input), hostMemory(input)) : availableMemory(input);
}
export function modelFor(input: PlannerInput): Model {
  if (input.modelId === "custom") {
    const parameters = Math.max(1, Math.min(700, input.customParameters || 1));
    const bits = [4, 8, 16].includes(input.customBits) ? input.customBits : 4;
    return { id: "custom", name: parameters + "B parameter scenario", parameters, tag: "", bytes: parameters * 1e9 * bits / 8 * 1.15, quant: bits + "-bit scenario", kvPerToken: null, purpose: "Explore a memory class before choosing an exact model. For MoE, enter total parameters, not active parameters. Quality depends on the model, not just its size.", source: "https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/", architecture: "" };
  }
  const chosen = MODELS.find((model) => model.id === input.modelId);
  if (chosen) return chosen;
  const preferences = input.goal === "quick" ? ["qwen35", "llama3"] : input.goal === "deep" ? ["qwen27", "qwen14", "qwen8", "qwen35", "llama3"] : ["qwen14", "qwen8", "qwen35", "llama3"];
  return preferences.map((id) => MODELS.find((model) => model.id === id)!).find((model) => estimateMemory(model, input.context, input.parallel).high <= candidateBudget(input)) ?? MODELS[0];
}
function tier(required: number, tiers: number[]) { return tiers.find((value) => value >= required) ?? null; }
type MemoryFit = "comfortable" | "tight" | "offload" | "cpu" | "larger";

// Describe intended work, not a benchmark rank. Hardware headroom never promotes
// a small model into a stronger reasoning class, and parameters do not imply speed.
const EXPERIENCE_PROFILES: Record<string, { opening: string; work: string }> = {
  r1full: { opening: "A full-model reasoning setup at workstation or server scale.", work: "This is the full R1-0528 model, with 671B total parameters, rather than the 70B distill. It offers the full model's reasoning behavior at a much larger memory footprint." },
  llama3: { opening: "A lightweight setup for everyday questions, short summaries and drafting.", work: "This compact model suits everyday questions, short summaries and drafting." },
  qwen35: { opening: "A compact reasoning setup for focused questions and short document tasks.", work: "This compact reasoning model is intended for focused questions and short document tasks." },
  qwen359: { opening: "A midrange reasoning setup for writing, document questions and coding.", work: "This model is intended for writing, document questions, coding and multi-step text reasoning." },
  qwen8: { opening: "A midrange setup for writing, document questions, coding and multi-step reasoning.", work: "This model is intended for writing, document questions, coding and multi-step reasoning." },
  qwen14: { opening: "A midrange setup for writing, document questions, coding and multi-step reasoning.", work: "This model is intended for writing, document questions, coding and multi-step reasoning." },
  qwen27: { opening: "A higher-capacity setup for more demanding reasoning, coding and document synthesis.", work: "This model is intended for more demanding reasoning, coding and document synthesis." },
  qwen32: { opening: "A higher-capacity setup for more demanding reasoning, coding and document synthesis.", work: "This model is intended for more demanding reasoning, coding and document synthesis." },
  qwen36: { opening: "A higher-capacity setup for more demanding coding and reasoning tasks.", work: "This model is intended for more demanding coding and reasoning tasks." },
  r170: { opening: "A higher-capacity setup for exploring complex reasoning and analysis.", work: "This model is intended for exploring complex reasoning and analysis." },
  oss120: { opening: "A higher-capacity setup for exploring complex reasoning and analysis.", work: "This model is intended for exploring complex reasoning and analysis." },
};

function likelyExperience(input: PlannerInput, model: Model, fit: MemoryFit): string {
  if (model.deployment === "specialist") return `${model.purpose} The capacity figures size the published weight package; they do not establish a working ${input.platform === "mac" ? "Mac" : "native Windows"} deployment. The publisher's server-runtime path is linked in the deployment plan. Response speed has not been inferred from memory capacity.`;
  const profile = EXPERIENCE_PROFILES[model.id];
  const hostFits = hostMemory(input) >= estimateMemory(model, input.context, input.parallel).high;
  const gpuTight = input.vram > 0 && estimateMemory(model, input.context, input.parallel).low <= availableMemory(input);
  const hostOption = hostFits
    ? `Your ${input.ram} GB of system RAM has capacity for this model outside GPU memory. ${input.offload ? "Ollama can use that capacity if it needs to split the model." : "Enable ‘Consider system-RAM offloading’ to include that route in the recommendation."}`
    : `Your ${input.ram} GB of system RAM does not cover the full model’s upper working-memory estimate after the reserve. A CPU or offload fallback needs closer sizing.`;
  // Multi-request changes can also normalize model-specific concurrency in the UI.
  // Name a preview only when no such second selection transition is needed.
  const offloadModel = input.modelId === "auto" && input.parallel === 1 && !input.offload && input.vram > 0
    ? modelFor({ ...input, offload: true }) : null;
  const offloadDirection = offloadModel && offloadModel.id !== model.id
    ? ` With offloading enabled, the starting suggestion for this work would be ${offloadModel.name}.` : "";
  // A sizing scenario has no model identity from which to infer reasoning ability.
  if (!profile) {
    const capacity = { comfortable: input.platform === "windows" ? "The estimated memory requirement fits the GPU allowance with headroom." : "The estimated memory requirement fits with headroom.", tight: input.platform === "windows" ? "The estimated GPU-memory fit is tight." : "The estimated memory fit is tight.", offload: gpuTight ? "GPU memory is a close fit, with system RAM available if offloading is needed." : "This estimate uses a GPU + system-RAM route.", cpu: "This estimate uses CPU processing and system RAM.", larger: input.platform === "windows" && input.vram > 0 ? "The estimated requirement exceeds the GPU-memory allowance." : "The estimated memory requirement exceeds this configuration’s planning allowance." }[fit];
    return `${capacity}${input.platform === "windows" && input.mode === "hardware" && input.vram > 0 ? ` ${hostOption}` : ""} An exact model is needed to describe the likely tasks, reasoning capability and response speed.`;
  }
  if (input.platform === "windows" && input.vram > 0) {
    if (fit === "tight" || fit === "larger") return `${fit === "tight" ? "GPU memory is a close fit" : "The model exceeds the GPU-memory planning allowance"} at ${input.vram} GB VRAM. ${profile.work} ${hostOption}${offloadDirection} Extra system RAM expands the CPU/offload options; it does not increase GPU memory or establish faster replies.`;
    if (fit === "offload") return `${gpuTight ? "GPU memory is a close fit, with system RAM available as a fallback." : "A GPU + system-RAM route for a model beyond this GPU’s memory allowance."} ${profile.work} Your ${input.ram} GB of system RAM provides room for this route. ${gpuTight ? "The model may stay on the GPU or use a CPU/GPU split; inspect placement in the setup guide." : "Ollama chooses the CPU/GPU split at runtime."} Response pace depends on that split, the processors and the model—not the RAM capacity alone.`;
    return `${profile.opening} The selected model has GPU-memory headroom at ${input.vram} GB VRAM. ${hostFits ? `Your ${input.ram} GB system RAM also covers this model’s system-memory planning range.` : hostOption} GPU fit and system-RAM capacity are assessed separately; the chip and task determine response pace.${input.parallel > 1 ? ` The ${input.parallel} active requests share processing power.` : ""}`;
  }
  if (fit === "larger") return `Memory is the main obstacle to regular use with this selection. ${profile.work} The estimated requirement exceeds the available model-memory budget; compare a smaller model or a configuration with more memory.`;
  if (fit === "tight") return `A memory-constrained setup, best approached with short tasks. ${profile.work} There is little spare memory at these settings, so longer sessions may become less responsive. ${input.parallel > 1 ? "One request at a time would leave more working room." : "Keep to one request at a time and use shorter context if memory pressure rises."}`;
  if (fit === "cpu") return `A CPU-based setup for occasional work where longer waits are acceptable. ${profile.work} Response pace depends on the CPU and the task; the memory fit does not establish fast replies.`;
  if (fit === "offload") return `Access to a larger model, with a trade-off in response time. ${profile.work} Some of the model uses system RAM rather than staying entirely in GPU memory. The CPU/GPU split and model architecture determine the wait.`;
  const requests = input.parallel > 1 ? ` The memory estimate includes ${input.parallel} active requests; those requests share processing power.` : "";
  return `${profile.opening} The selected model fits with memory headroom at these settings. The chip, prompt length and time spent reasoning determine response pace.${requests}`;
}

export function planLocalSetup(input: PlannerInput) {
  const model = modelFor(input);
  const memory = estimateMemory(model, input.context, input.parallel);
  const available = availableMemory(input);
  const hostAvailable = hostMemory(input);
  let fit: MemoryFit = memory.high <= available ? "comfortable" : memory.low <= available ? "tight" : "larger";
  const gpuFit = fit;
  if (input.platform === "windows" && fit !== "comfortable" && (input.offload || input.vram === 0) && hostAvailable >= memory.high) fit = input.vram > 0 ? "offload" : "cpu";
  const windowsGpu = input.platform === "windows" && input.vram > 0;
  const title = { comfortable: windowsGpu ? "The model fits the GPU-memory allowance" : "A promising starting configuration", tight: windowsGpu ? "GPU memory is the limiting resource" : "Worth trying with a shorter first session", offload: gpuFit === "tight" ? "Close GPU fit, with a system-RAM fallback" : "A model using GPU + system RAM", cpu: "A CPU-based experiment", larger: windowsGpu ? "Beyond the GPU-memory allowance" : "Outside our default headroom target" }[fit];
  const explanation = {
    comfortable: windowsGpu ? "The upper working-memory estimate fits in dedicated GPU memory after the reserve. System RAM is assessed separately below." : "The estimated workload fits within the planning budget after reserving room for other software.",
    tight: windowsGpu ? "The working-memory range straddles the dedicated GPU allowance. More system RAM leaves this GPU limit unchanged, but can support an offload route." : "Memory headroom is limited. Close GPU-heavy apps, shorten context or compare a smaller model.",
    offload: gpuFit === "tight" ? "The lower estimate fits on the GPU; the upper estimate needs more room. System RAM covers the model if Ollama needs to use a CPU/GPU split." : "System RAM covers the model’s working-memory estimate after the reserve. Ollama can place part of the model on the GPU and the rest in system RAM.",
    cpu: "The model is a plausible system-memory fit. CPU-only inference can be useful for patient, occasional work; expect longer waits than an accelerated setup.",
    larger: windowsGpu ? (hostAvailable >= memory.high ? "Dedicated GPU memory is below the model’s planning range. Your system RAM covers that range; enable offloading to include that option." : "Dedicated GPU memory is below the model’s planning range, and system RAM does not cover the full upper estimate either. Compare a smaller model or more capacity.") : "Compare a smaller model, more memory, or an explicitly tuned offload setup. Some practitioner configurations run below our planning allowance; those examples are shown separately. Extra SSD space is not equivalent to fast memory.",
  }[fit];
  const mac = tier(Math.max(memory.high + 3, memory.high / 0.8), [16, 24, 32, 36, 48, 64, 96, 128, 192, 256, 512]);
  const gpu = tier(Math.max(memory.high + 1, memory.high / 0.9), [8, 12, 16, 24, 32, 48, 64, 96, 128]);
  const host = tier(Math.max(16, memory.high + 6, memory.high / 0.8), [16, 32, 48, 64, 96, 128, 192, 256, 512, 768, 1024, 1536, 2048]);
  const speed = likelyExperience(input, model, fit);
  const fitting = MODELS.filter(candidate => candidate.id !== model.id && estimateMemory(candidate, input.context, input.parallel).high <= (input.platform === "windows" && (input.offload || input.vram === 0) ? Math.max(available, hostAvailable) : available));
  // Keep the established three-band comparisons stable as the catalog grows.
  // The new 9B is an additional nearby choice, not a silent replacement for 8B.
  const comparisonBase = fitting.filter(candidate => candidate.id !== "qwen359" && !candidate.deployment);
  const distinct = [comparisonBase.find(m=>m.parameters<=5), comparisonBase.find(m=>m.parameters>=8&&m.parameters<=15), comparisonBase.find(m=>m.active) ?? comparisonBase.find(m=>m.parameters>15)].filter((m): m is Model=>Boolean(m));
  const nearbyQwen = ["qwen35", "qwen8", "qwen14"].includes(model.id) ? fitting.find(candidate => candidate.id === "qwen359") : undefined;
  if (nearbyQwen) distinct.push(nearbyQwen);
  const resources = input.platform === "mac"
    ? [{ label: "Unified memory", text: `${input.ram} GB installed · ${available.toFixed(1)} GiB planning allowance shared by CPU and GPU.` }]
    : [{ label: "GPU memory", text: input.vram === 0 ? "CPU-only selected; no dedicated GPU allowance is used." : `${input.vram} GB dedicated VRAM · ${available.toFixed(1)} GiB planning allowance.` },
      { label: "System RAM", text: `${input.ram} GB installed · ${hostAvailable.toFixed(1)} GiB planning allowance for model work. ${hostAvailable >= memory.high ? "Covers the full working-memory range for a CPU or offload route." : "Does not cover the full upper estimate for a system-memory route; this is separate from GPU residency."}` }];
  return { model, memory, fit, gpuFit, title, explanation, speed, resources, available, hostAvailable, mac, gpu, host, outlook: hardwareOutlook(memory.high),
    command: model.tag ? "ollama pull " + model.tag + "\nollama run " + model.tag : null,
    contextCommand: "/set parameter num_ctx " + input.context,
    alternatives: [...new Map(distinct.map(m=>[m.id,m])).values()],
  };
}
