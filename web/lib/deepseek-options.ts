import type { Model } from "./local-model-planner.ts";

// Selection is by differentiated use, not by enumerating the publisher's catalog.
// Exact artifact sizes and revisions: research/deepseek-expansion/official-inventory.json.
export const DEEPSEEK_ADDITIONS: Model[] = [
  { id: "r1full", name: "DeepSeek R1-0528 · full 671B", parameters: 671, active: 37,
    tag: "deepseek-r1:671b", bytes: 404430189771, quant: "Q4_K_M", kvPerToken: null,
    purpose: "The full R1 reasoning model, not a distill. An established local-runtime route for exploring the original model family at much higher memory capacity.",
    source: "https://ollama.com/library/deepseek-r1:671b", architecture: "https://huggingface.co/deepseek-ai/DeepSeek-R1-0528" },
  { id: "dv4flash", name: "DeepSeek V4 Flash · 0731", parameters: 304.2,
    tag: "", bytes: 166886535336, quant: "Publisher mixed-precision weights", kvPerToken: null, deployment: "specialist",
    purpose: "Coding and agentic work with a substantially smaller published weight package than V4 Pro. This is the 0731 release, not the superseded preview.",
    source: "https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731", architecture: "https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731/blob/7872f01b1d1fe23eabc4c98b48bffcef5a386062/config.json" },
  { id: "dv4pro", name: "DeepSeek V4 Pro · 0813", parameters: 1650.5,
    tag: "", bytes: 892744322880, quant: "Publisher mixed-precision weights", kvPerToken: null, deployment: "specialist",
    purpose: "The full Pro release for high-capacity coding and agent workflows. Publisher evaluations favor it over Flash on several agent tasks; this is a server-scale option, not a larger Ollama distill.",
    source: "https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-0813", architecture: "https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-0813/blob/72e1d3230f6c080a530b0a1d46f8eb4602340597/config.json" },
  { id: "dv41flash", name: "DeepSeek V4.1 Flash · multimodal", parameters: 763.2,
    tag: "", bytes: 510296708312, quant: "Publisher mixed-precision weights", kvPerToken: null, deployment: "specialist",
    purpose: "A separate direction for image-and-text tasks and input-heavy workflows, with compressed attention and conditional memory. Its much larger weight package means it does not replace the lower-storage V4 Flash option.",
    source: "https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash", architecture: "https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/dba1be0a40aa45a94ad051997016db3960a90277/config.json" },
];

export const CAPACITY_REVIEW_DATE = "September 25, 2026";
export const MAC_CAPACITY_SOURCE = "https://www.apple.com/mac-studio/specs/";
export const WINDOWS_CAPACITY_SOURCE = "https://i.dell.com/sites/csdocuments/Merchandizing_Docs/en/precision-7875-spec-sheet.pdf";
export const WINDOWS_RUNTIME_SOURCE = "https://docs.vllm.ai/en/latest/getting_started/installation/gpu/";

export function hardwareOutlook(high: number) {
  // Numeric targets continue above retail tiers. These are planning budgets,
  // not manufacturer minimums or assertions that an appropriate runtime exists.
  const hostTarget = Math.ceil(Math.max(high + 6, high / 0.8) / 16) * 16;
  const macTarget = Math.ceil(Math.max(high + 3, high / 0.8) / 16) * 16;
  const gpuTarget = Math.ceil(Math.max(high + 1, high / 0.9) / 16) * 16;
  return {
    macTarget, hostTarget, gpuTarget,
    mac: macTarget > 512
      ? `The ${macTarget} GiB unified-memory planning target exceeds Apple's listed 512 GB single-Mac maximum as of ${CAPACITY_REVIEW_DATE}. A single Mac at this memory level is not currently offered. A different artifact or memory strategy could change the requirement.`
      : `This ${macTarget} GiB planning target is within Apple's listed maximum of 512 GB unified memory as of ${CAPACITY_REVIEW_DATE}. Match an available Mac memory configuration and a supported runtime; capacity alone does not establish compatibility.`,
    windows: hostTarget <= 2048
      ? `Windows-capable workstations with up to 2 TB of system RAM are listed as of ${CAPACITY_REVIEW_DATE}. This covers the ${hostTarget} GiB host-memory planning target; it does not supply ${gpuTarget} GiB of GPU memory or establish native Windows runtime support.`
      : `The ${hostTarget} GiB host-memory planning target exceeds the 2 TB Windows workstation specification reviewed on ${CAPACITY_REVIEW_DATE}. Investigate server hardware; this is not a claim that no larger system exists.`,
  };
}
