import { planLocalSetup, REVIEW_DATE, type PlannerInput } from "./local-model-planner.ts";
import { effectiveInput, gpuLabel, PLAN_REVISION, type Selection } from "./local-setup-selection.ts";

export type SetupStep = { id: string; stage: "Prepare" | "Install and configure" | "Use your model" | "Recommended workarounds"; title: string; where: string; actions: string[]; commands?: string[]; expected: string; recovery: string; source: string };
export const STAGES = ["Prepare", "Install and configure", "Use your model", "Recommended workarounds"] as const;
export const SERIAL_MODELS = ["qwen35", "qwen359", "qwen27", "qwen36"];
export const RUNTIME_VERSION = "0.34.4";
// One session command owns the baseline and optional recovery paths.
function sessionCommand(input: PlannerInput, cache = "f16", modelStore = false) {
  const values: Record<string, string> = { OLLAMA_NO_CLOUD: "1", OLLAMA_HOST: "127.0.0.1:11434", OLLAMA_CONTEXT_LENGTH: String(input.context), OLLAMA_NUM_PARALLEL: String(input.parallel), OLLAMA_MAX_LOADED_MODELS: "1", OLLAMA_KV_CACHE_TYPE: cache };
  const mac = input.platform === "mac";
  const attention = cache === "f16" ? (mac ? "unset OLLAMA_FLASH_ATTENTION; " : 'Remove-Item Env:OLLAMA_FLASH_ATTENTION -ErrorAction SilentlyContinue\n') : (mac ? "OLLAMA_FLASH_ATTENTION=1 " : '$env:OLLAMA_FLASH_ATTENTION="1"\n');
  const storage = modelStore ? (mac ? 'OLLAMA_MODELS="$modelStore" ' : '$env:OLLAMA_MODELS=$modelStore\n') : "";
  return attention + storage + Object.entries(values).map(([key,value])=>mac ? `${key}=${value}` : `$env:${key}="${value}"`).join(mac ? " " : "\n") + (mac ? " ollama serve" : "\nollama serve");
}
export function setupRunbook(input: PlannerInput): SetupStep[] {
  const { model, memory, fit, gpuFit, outlook } = planLocalSetup(input);
  const step = (s: SetupStep) => s;
  if (model.id === "r1full" && fit === "larger") return [
    step({ id: "capacity", stage: "Prepare", title: "Match the model to enough memory",
      where: "The hardware comparison immediately above this guide.",
      actions: [input.platform === "mac" ? outlook.mac : outlook.windows,
        `This ${model.name} plan estimates ${memory.low.toFixed(1)}–${memory.high.toFixed(1)} GiB of working memory and ${memory.storage} GB of free disk space. These are planning figures, not a measured speed result.`,
        input.platform === "mac" ? "Select Windows in Platform to explore, then compare the system-memory option above; the current single-Mac maximum is below this plan’s memory target." : input.mode === "model" ? "Use the Windows system-memory comparison above to explore a 768 GB or larger workstation class. Then enter the computer’s actual RAM and dedicated GPU memory under Start with my computer." : "If system RAM covers the estimate, select Consider system-RAM offloading. Otherwise compare the 768 GB or larger Windows system-memory option above. The installation steps will update with that selection."],
      expected: "A revised setup with enough RAM for this package, or a different model selection. The full installation guide appears only when the memory plan fits.",
      recovery: "If the hardware you have does not match these options, check the linked hardware requirements and copy troubleshooting details with the exact RAM and GPU before downloading the package.", source: model.source }),
  ];
  if (model.deployment === "specialist") return [
    { id: "deployment-scope", stage: "Prepare", title: "Choose the deployment route",
      where: "The hardware comparison in this guide.",
      actions: [input.platform === "mac" ? outlook.mac : outlook.windows,
        `The budget for ${model.name} is ${memory.low.toFixed(1)}–${memory.high.toFixed(1)} GiB for the loaded package, buffers and a provisional context allowance. Keep ${memory.storage} GB of disk space for weights and staging.`,
        input.platform === "mac" ? "Mac capacity is a forward-planning comparison here. A compatible Metal runtime for this exact published artifact has not been established in this guide."
          : "The publisher documents server inference. Native Windows installation is not established here; a Windows workstation can be the client for a separately configured Linux model server."],
      expected: "An identified server/runtime route, or a saved hardware watchlist—not an instruction to install this package in Ollama.",
      recovery: "Consult the linked publisher documentation with this model and your intended hardware to resolve the runtime route. Selecting another model regenerates the guide.", source: model.source },
    { id: "published-package", stage: "Prepare", title: "Open the exact published package",
      where: "The browser on the computer used to plan the deployment.",
      actions: [`Open the linked publisher page for ${model.name}. The reviewed weight files total ${(model.bytes / 1e9).toFixed(1)} GB.`,
        "Follow the model card's local-deployment documentation for this release. Its files and configuration are a different artifact from an Ollama quantization; keep the full model identity when comparing an alternative package."],
      expected: `The page identifies ${model.source.split("/").pop()}, rather than a hosted API alias or another model version.`,
      recovery: "If the publisher changes the package, ask for an updated plan before using these size figures. An alternate quantization requires its own download size and runtime check.", source: model.source },
    { id: "specialist-runtime", stage: "Install and configure", title: "Use the release-specific server instructions",
      where: "The publisher's local-inference documentation linked below.",
      actions: ["Review its supported hardware, runtime dependencies, weight conversion and message encoding together. The model card also links vLLM and SGLang recipes for specific server configurations.",
        `This saved plan keeps your ${input.context.toLocaleString()}-token context and ${input.parallel}-request sizing scenario. The publisher's long-context examples are different workloads and must not inherit this smaller memory budget.`,
        "The platform-specific, start-to-finish walkthrough for this release is still being prepared. This section is the deployment plan and original instructions, not a completed Mac or Windows installation guide."],
      expected: "A release-matched server recipe with an explicit hardware topology. Adding GPU capacities together does not by itself validate model sharding, interconnect or kernel support.",
      recovery: "Consult the linked publisher instructions to resolve the installation details. No Ollama pull, CPU-only profile or small-GPU workaround is generated for this artifact.", source: model.source + "/tree/main/inference" },
  ];
  if (SERIAL_MODELS.includes(model.id) && input.parallel > 1) throw new Error("This model requires one active request. Update the selection before generating a guide.");
  const mac = input.platform === "mac";
  const cpuOnly = !mac && input.mode === "hardware" && input.vram === 0;
  const shell = mac ? "Terminal" : "PowerShell";
  const freshWindows = mac
    ? "If a session is still running, enter /bye at the >>> prompt in window B, then press Ctrl + C in server window A. Quit the Ollama desktop app if it is running. Close the old command windows. Press Command + Space, type Terminal and press Return for a fresh window A; press Command + N for window B."
    : "If a session is still running, enter /bye at the >>> prompt in window B, then press Ctrl + C in server window A. Quit Ollama from the notification area if it is running. Close the old command windows. Click Start, type PowerShell and open it for a fresh window A; repeat to open window B.";
  const platformDocs = "https://docs.ollama.com/" + (mac ? "macos" : "windows");
  const steps: SetupStep[] = [step({ id: "computer", stage: "Prepare", title: "Check the computer you will use",
    where: mac ? "On the Mac where the model will run, at the desktop." : "On the Windows computer where the model will run, at the desktop.",
    actions: mac ? ["Click the Apple menu at the top left → About This Mac. Check that Chip says Apple M1 or a newer Apple M-series chip. Read Memory and the macOS version; this route requires macOS 14 or newer.", "Compare the memory shown with your plan. Plug the laptop into power. Save your work and close unused apps."]
      : ["Click Start → Settings → System → About. Read Installed RAM and the Windows version. This route needs Windows 10 22H2 or newer on a supported x64 or ARM64 system.", ...(cpuOnly ? ["This configuration uses the CPU and system RAM."] : ["Press Ctrl + Shift + Esc to open Task Manager. Select Performance, then each GPU entry. Record the full GPU name and Dedicated GPU memory capacity—not Shared GPU memory. Laptop and desktop GPU names can have different capacities.", "Compare the exact GPU with the supported NVIDIA cards in the source linked below. Windows requires driver 551.61 or newer; cards with compute capability 5.0–6.2 require driver 570 or newer. Use the current GPU support table to check the requirement for your card.", "To check an existing driver, open PowerShell from Start, type nvidia-smi and press Enter. Read Driver Version. If the command is missing or the driver is below the requirement for your card, open https://www.nvidia.com/en-us/drivers/ in your browser. Select your exact GPU and Windows version, download the recommended driver, then open its installer. If asked to restart, save this plan, restart and reopen it. Installer choices vary by device; check the official installer documentation and copy troubleshooting details if a choice is unclear.", "An AMD or Intel GPU is a different acceleration route; do not enter its memory as NVIDIA VRAM in this guide."]), "Save your work and close unnecessary apps. Keep the laptop plugged in."],
    expected: input.mode === "hardware" ? `Confirm ${input.ram} GB RAM${mac ? ", an Apple M-series chip and macOS 14 or newer" : `, Windows 10 22H2 or newer${cpuOnly ? " (CPU-only route)" : ` and ${input.vram} GB dedicated memory on a supported NVIDIA GPU`}`}. If a specification differs, update that selection in the guide.` : "The hardware options above show the memory classes for this model. When you have the computer in front of you, choose ‘Start with my computer’ and enter its specifications to personalize these checks.",
    recovery: "If a figure differs, change that selection in this guide. For an unsupported OS or GPU, ask about this step. Keep installer security protections enabled.", source: mac ? platformDocs : "https://docs.ollama.com/gpu" }),
    step({ id: "storage", stage: "Prepare", title: "Check free space and choose the download",
      where: mac ? "Finder on the Mac." : "File Explorer on the Windows computer.",
      actions: mac ? ["Click Finder in the Dock. Choose Go → Computer. Select the startup disk, then File → Get Info. Read Available.", `Keep at least ${memory.storage} GB available on the model drive for this plan. This includes staging space for the selected package.`]
        : ["Press Windows + E to open File Explorer. Select This PC. Look at free space beneath the system drive (normally C:).", `Keep at least ${memory.storage} GB available on the model drive for this plan. Existing models use additional space.`],
      expected: `At least ${memory.storage} GB free. The selected model package is about ${(model.bytes / 1e9).toFixed(1)} GB.`,
      recovery: "If space is short, choose a smaller model or move files to your backup. If you keep models on another drive, check its free space instead.", source: platformDocs }),
    step({ id: "install", stage: "Install and configure", title: "Install Ollama—or check the copy you already have",
      where: "A web browser on the computer where the model will run.",
      actions: mac ? ["If Ollama is already installed, go to the next step to check its version. If it needs updating, return here, quit Ollama and install the current download into Applications, replacing the older Ollama app when Finder asks.", "Open Safari (or your usual browser). Press Command + L, paste https://ollama.com/download/mac, and press Return. Click Download for macOS.", "Click Finder in the Dock → Downloads. Double-click the downloaded ollama.dmg file. In the disk-image window, drag Ollama onto Applications. Then open Finder → Applications and double-click Ollama.", "If macOS says ‘Ollama is trying to install its command line interface (CLI) tool,’ authenticate using your Mac login in that macOS prompt. This creates the command used in the next step. The prompt can be skipped when the command is already installed. Do not run a second copy from Downloads."]
        : ["If Ollama is already installed, go to the next step to check its version. If it needs updating, return here, quit Ollama from the notification area and run the current installer.", "Open Microsoft Edge (or your usual browser). Press Ctrl + L, paste https://ollama.com/download/windows, and press Enter. Click Download for Windows.", "Press Windows + E to open File Explorer. Select Downloads, then double-click OllamaSetup.exe. In the English installer, click Install and wait. It installs into your user account without requiring an administrator account, then opens Ollama; a separate Finish button is not expected.", "Use the installer matching the computer’s architecture. If a security warning appears, confirm the download came from the official site and its publisher; do not disable Windows protection. After installation, if Ollama is not open, click Start, type Ollama and open it."],
      expected: "Ollama opens. If Ollama was already installed, use its current stable update instead of creating another installation.",
      recovery: "If the installer looks different, keep the window open and copy troubleshooting details below and describe what you see before seeking help.", source: platformDocs }),
    step({ id: "version", stage: "Install and configure", title: "Open the command window and check the version",
      where: mac ? "The macOS desktop, with Ollama installed." : "The Windows desktop, after the installer finishes.",
      actions: mac ? ["Press Command + Space, type Terminal, then press Return. Use this window for the commands below.", "Copy the command below into Terminal. Press Return."]
        : ["Click Start, type PowerShell, then open Windows PowerShell (or PowerShell). A normal user window is enough; do not choose Run as administrator.", "Copy the command below into PowerShell and press Enter."],
      commands: ["ollama --version"], expected: `The output identifies an Ollama version. These instructions were checked against stable ${RUNTIME_VERSION}. ${model.minimum ? `This artifact requires at least ${model.minimum}; use current stable.` : "The exact earliest compatible version is not established here; use current stable."}`,
      recovery: mac ? "If the command is not found, close and reopen Terminal after completing Ollama’s CLI installation prompt. If it is still missing, open https://docs.ollama.com/macos."
        : "If ollama is not recognized, close PowerShell and open a fresh window so it picks up the installer’s PATH change. If that does not work, reopen the official installer or consult the linked CLI documentation.", source: "https://docs.ollama.com/cli" }),
  ];
  if (!model.tag) return [...steps, step({ id: "artifact", stage: "Install and configure", title: "Choose an exact model before continuing",
    where: "The Model selection in this guide.", actions: ["A parameter count and precision describe a sizing scenario, not a downloadable model. Select a named model in the guide to generate its exact download, settings, chat and verification steps."],
    expected: "An exact model name and tag replace the parameter scenario, and the rest of this guide appears immediately.", recovery: "If your intended model is not listed, check its official model link and copy troubleshooting details. Do not substitute an arbitrary tag or assume a similarly sized model has the same capabilities.", source: "https://ollama.com/library" })];
  const server = sessionCommand(input);
  const runTag = cpuOnly ? `localguide-${model.id}-cpu:ctx${input.context}` : model.tag;
  steps.push(step({ id: "server", stage: "Install and configure", title: "Start a local-only session with your settings",
    where: `${shell}, the command window you just opened. We will call it window A.`,
    actions: [mac ? "Click the Ollama icon in the macOS menu bar and quit Ollama so its background server releases the port. Closing the chat window alone may leave it running."
      : "In the Windows notification area near the clock, find Ollama (open the hidden icons arrow if needed). Right-click its icon and choose Quit. Closing chat alone may leave the server running.",
      `Paste this ${mac ? "single command" : "whole block"} into ${shell} window A and press ${mac ? "Return" : "Enter"}. Leave this window open while you use the model. This runs the server on this computer only, disables Ollama cloud features and sets a maximum of ${input.parallel} parallel request${input.parallel > 1 ? "s" : ""} for one loaded model. ${input.parallel > 1 ? "Each active request adds context-memory demand." : ""}`,
      "Keep window A running as the server; use window B for chat. These settings apply to this session, not permanently to the desktop app."],
    commands: [server], expected: "Server messages appear without an address-in-use error. Look for Ollama cloud disabled: true and a listening address of 127.0.0.1:11434. That address is reachable only from this computer. Installation and model downloads still use the internet.",
    recovery: "If the address is already in use, stop here: another Ollama server is still running. Quit that existing instance and retry this step. Do not open the port to the network or assume the new settings applied to the old server. Consult the linked FAQ if you cannot identify it.", source: "https://docs.ollama.com/faq" }),
    step({ id: "download", stage: "Install and configure", title: "Download the exact selected model",
      where: mac ? "Terminal window A stays open. With Terminal active, press Command + N to open window B."
        : "PowerShell window A stays open. Click Start, type PowerShell and open another window. This is window B.",
      actions: [`In window B, run the first command to check the server version. Its JSON reply should contain the same version number as ollama --version. This guide was checked against ${RUNTIME_VERSION}; use that release or a newer stable release. If the client and server versions differ, press Ctrl + C in window A, update Ollama, and repeat the version and server steps.`, `Then run the pull command and press ${mac ? "Return" : "Enter"}. Wait for success and for the normal command prompt to return. Then run ollama ls to confirm the exact tag is listed. Run each command separately, in this order.`],
      commands: [mac ? "curl http://127.0.0.1:11434/api/version" : "curl.exe http://127.0.0.1:11434/api/version", `ollama pull ${model.tag}`, "ollama ls"], expected: `The server returns a JSON version value and the exact tag ${model.tag} appears in the downloaded-model list. An existing copy may only need an update.`,
      recovery: "If interrupted, reconnect to the internet and run the same pull command again. If disk space runs out, check the storage step. If the tag is unavailable or requires a newer runtime, check the linked model page and update Ollama; do not remove the tag suffix and download a larger default.", source: model.source }),
    ...(cpuOnly ? [step({ id: "cpu-profile", stage: "Install and configure", title: "Save the CPU-only settings for this model",
      where: "PowerShell window B, after the selected model has downloaded. Leave window A running.",
      actions: ["Copy the complete block below into window B and press Enter. It writes a small settings file in your temporary folder, then creates a local model name with CPU-only processing and the selected context length.", `Wait for success and for the normal prompt to return. From this point, use ${runTag}; this is your configured copy of ${model.tag}. The following steps already use that name.`],
      commands: [`$cpuFile = Join-Path $env:TEMP "localguide-local-cpu.Modelfile"\nSet-Content -LiteralPath $cpuFile -Encoding ascii -Value "FROM ${model.tag}\`nPARAMETER num_gpu 0\`nPARAMETER num_ctx ${input.context}"\nollama create ${runTag} -f $cpuFile`],
      expected: `Ollama reports success creating ${runTag}. The CPU setting is saved before the model starts.`,
      recovery: "If creation fails, confirm the original model appears in ollama ls, then repeat this block. If you changed the model or context in the guide, use the newly generated block and name.", source: "https://docs.ollama.com/modelfile" })] : []),
    step({ id: "chat", stage: "Use your model", title: "Open the model chat and set the conversation length",
      where: `${shell} window B, after the download has finished.`,
      actions: [`Paste the first command below and press ${mac ? "Return" : "Enter"}. Wait for the model’s chat prompt (>>>).`,
        `At the >>> prompt, paste the second command and press ${mac ? "Return" : "Enter"}. It belongs inside this chat, not in window A or at a normal shell prompt. It sets this conversation to ${input.context.toLocaleString()} context tokens.`,
        "Then enter /show parameters to inspect the conversation settings. Check num_ctx before asking your question."],
      commands: [`ollama run ${runTag}`, `/set parameter num_ctx ${input.context}`, "/show parameters"],
      expected: `The model chat opens and num_ctx is ${input.context}.${cpuOnly ? " The saved model parameters also include num_gpu 0." : ""} You can begin chatting locally.`,
      recovery: `If loading fails, type /bye only if >>> is visible; otherwise press Ctrl + C in window B. In window A, press Ctrl + C to stop the server. In this guide, lower context or choose a smaller model. Use only the regenerated plan: repeat the server step, download the newly selected tag if you changed models, ${cpuOnly ? "repeat the CPU-only settings step, " : ""}then repeat this chat step. If a command prints as ordinary chat text, confirm it begins with / and that you are at the >>> prompt.`, source: "https://docs.ollama.com/context-length" }),
    step({ id: "answer", stage: "Use your model", title: "Ask a short question, then inspect where the model runs",
      where: `${shell} window B, inside model chat (>>>).`,
      actions: ["Type: Outline a three-step plan for comparing two language models on my documents. Press Return on Mac or Enter on Windows.",
        "Wait for the response to finish. A reasoning model may show thinking before its final answer. Check that it answered usefully.",
        "Type /bye and press Return or Enter to leave chat. At the normal command prompt, promptly run the command below while the model is still loaded."],
      commands: ["ollama ps"], expected: `A response appeared. ollama ps lists the loaded model and its CPU/GPU placement. ${input.platform === "mac" ? "On a supported Mac, Metal provides GPU acceleration." : input.mode === "model" ? "This comparison has no selected hardware route yet. The Processor column identifies GPU-only, CPU-only or mixed placement on the computer you use." : input.vram === 0 ? "The Processor column should show 100% CPU for this CPU-only plan." : fit === "offload" ? (gpuFit === "tight" ? "This is a borderline GPU fit: GPU-only or mixed CPU/GPU placement is possible. System RAM is available if Ollama needs it." : "Mixed CPU/GPU placement is the planned route. Ollama chooses the split automatically; inspect the actual result here.") : "GPU placement is the target; check actual placement rather than assuming VRAM guarantees acceleration."} The server is configured for up to ${input.parallel} active request${input.parallel > 1 ? "s" : ""}; one chat does not exercise all slots.`,
      recovery: "An empty list may mean the model unloaded after being idle. Reopen the same model, ask a question and retry promptly. If acceleration is missing, use the GPU support/troubleshooting link. If memory pressure is high or responses take too long, lower context or select a smaller model.", source: "https://docs.ollama.com/gpu" }),
    step({ id: "offline", stage: "Use your model", title: "Check offline operation when you are at the computer",
      where: "At the model computer itself, after the download and a successful answer.",
      actions: ["If you are using Screen Sharing or remote access, leave networking on and defer this check until you can operate the computer directly. Do not disconnect the link that controls it.",
        mac ? "When physically at the Mac: click Control Center in the menu bar → Wi-Fi → turn Wi-Fi off. Disconnect any Ethernet or other internet connection too. Leave window A running."
          : "When physically at the Windows computer: open Settings → Network & internet → Wi-Fi and turn Wi-Fi off. Disconnect Ethernet or other internet connections too. Leave window A running.",
        `In ${shell} window B, run ollama run ${runTag} again. At >>> enter /set parameter num_ctx ${input.context}, then ask a new short question.`,
        "After an answer arrives, restore Wi-Fi using the same control and reconnect any cable."],
      expected: "The downloaded model answers while internet connections are off. Note the result, or mark this check for later if you are connecting remotely.",
      recovery: "If the model asks to download, restore networking and confirm you used the exact downloaded tag. If you lose remote access, reconnect locally. Do not try this without a way to restore the connection.", source: "https://docs.ollama.com/faq" }),
    step({ id: "next-session", stage: "Use your model", title: "Finish safely—and start again next time",
      where: "The two command windows on the model computer.",
      actions: ["In window B, enter /bye if you are still in chat. Then run the stop command below to unload this model.", "In window A, press Ctrl + C to stop the session server. You can now close both windows.", mac ? "Next time, start at the Mac desktop. Press Command + Space, type Terminal and press Return to open window A. Quit the Ollama desktop app if it is running, then paste the complete server command from step 5 and press Return. Leave it running. Press Command + N to open window B." : "Next time, start at the Windows desktop. Click Start, type PowerShell and open it as window A. Quit the Ollama tray app if it is running, then paste the complete server block from step 5 and press Enter. Leave it running. Use Start to open a second PowerShell window as window B.", `In window B, run ollama run ${runTag}. Wait for >>>, then enter /set parameter num_ctx ${input.context}. You can now ask a question. The model stays downloaded between sessions. Opening the desktop app alone uses its own settings, so use these two windows to repeat this configuration.`, "For selected text files, folder search, tools or an automated workflow, we can build on this setup together."],
      commands: [`ollama stop ${runTag}`], expected: "The model is unloaded. Your saved plan has the commands for starting it again.", recovery: "If you close window A first, the server is already stopped; you can close window B. If software changes, check current official documentation and include this plan revision if you seek help.", source: "https://docs.ollama.com/cli" }));
  steps.push(step({ id: "memory-adjustment", stage: "Recommended workarounds", title: "If loading fails or memory pressure is high",
    where: `This guide and ${shell} windows A and B on the model computer.`,
    actions: ["If a session is still running, enter /bye in window B when the >>> chat prompt is visible; if loading is stuck, press Ctrl + C. Stop the server with Ctrl + C in window A. If the windows are already closed, continue with the guide controls below.",
      `In the guide’s configuration controls, ${input.parallel > 1 ? "change active requests to 1, then " : "keep one active request and "}${input.context > 2048 ? "reduce context length one level." : "keep the 2,048-token context and select a smaller named model if one is available."} Read the updated memory estimate.`,
      ...(input.platform === "windows" && input.mode === "hardware" && input.vram > 0 ? [input.offload ? `Your plan already considers system-RAM offloading. Ollama chooses placement automatically; enabling the planning option does not force a layer count. ${fit === "larger" ? "This selected model also exceeds the available planning budget; choose a smaller model." : "Use the regenerated plan and inspect actual placement after loading."}` : "If the result shows enough system RAM for the model, select Consider system-RAM offloading. This includes a mixed CPU/GPU route in the recommendation; it does not increase dedicated GPU memory."] : []),
      "Use the newly generated guide: repeat Start a local-only session, Download the exact selected model if it changed, any CPU-only settings step, and Open the model chat. Then repeat Ask a short question to inspect placement.",
      "Keep the setting that produces a useful answer within the wait you find acceptable. A smaller model changes capabilities as well as memory use."],
    expected: "The selected model loads and answers. Compare memory use and response behavior with the earlier session; shorter context and fewer requests reduce memory demand without changing the model’s weights.",
    recovery: "If the smallest suitable model still will not load, copy troubleshooting details and add the server output before seeking help. Driver or runtime failures need a different fix from memory pressure.", source: "https://docs.ollama.com/faq" }));
  // Quantized attention-cache recipes are limited to known conventional attention
  // models; hybrid and unmeasured architectures need their own backend evidence.
  if (!model.hybrid && model.kvPerToken !== null && (fit !== "comfortable" || input.context >= 8192 || input.mode === "model")) {
    steps.push(step({ id: "cache-adjustment", stage: "Recommended workarounds", title: "Use less memory for conversation context",
      where: `${shell} on the model computer, with this exact model already downloaded.`,
      actions: ["This optional q8_0 cache reduces the memory used for conversation context. It does not shrink the model weights, and the estimate above continues to show the standard F16 cache. Compare the same question before and after to check answer quality.",
        freshWindows,
        `Paste command 1 below into window A and press ${mac ? "Return" : "Enter"}. It starts this plan with q8_0 cache and Flash Attention requested. Leave it running.`,
        `In window B, run command 2. At >>> enter /set parameter num_ctx ${input.context}, then ask the same short question used earlier.`,
        "Inspect the startup/model-load messages in window A for the effective cache type and Flash Attention. A requested setting is not confirmation that the backend supports it. After the answer, enter /bye in window B and run ollama ps to compare memory and placement.",
        "To return to standard cache, stop window A with Ctrl + C, close it, and open a fresh command window. Repeat Start a local-only session with your settings from the main guide, then reopen chat. That command explicitly selects F16 cache and restores automatic Flash Attention. Repeat this optional section on later sessions only if you want q8_0."],
      commands: [sessionCommand(input,"q8_0"), `ollama run ${runTag}`],
      expected: "The model answers, and the server’s load output confirms q8_0 cache with Flash Attention active. Cache memory should be lower; total model memory will not be halved. Check that the answer remains useful.",
      recovery: "If the runtime rejects the setting, the load output reports a fallback, or answer quality worsens, restore the standard session as described above. Use shorter context instead. q4_0 is a further cache trade-off, but is not included in this recipe.", source: "https://docs.ollama.com/faq" }));
  }
  if (!mac && input.mode === "hardware" && input.vram > 0 && !model.hybrid && model.kvPerToken !== null) {
    steps.push(step({ id: "gpu-layer-adjustment", stage: "Recommended workarounds", title: "Reduce GPU memory use with a separate layer profile",
      where: "PowerShell on the Windows model computer, after trying the standard automatic placement.",
      actions: ["Use this option if automatic placement runs out of GPU memory, or you want to move more of the work to the CPU. It is a layer-count control, not an increase in GPU capacity. System RAM must have room for the CPU portion; answers can take longer.",
        "Read the model-load messages in server window A from the standard attempt. Record how many layers were sent to the GPU. Choose a smaller positive number to try. If the count is 0 or 1, use shorter context or select the CPU-only route instead. There is no reliable layer count based on RAM and VRAM totals alone. If no layer count is available, consult the linked runtime documentation with the load messages before continuing.",
        freshWindows,
        "Run command 1 in window A and leave the server running. In window B, paste command 2 and press Enter. When prompted, enter the smaller layer count. This creates a separately named profile and opens chat only after the profile is created successfully.",
        `At >>> enter /set parameter num_ctx ${input.context}, then ask the same question as before. Check window A’s load messages for actual layer placement, and compare the answer and waiting time. Do not rely on ollama ps alone to confirm a manual override.`,
        `To return to automatic placement, enter /bye, then run ollama stop $layerTag in the same window B. Run ollama run ${model.tag}, set num_ctx to ${input.context} in chat, and ask again. The original model is unchanged. To reuse the layer profile later, repeat this section with the same layer count.`,
        "The estimate above still describes standard placement. This profile does not silently change your saved configuration or promise a particular response speed."],
      commands: [server, `. {
$layerInput = Read-Host "GPU layers to try (smaller than the count in the load log)"
$gpuLayers = 0
if ([int]::TryParse($layerInput, [ref]$gpuLayers) -and $gpuLayers -gt 0) {
  $layerTag = "localguide-${model.id}-gpu${'$'}{gpuLayers}:ctx${input.context}"
  $layerFile = Join-Path $env:TEMP "localguide-gpu-layers.Modelfile"
  Set-Content -LiteralPath $layerFile -Encoding ascii -Value "FROM ${model.tag}\`nPARAMETER num_gpu $gpuLayers\`nPARAMETER num_ctx ${input.context}"
  ollama create $layerTag -f $layerFile
  if ($LASTEXITCODE -eq 0) { ollama run $layerTag }
} else { Write-Output "Enter a positive whole number smaller than the observed GPU layer count." }
}`],
      expected: "The separate profile answers and its load messages show the requested placement, with reduced GPU memory use compared with the standard attempt. Keep the profile only if the resulting wait and answer quality suit the task.",
      recovery: `If creation or loading fails, return to the standard tag ${model.tag}. If GPU memory still runs out, try fewer layers or shorter context. If system memory runs short too, choose a smaller model. A rejected or ignored num_gpu setting needs a runtime/model-specific check against the linked documentation.`,
      source: "https://github.com/ollama/ollama/blob/v0.34.4/llm/llama_server.go#L396-L413" }));
  }
  steps.push(step({ id: "storage-adjustment", stage: "Recommended workarounds", title: "Keep model downloads on another drive",
    where: mac ? "Finder and Terminal on the model computer." : "File Explorer and PowerShell on the model computer.",
    actions: ["Use this option when another drive has more free space. It changes download storage, not RAM or GPU capacity. These instructions use a separate model folder and leave existing downloads in place.",
      mac ? `In Finder, open the connected drive, choose File → New Folder and name it OllamaModels. Select that folder, hold Option and choose Edit → Copy “OllamaModels” as Pathname. Confirm the drive has at least ${memory.storage} GB free.` : `Press Windows + E, open This PC and the intended drive. Press Ctrl + Shift + N, name the folder OllamaModels and open it. Press Ctrl + L, then Ctrl + C to copy its full path. Confirm the drive has at least ${memory.storage} GB free.`,
      freshWindows,
      `Copy command 1 below into window A and press ${mac ? "Return" : "Enter"}. When its folder-path prompt appears, return to ${mac ? "Finder, select OllamaModels, hold Option and choose Edit → Copy “OllamaModels” as Pathname again" : "File Explorer, open OllamaModels, press Ctrl + L, then Ctrl + C again"}. Copying the command replaced the earlier path on your clipboard. Return to window A, paste the freshly copied path without adding quotation marks, and press ${mac ? "Return" : "Enter"}. Leave this server window running.`,
      `In window B, run command 2 to download ${model.tag} into that folder. Then run ollama ls and confirm the exact tag. ${cpuOnly ? "Repeat Save the CPU-only settings for this model, then repeat Open the model chat from the main guide." : "Repeat Open the model chat from the main guide."}`,
      "Open the chosen OllamaModels folder in Finder or File Explorer. Its blobs and manifests folders should contain the download. Keep that drive connected during model use.",
      "Next time, repeat this section’s server command with the same path; the model stays downloaded there. To return to the original storage, stop the server and close window A. Open a fresh command window and use the main guide’s server command. Your original downloads remain available; no folder is moved or deleted."],
    commands: [mac ? `{\nread -r "modelStore?Paste the full existing folder path: "\nif [[ "$modelStore" == /* && -d "$modelStore" && -w "$modelStore" ]]; then\n  ${sessionCommand(input,"f16",true)}\nelse\n  print 'Folder unavailable. Copy its full path from Finder and try again.'\nfi\n}` : `& {\n$modelStore = Read-Host "Paste the full existing folder path"\nif ([System.IO.Path]::IsPathRooted($modelStore) -and (Test-Path -LiteralPath $modelStore -PathType Container)) {\n${sessionCommand(input,"f16",true)}\n} else { Write-Output "Folder unavailable. Copy its full path from File Explorer and try again." }\n}`, `ollama pull ${model.tag}`],
    expected: `The exact model appears in ollama ls, new files appear in the chosen folder, and ${runTag} answers. The normal model folder is untouched.`,
    recovery: "If the drive is unavailable or unwritable, stop the server, reconnect the drive and check the folder before retrying. If you return to the original server command, the new folder’s models will not appear there; start this storage session again to use them. This recipe uses standard cache; do not combine recovery recipes by pasting several server blocks into the same window.", source: "https://docs.ollama.com/faq" }));
  return steps;
}

export function helpDraft(selection: Selection, stepId: string) {
  const input = effectiveInput(selection);
  const result = planLocalSetup(input);
  const step = setupRunbook(input).find(s => s.id === stepId);
  if (!step) return null;
  const adjustment = step.stage === "Recommended workarounds"
    ? "\n\nWorkaround tried (fill in what actually ran):\nCache type / GPU layer count / model folder, as applicable:\nServer output and observed result:\nThe configuration above is the base plan; these optional runtime changes are recorded here separately."
    : "";
  return { title: `Local setup: ${step.title}`.slice(0,120), body: `I need help with step: ${step.title}.\n\nPlan ${PLAN_REVISION} · sources reviewed ${REVIEW_DATE}\nPlatform: ${input.platform}\nModel: ${result.model.name} (${result.model.tag || (result.model.deployment ? result.model.source : "sizing only")})\nHardware: ${selection.origin}; ${input.mode === "model" ? "shopping comparison, not entered equipment" : `${input.ram} GB ${input.platform === "mac" ? "unified memory" : `RAM / ${input.vram} GB VRAM`}; ${gpuLabel(selection)}`}\nContext: ${input.context} (${selection.contextChanged ? "changed" : "default — not changed"})\nRequests: ${input.parallel} (${selection.parallelChanged ? "changed" : "default — not changed"})\nOffload considered: ${result.model.deployment ? "not established for this artifact" : input.offload ? "yes" : "no"}${adjustment}\n\nWhat I see / where I got stuck:\n` };
}
