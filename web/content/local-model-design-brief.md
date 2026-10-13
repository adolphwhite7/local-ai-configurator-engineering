---
artifact: design_brief
audience: Public Local Model Guide readers
target_duration_minutes: 47
topic: Local Model Guide choices, behavior, evidence, and design
date: 2026-10-10
---

# Local Model Guide: Design Brief

This guide connects model choices, hardware requirements and setup instructions. It helps us compare configurations for the work we want to do and understand what each choice changes. The model menu contains local Ollama packages with matching guidance: a complete installation path appears when the selected hardware meets the model's memory plan. Advanced hosting research appears below the guide as capacity comparisons, separate from installable choices.

This is the README for the Local Model Guide. It explains the controls, the models, the examples, and the thinking behind the page. The first part describes the tool available now. The later section, “Models being considered next,” explains the researched additions, including Kimi and GLM. Those additions are not yet choices in the calculator.

## How improvements earn their place

**Controlling accuracy-and-effort requirement:** Time and effort spent on an issue must be justified by evidence of its user impact, and proportionate to that impact. Allocation of time, rounds, tests and tokens must follow supported human benefit. Numerical or predictive accuracy—reducing residuals, percentage/factor errors, improving proportional-error symmetry, benchmark scores or calibration, adding decimal precision or finer timing estimates—and internal code/style accuracy or cosmetic polish are not independent reasons for implementation or tuning iterations. Before any such iteration, name the user journey and decision, provide applicable evidence of a demonstrated material outcome, state the user-relevant tolerance and its evidence basis, and bound proportionate effort and a stopping condition. Material outcomes include a changed suitable model/hardware choice, avoiding an incompatible or failed setup, meaningful actual wait/workflow impact, task success/usefulness/comprehension, or concrete data/access protection. Do not invent a universal tolerance. “More accurate”, “best practice”, elegance, a higher benchmark score or speculative future benefit alone does not establish priority. Do not dismiss a small absolute error merely because it is small. Before prioritizing it as a sign of a larger failure, require strong evidence that the same identified mechanism or pattern produces materially larger impact in a relevant user journey, through applicable measurements/reproduction or a supported quantitative mechanism. A one-second 2× miss exposing a 100-second miss elsewhere is a hypothesis until that link is established. Possibility or the ratio alone does not justify repeated tuning, tests or token spend. Without that link, label the hypothesis and propose only a proportionate bounded diagnostic. Once established, prioritize the demonstrated impact; equal relative errors do not imply equal engineering priority. Functional correctness and actual protections supporting these user outcomes remain required; metrics remain useful diagnostics. If the evidence or tolerance basis is missing, defer implementation/tuning or propose bounded evidence-gathering; do not substitute reviewer preference. This requirement controls reviewer deference and all subsequent priority decisions.

We prioritize changes that help you choose a setup, complete your work, understand the result, avoid unnecessary waiting or protect something that matters to you. A more accurate prediction or a more polished detail earns another round of work when evidence connects it to a meaningful benefit for you. An expert recommendation deserves consideration, but that recommendation alone does not establish the benefit.

When the benefit is uncertain, the next step should be a small, bounded study that can answer a specific decision, or a decision to leave the change for later. Set the useful outcome, effort and stopping point before that study. Keep protections that address demonstrated problems. Preserve useful learning methods as options and compare them by what they help you do, rather than choosing a method for its name or repeating refinements indefinitely.

This principle guides future development. It does not claim that a learning feature or a user study has already been completed.

## Verify the workflow in real use

Verification should follow the work you actually intend to do, as close as practical to the intended deployment, with real equipment, models, software, files, memory conditions, integrations and permissions. Simulations can help check a small component, but a simulated pass does not show that the complete real workflow works. An access boundary is different from a simulation: the real model and code can run while access to files or services is limited appropriately.

Prefer an available second computer for realistic authorized tests. Inspect what is actually on it and what the software can access; use restorable test files and recovery appropriate to the concrete risk. A machine used for testing must not be assumed empty or disposable. Explain important differences between the test and the intended setup.

Check relevant failures in the complete lifecycle as well as useful successful work. For example, the work might succeed while its completion message fails. That distinction matters to whether you can use and trust the result. Choose these checks by actual evidence and meaningful impact on your work, with bounded effort and a stopping point. Keep simulations and real results clearly labeled. This is a standing verification principle, not a claim that new model or second-computer trials have been run.

## Decide whether local suits your work

The optional reason choices cover Privacy, Offline, Cost, Control and Learning. A cloud assistant avoids local installation and maintenance; a hybrid route can keep selected work local and use cloud for other work. Continue without choosing a reason. Local operation depends on every workflow app's settings, not just the model. Installation and model downloads use the internet. Before buying equipment, consider trying the same open model hosted on your own account when appropriate; different settings mean that hosted results do not prove local fit or speed.

### Describe a goal or choose a task

Four optional task choices cover a technical design, a personal message, code and documents. Folder search, OCR, voice and editor integration are separate workflow choices. These remain editable; all eleven catalog models, custom sizing and advanced research remain available. A task choice changes the initial task preference while preserving an explicitly selected model.

The optional goal box uses transparent synchronous keyword rules in this browser. It does not load a parser model, infer model quality, send goal text, save it in browser storage or put it in the URL. Rules can misunderstand negation and unfamiliar phrasing. Mixed or negated descriptions show editable suggestions and an explicit warning. Nothing changes until Apply reviewed choices. Unknown descriptions require a manual task choice.

Apply revalidates against the current plan and commits the task preference and workflow choices together. Changing the text removes its draft; changing the plan makes a draft stale and disables Apply until reviewed again. Undo last Apply restores the prior selection and task choices after validation. Old outcomes and copy notices are cleared, and an older clipboard command can still exist. No asynchronous parser is implemented.

### Separate workflow components

Evaluate an additional application when the task needs more than pasted-text chat. AnythingLLM desktop provides a retrieval route; OCRmyPDF prepares text from scans; whisper.cpp provides a transcription route; Continue connects an editor to Ollama. Their official documentation and source license were read October 10, 2026. The source licenses are MIT, MPL-2.0, MIT and Apache-2.0 respectively. Installation, dependency and model licenses, actual integration and privacy settings remain unverified. These links are evaluation starting points, not automatic installs or a guarantee that the app stays local.

- [AnythingLLM installation](https://docs.anythingllm.com/installation-desktop/overview) and [source license](https://github.com/Mintplex-Labs/anything-llm/blob/master/LICENSE).
- [OCRmyPDF installation](https://ocrmypdf.readthedocs.io/en/latest/installation.html) and [source license](https://github.com/ocrmypdf/OCRmyPDF/blob/main/LICENSE).
- [whisper.cpp quick start](https://github.com/ggml-org/whisper.cpp#quick-start) and [source license](https://github.com/ggml-org/whisper.cpp/blob/master/LICENSE).
- [Continue with Ollama](https://docs.continue.dev/guides/ollama-guide) and [source license](https://github.com/continuedev/continue/blob/main/LICENSE).

## Test usefulness on your own work

The result now puts the personal trial before detailed hardware comparisons and setup. Select three to five representative tasks, including a hard case, and define correctness, completeness and acceptable wait before running. Pass, Usable with edits and Fail are outcomes you record after actual use; no task has been run by this page. Editing a task or success criteria clears the old outcomes. Changing model, context, requests, platform or workflow also clears outcomes while keeping example descriptions where the trial remains visible.

### Planned guidance: first use and later follow-ups

For a particular selected setup, explain three stages separately: loading the model, first processing of new material, and later follow-up work. Judge useful answers and the waits that matter to the work you will repeat, rather than the initial wait alone. A model staying loaded may avoid another loading step; it does not mean your document is cached or indexed. Explain which operation can reuse earlier work, what it reuses and why, when that support is established for the selected app and runtime. Also explain which work still occurs each time. Repeating an action does not by itself make it faster, and not every function benefits from repeated use.

For example, an app with an established retained index may avoid rebuilding that index for unchanged documents; that does not remove the work of finding relevant passages or producing a new answer. This is a conditional example, not verified reuse for every linked app. New or changed material may need new processing. Do not present a loaded model as proof of document reuse.

The planned trial and print/download records should retain the selected setup and separate loading, new-material and follow-up observations, what material stayed unchanged, what work was actually reused, and work still required. Where timing has not been measured, say “Timing not measured for this setup”; where reuse is unknown, identify that specific operation. This describes a saved requirement for future guidance and records. The current prototype records general wait and has not measured these stages. It does not authorize new benchmarking or tuning; effort remains proportionate to supported user benefit.

### Trial results and useful recommendations

When your representative tasks succeed, the result should explain what that success means and give you a useful next step: “This setup handled your representative tasks successfully. It’s a good starting choice for this kind of work.” This is an example of how to describe a successful trial, not a claim that this page has run your tasks. The recommendation should fit the work you tested. It should not immediately diminish demonstrated value with generic phrases such as “only useful for this trial”, “cannot handle every document”, or “no promises”.

Explain a limitation when concrete evidence makes it relevant to your decision, and pair it with a practical response. If applicable evidence shows missed figures in tables, tell you to double-check those figures. Do not invent a defect or promise universal capability. A successful example must also explain a material known limit established by other applicable evidence, rather than conceal it because the example passed. This principle applies throughout the guide's future development and review.

Use the same tasks on two capacity-based candidates. The candidate actions select the exact catalog choice and switch setup and print to the 4K, one-request comparison settings. Candidates that exceed your hardware show the fit warning rather than a usefulness claim. Custom sizing and specialist research do not invent a two-candidate executable trial. Check hardware and operational feasibility before downloading anything.

The comparison profile estimates the selected model at 4,096 context tokens and one request using the same planner. The everyday profile sizes the current context/request controls. Setup and print use those current controls; after choosing a comparison candidate, adjust them again for everyday use. Both profiles appear in print and the local sheet. Reasoning mode and answer budget must be matched and recorded from the actual runtime; no universal 512-token cap is imposed and mode support is not claimed verified. If modes differ, label the comparison as cross-mode. Hiding thinking text does not disable reasoning.

Check the entire original rendered input, templates, history, tools and reserved answer/thinking budget before a comparison. Post-response token counters alone do not prove lossless input. Record exact installed digest, actual quantization, runtime, engine and effective mode. Catalog precision is a sizing assumption until verified from the install; mutable tags are not immutable package identities.

The short 10 Wh divided by 5 W question is a smoke test of basic operation and instruction following. It is not evidence that a model can handle your own documents or code. Record real errors and waits in your own trial, and keep sensitive answers in your own files.

Download personal trial sheet saves a text file with the current selection, reasons, tasks, required components, both profile estimates, success criteria and recorded current-model outcomes. It also has spaces to compare candidate A and B privately. Nothing is uploaded. Notes remain only in page memory until reload, while the downloaded file includes what you entered. This prototype has no measurement collection kit, community endpoint, account system or trained suitability/speed service. It does not settle a future ML release requirement.

The current scope remains non-account: retain your plan and trial record through print or local download. Individual saved accounts/history and database expansion are deferred while hosting/account continuity after a payment lapse is clarified. This is a temporary scope choice, not a claim that optional accounts are technically impossible. The requirement for a useful, genuinely trained and evaluated learning feature remains; this scope decision does not authorize its pending study or publication.

## Start with what you want to learn

The page offers two starting points because people arrive with different questions.

- **“Start with my computer”** starts with equipment you have or want to explore.
- **“Help me choose a setup”** starts with the work you want to do and works backward to useful model and hardware directions. You can also choose an exact model immediately.

### Why the page follows this order

The short introduction leads to an optional local/cloud/hybrid comparison and task choices, then to these two complete starting paths.

- On a wide screen, settings sit beside the result so you can connect a change with its consequence.
- On a smaller screen, settings come first and the result follows.
- The installation guidance comes after the fit estimate because choosing a setup should come before downloading it.

Demonstrations follow the calculator. They provide real-world context without turning someone else’s result into your forecast. The evidence notes come last, with links beside the relevant claims throughout. This keeps the main task approachable while making the reasoning available when you want it.

### How this public guide fits together

The home page opens the configuration explorer. The navigation links the configurator and this Design Brief; both are available without signing in.

This standalone guide provides configuration estimates, generated setup steps and local troubleshooting exports. It has no conversation service, private inbox or automatic question submission.

## A clear start, with optional examples

### No assumed computer

The page opens without a selected task or confirmed hardware. “I’m not sure” is different from CPU-only. The guide asks for the missing facts and offers lookup instructions before presenting a personalized direction.

For Windows, system RAM and dedicated VRAM are enough to generate the memory-based estimate and setup guide. The GPU name is optional. Leaving it blank shows “NVIDIA GPU — model not specified” in the result, printed plan and step-specific help; it does not switch the plan to CPU-only. The setup guide shows how to identify the exact GPU and confirm its support before installation. Unknown VRAM still needs a capacity or an explicit CPU-only selection.

The comparison path asks about the work, acceptable waiting and equipment preference. Favoring responsiveness suggests a smaller starting candidate; a specific model overrides that suggestion. The equipment preference helps frame our discussion. Hardware prices are available through the linked manufacturer pages.

Switching to “Help me choose a setup” leaves earlier hardware entries out of its calculations and setup instructions. The comparison stays the same for the same visible choices, whether you previously explored a CPU-only computer, a small GPU or a large workstation. Returning to “Start with my computer” restores those entries.

Context starts at 4K and one request. These are visible defaults, including in step-specific help. Offloading is off until deliberately selected. Adjust settings reveals less frequent controls without interrupting the main choice.

### A worked illustration

One useful illustration is Windows with 32 GB of RAM, 24 GB of dedicated GPU memory, a 4K conversation, and one request at a time.

For that illustration, consider writing, document work, and coding. Enabling offload does not change the fit of this GPU-resident example.

These are illustrative settings, not the page’s assumed computer or information detected from your computer.

That combination currently suggests Qwen 3 · 14B. It illustrates a GPU-resident model with enough headroom for context and runtime buffers.

### Download, working memory, and disk space

At those settings, the tool shows about 9.3 GB to download, a working-memory range of 10.3–12.3 GiB, and 29 GB of suggested free disk space.

The working-memory estimate includes the model weights, context cache and runtime buffers. The disk-space allowance includes download staging.

### What the three presets change

- Three example buttons let you move quickly between Windows with a 24 GB GPU, Windows with a 32 GB GPU, and a Mac with 64 GB of unified memory.
- Both Windows presets use 64 GB of system RAM.
- All three switch the goal to more involved reasoning, set 4K context and one request, and leave offloading off. Each button states those effects before you click.
- They are complete starting scenarios, not buttons that change only the number printed on them.

Editing hardware in an example makes it a labeled hypothetical configuration. The remaining example specifications are not silently treated as confirmed equipment. Changing VRAM clears the old GPU name so it cannot describe a different memory configuration.

The two Windows examples make a meaningful hardware distinction visible. A laptop and desktop GPU can share a product family name while offering different memory capacities. The Mac example introduces a shared-memory approach. The examples invite comparison across these designs without implying that any one is best for every task.

## Choose the work before choosing the size

### Three starting goals

“The work you want to do” has three choices.

- **“Short questions and everyday help”** favors smaller starting candidates for short questions and summaries.
- **“Writing, documents and coding”** starts with a middle-sized candidate.
- **“More involved reasoning and analysis”** considers a larger reasoning candidate first.

With automatic selection, the guide follows a task-specific preference list and chooses the first model that fits its memory allowance.

### The automatic selection order

- For quick help, it checks Qwen 3.5 · 4B, then Llama 3.2 · 3B.
- For the middle choice, it checks Qwen 3 · 14B, then 8B, then the smaller options.
- For more involved work, it starts with Qwen 3.8 · 27B before stepping down that same path.
- If none fits, the smallest fallback remains visible alongside its fit warning.

### The shopper’s starting candidates

Without entered hardware, the shopper route suggests Llama 3.2 · 3B for short everyday work, Qwen 3 · 14B for writing and documents, or Qwen 3.8 · 27B for involved reasoning. “Favor a more responsive starting point” uses Qwen 3 · 8B for the middle task and Qwen 3 · 14B for involved work. This is a shortlist direction, not a guaranteed quality or speed ranking. Enter actual hardware to check the fit.

### When you pick a model yourself

Choosing a named model overrides that automatic choice. The goal label then provides context for your exploration rather than selecting a different model. This makes it possible to ask, “What happens if I try this particular model?” even when it is not the automatic suggestion.

An added model is identified by name beside the Model selector with a “New” label for one week from its first appearance in that browser. This highlights a new choice without changing your selection or moving the controls. Existing starting suggestions remain unchanged when a comparison model is added.

## Understand the model labels

### Parameters describe size, not a quality score

Parameter count helps estimate the size of the model. Reasoning quality also depends on training, architecture and the task, so the guide lists each model’s intended use alongside its size.

### Dense and sparse models

Dense models use most of their parameters for each generated token.

Sparse or MoE models activate selected parts for each token.

That can reduce the computation required, but the other parts still need to be stored and made available. A small active count is not the whole model’s memory requirement.

### The package format changes memory needs

Quantization reduces the precision used to store model weights.

It can save substantial memory, with a model-dependent effect on quality. The named options are sized with package assumptions: Q4_K_M for most entries and MXFP4 for gpt-oss. Those labels identify the representation being sized, not separate intelligence ratings. Exact installed format and digest remain unverified; mutable tags can change.

The current drop-down is a practical configuration catalog, not a best-to-worst leaderboard. It includes small starting models, intermediate comparisons, and larger architectural examples. New research can change which choices deserve the most prominence without making the existing setup examples disappear.

## Every model in the current drop-down

### Llama 3.2 · 3B

- Llama 3.2 · 3B is the lightweight baseline. Its roughly 2 GB package makes it useful for short chat, summaries, and learning how local operation feels. It gives the calculator a low-capacity reference.
- Its inclusion is not a claim that it leads newer small models in answer quality. [Model package](https://ollama.com/library/llama3.2:3b).

### Qwen 3.5 · 4B

- Qwen 3.5 · 4B is the newer compact option for reasoning and document experiments. Its package is about 3.4 GB.
- The name describes the language component, so the full package contains more than the headline count alone suggests. It earns a place by offering a small-model starting point with a different architecture; this calculator’s estimate is for text use. [Model package](https://ollama.com/library/qwen3.5:4b).

### Qwen 3.5 · 9B

- Qwen 3.5 · 9B adds a larger Qwen 3.5 option for multi-step text work, writing, document questions and coding. Its Q4_K_M package is about 6.6 GB. Choose it directly from the Model menu to compare it with the compact 4B and established Qwen 3 models; it does not replace the automatic starting suggestions.
- At 4K context and one request, its estimated working range is 7.8–10.3 GiB. The package size and its shared attention structure with the 4B model inform this estimate, with a separate allowance for runtime and recurrent state. The hardware directions start at a 16 GB Mac, or 12 GB VRAM with 32 GB Windows RAM. An existing Windows computer with 16 GB RAM and 12 GB VRAM remains a plausible GPU-first setup; 32 GB RAM also leaves room for the full system-memory fallback.
- This plan covers text use, not an image-processing workflow. The model's supported one-request setting and download command follow it into the setup guide. [Model package](https://ollama.com/library/qwen3.5:9b) · [Published architecture](https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/config.json).

### Qwen 3 · 8B

- Qwen 3 · 8B is the middle step when the smallest models feel limiting but available memory still matters. Its roughly 5.2 GB package provides a manageable comparison for writing, document questions, and coding.
- The useful question is whether its answers improve enough on your tasks to justify the additional resources. [Model package](https://ollama.com/library/qwen3:8b-q4_K_M).

### Qwen 3 · 14B

- Qwen 3 · 14B is the larger everyday comparison and the model shown in the opening example. Its roughly 9.3 GB package gives the guide an established step between compact models and heavier options.
- It is included for more involved explanations and synthesis, not because 14B guarantees a particular reasoning level. [Model package](https://ollama.com/library/qwen3:14b-q4_K_M).

### Qwen 3.8 · 27B

- Qwen 3.8 · 27B is the current larger reasoning candidate for complex analysis, synthesis, and coding. Its package is about 17.7 GB.
- The package includes a component for interpreting images, but the calculator budgets text work; image use needs its own sizing. This model also has a practitioner example that illustrates the speed cost of running a dense model partly outside GPU memory. [Model package](https://ollama.com/library/qwen3.8:27b).

### Qwen 3 · 32B

- Qwen 3 · 32B is an established larger dense-model comparison, with a package of about 20.2 GB. It remains useful for comparing a familiar larger model with newer designs.
- Its place is as a comparison option, not an assertion that 32B must outperform 27B. [Model package](https://ollama.com/library/qwen3:32b-q4_K_M).

### Qwen 3.6 · 35B / 3B active

- Qwen 3.6 · 35B / 3B active introduces the sparse-model trade-off. Its roughly 22.6 GB package is larger than the 27B package, while only part of the model works on each generated step.
- It is included for reasoning and coding experiments, and because documented demonstrations show useful partial-offload configurations. [Model package](https://ollama.com/library/qwen3.6:35b).

### DeepSeek R1 distill · 70B

- DeepSeek R1 distill · 70B provides a larger reasoning experiment, with a package of about 42.5 GB.
- R1 is DeepSeek's reasoning-model family. This entry starts with a Llama 70B model and is trained on answers produced by full R1. That is distillation: teaching a different, smaller model from the larger model's examples. It is not the full model compressed into a smaller download.
- Quantization is a separate choice: the 42.5 GB package stores that distill's weights at reduced precision. Full R1 has 671B total parameters and a different architecture. [Distill package](https://ollama.com/library/deepseek-r1:70b) and [publisher's explanation](https://huggingface.co/deepseek-ai/DeepSeek-R1).

### DeepSeek R1-0528 · full 671B

- This is the full updated R1, not another distill. Its role is an established large-model reasoning comparison with an available Ollama package. Roughly 37B parameters are active per generated token; all the weights still need to be accessible.
- The reviewed Q4_K_M package is about 404.4 GB. The exact tag is deepseek-r1:671b; this tag currently identifies R1-0528. At 4K context and one request, the guide estimates 414.6–453.5 GiB of working memory, a 576 GiB host-memory planning target, and 819 GB of free disk space.
- The Windows hardware comparison resolves that host-memory target to a listed 768 GB workstation class. Select its offload or CPU route to generate the complete Ollama setup sequence. With less memory, the guide stops at a capacity decision instead of suggesting a 404 GB download. The current 512 GB single-Mac maximum is below this guide's headroom target; this does not claim every separately tuned 512 GB experiment is impossible. An alternate precision or memory strategy needs its own sizing. [Package](https://ollama.com/library/deepseek-r1:671b) and [release](https://huggingface.co/deepseek-ai/DeepSeek-R1-0528).

### gpt-oss · 120B / 5.1B active

- gpt-oss · 120B / 5.1B active is the large sparse-model example, with a package of about 65 GB. It is included because its architecture and demonstrated offload path make a useful contrast with dense models.
- A 120B label does not make its speed or memory behavior interchangeable with a dense 120B model. [Model package](https://ollama.com/library/gpt-oss:120b).

## Advanced local hosting research

The following V4 releases are capacity comparisons, not choices in the model drop-down. The guide does not yet offer their complete server-specific installation paths.

### DeepSeek V4 Flash · 0731

- V4 Flash earns a separate research comparison through its smaller storage footprint for coding and agentic work: about 166.9 GB of publisher weights, compared with 892.7 GB for the selected Pro release.
- This is the official 0731 release, not the preview. Its publisher reports improved agent-task results over the preview; those results do not predict speed on an individual workstation. [Release and server recipes](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731).

### DeepSeek V4 Pro · 0813

- Pro represents the higher-capability, higher-capacity direction within the V4 family. The publisher reports stronger results than Flash on several coding and agent evaluations. That is its reason for being here, not an assumption that every larger model is better.
- The selected 0813 release supersedes the Pro preview and includes speculative-decoding components. Its published weight files total about 892.7 GB before runtime memory and staging space. These are downloadable weights, not merely a hosted API option. [Exact release](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-0813).

### DeepSeek V4.1 Flash · multimodal

- V4.1 offers a different trade-off: image-and-text input and architectural changes intended to improve input-heavy workloads. Its published package is about 510.3 GB, including substantial conditional-memory components.
- It is not a smaller replacement for V4 Flash. The much lower active parameter count does not describe the storage needed for the full package. Its advertised long-context capability also exceeds this calculator's 32K scenario controls; those larger workloads need separate sizing. [Architecture and deployment documentation](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash).

### Why the DeepSeek coverage is still a shortlist

- The 70B distill provides a lower-capacity reasoning comparison; full R1 adds the full architecture with an established local package. V4 Flash, Pro and V4.1 address different storage, capability and multimodal trade-offs in research outside the selector.
- Older previews, additional small distills, training checkpoints and specialist releases are not added merely because they are downloadable. Each future addition must show a substantive advantage for a relevant task over an existing choice. The list is curated, not proof that every excluded model is inferior.
- Existing automatic starting recommendations are unchanged. V4 research appears outside the model selector until an exact server route has complete setup instructions; it does not silently replace a practical starting model.

### What the advanced hosting research shows

- Mac unified memory, Windows host RAM, GPU-resident memory and disk space remain separate. Windows RAM selections now extend to 768 GB, 1 TB, 1.5 TB and 2 TB workstation classes; Mac selections retain their separate 512 GB ceiling. Numeric V4 planning targets can continue above these dropdown limits instead of disappearing into “Specialist hardware.”
- As reviewed on September 26, 2026, Apple's listed single-Mac maximum is 512 GB. Where a planning target exceeds that figure, the guide identifies that particular Mac memory level as not currently offered. Windows-capable workstations with up to 2 TB of system RAM are listed; that is not 2 TB of GPU memory or a speed benchmark. [Mac specifications](https://www.apple.com/mac-studio/specs/) and [workstation specification](https://i.dell.com/sites/csdocuments/Merchandizing_Docs/en/precision-7875-spec-sheet.pdf).
- V4 capacity budgets use the published mixed-precision package size and the guide's broad runtime allowances. They assume weights remain at approximately their stored precision. A runtime that expands weights, a conversion step, image input or long context changes the requirement. These are planning assumptions, not publisher-certified minimums.
- The advanced hosting section links each published V4 package and gives a bounded capacity projection. It does not offer a selectable installation or imply native Windows or Mac compatibility. Exact server walkthroughs remain open. A Windows computer can also be the client for a separately configured Linux server; client RAM is not server RAM.
- Page, printed plan and troubleshooting export use the same selected model and step list. Advanced V4 research is outside the selector; changing a selectable model replaces the instructions rather than leaving commands from the previous model visible.

## Explore a model that is not listed

### Custom parameter count

“Explore another parameter size” turns the calculator into a general sizing worksheet. You can enter from 1 to 700 billion total parameters.

For a sparse model, enter the whole model’s count, not just the active portion. The field starts at 30B as an editable example; it does not identify a downloadable model.

### Custom weight precision

- The custom scenario offers 4-bit, 8-bit, and 16-bit weight precision.
- **Four-bit** is the compact choice.
- **Eight-bit** roughly doubles the raw weight storage compared with four-bit.
- **Sixteen-bit** roughly doubles it again.
- The tool adds packaging space, then estimates context and operating allowances separately. A real model may not be available in every format.

### What a custom scenario does not do

These controls answer a capacity question, not a quality question. Changing the count or precision does not create a model, establish its capabilities, or produce a download command. The scenario therefore gives general setup guidance without inventing an executable model name. For models larger than the field allows, the advanced research section provides context rather than a misleading calculator result.

## Mac and Windows: different paths to useful capacity

### Mac: shared memory

“Mac / Apple silicon” uses unified memory, which the main processor and GPU share. A high-memory Mac can make a large model accessible without the same separation between system RAM and dedicated GPU memory. The amount of memory still does not tell you how quickly a particular chip moves through the work.

### Windows: separate memory pools

“Windows / NVIDIA or CPU” separates system RAM from the GPU’s dedicated memory. The estimate uses dedicated VRAM for GPU acceleration and system RAM for the host and offloading.

System RAM supports the rest of the computer and can hold model portions handled outside the GPU. These are separate workspaces, not one equally fast combined pool.

### Available memory classes

The Mac memory menu offers 8, 16, 24, 32, 36, 48, 64, 96, 128, 192, 256, and 512 GB. Windows adds 768, 1,024, 1,536, and 2,048 GB workstation planning classes for unusually large models. Those additional classes are not Mac options.

Smaller values support modest experiments; higher values let you explore larger models, more source material, or more simultaneous work. The intermediate sizes cover common configuration differences. These are planning classes, not a promise that every computer is sold with every amount or can be upgraded to it.

- The Windows GPU-memory menu offers CPU-only, then 4, 6, 8, 12, 16, 24, 32, 48, 64, 96, and 128 GB.
- The lower values let you explore existing equipment.
- The upper values extend the discussion into workstations and separately planned multi-GPU systems.
- Their inclusion describes capacity possibilities, not ordinary laptop availability or automatic pooling across cards.

### CPU-only and offloading

CPU-only keeps a path open when there is no supported NVIDIA GPU. It can suit occasional work when longer waits are acceptable. The guide’s Windows acceleration path is specifically NVIDIA-focused; it does not currently calculate every AMD, Intel, or Linux configuration.

“Consider CPU / system-RAM offloading” allows a larger model to use resources outside dedicated GPU memory. The trade-off is increased capacity with additional data transfer between system memory and the GPU.

When offloading is selected, all three work goals can consider the system-RAM allowance. Each keeps its task-specific shortlist: enabling offload does not make the quick-help choice recommend the largest model. Manual choices keep the selected model and update its assessment. With offloading off, suggestions remain within the GPU-focused route; the result still explains what the entered system RAM could support.

For example, keeping a 6 GB GPU while changing system RAM from 16 GB to 512 GB leaves the GPU allowance at 5 GiB. The system-memory allowance changes from 10 to 409.6 GiB. That changes which CPU or offload configurations can fit, not the GPU’s capacity. If a model sits near the GPU limit, the guide describes system RAM as an available fallback rather than claiming that Ollama will definitely split it. The setup steps show how to inspect the actual placement.

When automatic selection is GPU-limited, offloading is off and one request is selected, “Likely experience” also names the different starting model that enabling offloading would suggest, when one is available. This makes the benefit of additional system RAM visible before changing that preference. With multiple requests, the guide recalculates the model and its supported request count together when the preference changes.

### Capacity is not speed

Extra disk space gives you storage, not the same fast working room as RAM. Likewise, adding RAM mainly raises capacity; it does not automatically make an already-fitting model faster. Chip performance, memory bandwidth, software, and the selected model all affect waiting time. [Local memory and offload behavior](https://docs.ollama.com/faq).

## Conversation length and simultaneous work

### Conversation and source length

“Context length” sets the token budget shared by instructions, conversation, source material and generated output.

### Five context choices

The five choices are 2K for a short experiment, 4K as the starting point, 8K for more source material, 16K for longer documents, and 32K for a larger working context.

The underlying values are 2,048 through 32,768 tokens. More context leaves room for more material, but also increases memory demand and can add processing time. It does not by itself improve judgment.

This menu stops at 32K to keep the first setup comparison bounded. It is not a statement that every model’s maximum is 32K. A model advertised with a much larger window still needs enough memory and suitable software to use it. [Context guidance](https://docs.ollama.com/context-length).

### One, two, or four requests

“Simultaneous requests” offers one, two, or four. Think of these as separate active work sessions, not four models installed.

The estimate counts the weights once but increases the per-request working space. One at a time is the starting choice because it makes the first comparison easier to understand. Two and four let you explore shared use or parallel tasks.

Current software also places limits on this choice. Qwen 3.5 · 4B and 9B, Qwen 3.8 · 27B and Qwen 3.6 · 35B run one request at a time in this setup. Their two- and four-request options are unavailable. Switching to one of these models changes the request setting to one and explains the change; the generated instructions use that supported setting. Other models still need enough memory for multiple requests. [Pinned runtime source](https://github.com/ollama/ollama/blob/v0.34.4/server/sched.go#L501-L515).

The selected request count updates both the memory estimate and the generated server settings. The single-chat check confirms that the model responds; it does not exercise concurrent requests.

## Read the result as a connected set of answers

The result starts with the model name, its purpose, the review date, its package format, context, request count, and selected hardware. These details stay together so a printed plan identifies the scenario behind the estimate. The review date records the source snapshot, not the date of a test on your machine.

### Three different planning figures

Three figures follow.

- **“Model download”** is the published package size, or an estimated weight size for a custom scenario.
- **“Working-memory planning range”** includes space used while the model runs.
- **“Suggested free disk space”** allows for two downloads’ worth of space plus 10 GB for staging and operation. Existing models require additional storage.

GB and GiB use different counting conventions. The calculator displays download sizes in decimal GB and working-memory estimates in GiB. Hardware menu values are treated as nominal memory classes for screening. The range leaves room for uncertainty in the running setup; it is not a statistical confidence interval.

### Five fit messages

The status then explains the fit.

- **A fit with headroom** means the upper estimate fits with the tool’s reserve. On Windows, the title specifically says the model fits the GPU-memory allowance; this is not a whole-computer performance rating.
- **A close fit** means the lower estimate fits but the upper one does not. Windows identifies GPU memory as the limiting resource. On a Mac, the limit is the shared unified-memory allowance.

- **A GPU + system-RAM route** identifies an offload option. A borderline GPU fit is labeled “Close GPU fit, with a system-RAM fallback”; actual placement may still be GPU-only.
- **“A CPU-based experiment”** identifies a system-memory path without NVIDIA acceleration.
- **Beyond the allowance** identifies the affected memory pool. If Windows system RAM covers the model but offloading is off, the result points to enabling it instead of describing the entire computer as short of memory.

Below the status, separate memory summaries show the entered capacities and the allowances after reserves. A Windows system-RAM assessment concerns CPU and offload capacity. A GPU-resident model does not require an identical second copy of its full working set in system RAM; the host still needs room for its runtime and other applications.

### Likely experience: useful work, memory and response pace

“Likely experience” brings together the selected model’s intended work and the memory available at the selected context and request count.

- **A memory-constrained setup** names the constrained resource. On Windows, limited VRAM and abundant system RAM are described separately. On an 8 GB Mac, the unified-memory constraint applies to the shared pool. The selected model’s intended work remains visible in either case.
- **A lightweight or compact reasoning setup** describes Llama 3.2 · 3B and Qwen 3.5 · 4B when they fit with headroom. Qwen retains its focused-reasoning role; a small model is not automatically a non-reasoning model.
- **A midrange setup** describes Qwen 3 · 8B and Qwen 3 · 14B with memory headroom, for writing, document questions, coding and multi-step reasoning.
- **A higher-capacity setup** describes the larger reasoning and coding choices when they fit with headroom. It identifies a direction for more demanding work, not a promise that every answer will be faster or better.
- **CPU-based and GPU/system-RAM setups** explain their response-time trade-off directly. A model that exceeds the memory budget leads with that obstacle, rather than an upbeat description of its potential.

These descriptions follow each named model’s intended use, not a ranking calculated from parameter count. Selecting a small model on a high-memory computer keeps the small-model description. Selecting a large model on constrained hardware puts the memory constraint first. Two or four requests share processing power even when the memory estimate fits. Custom parameter scenarios describe capacity only until an exact model is chosen.

GPU acceleration describes how computation runs; it is not a speed rating. The chip, prompt length and time spent reasoning shape the wait. The guide asks for memory capacity rather than the exact Mac chip or a measured GPU benchmark, so it distinguishes higher capacity from highest performance. More memory can relieve a memory bottleneck without changing the selected model’s reasoning capability.

## Work backward from a model

### Three hardware directions

Model-first mode keeps the selected model and shows three hardware directions.

- **The Mac option** proposes a unified-memory class.
- **The Windows GPU-resident option** proposes dedicated GPU memory plus system RAM.
- **The third option** compares an 8 GB GPU. It describes ordinary GPU residency when the model fits that allowance, or a system-RAM offload route when it does not.

The Mac suggestions begin at 16 GB, even though the hardware menu lets you explore 8 GB. That is a starting-headroom decision, not a declaration that small models cannot run on 8 GB. Above 128 GB, the card points toward high-memory desktops in the reviewed product range. Windows suggestions above 32 GB of GPU memory similarly point beyond ordinary laptops.

### Explore a suggestion

“Explore this Mac scenario” and “Explore this GPU scenario” put those capacities back into hardware-first mode while preserving the model, context, and request count. The result is labeled hypothetical; its exact chip or GPU still needs confirmation.

“Compare this offload scenario” explicitly enables offloading with an 8 GB GPU example. These actions let you inspect a suggestion instead of treating it as a final answer.

### Switching modes and comparing alternatives

Switching paths preserves a manually selected model. Automatic selection instead follows the current path’s task and hardware rules.

Choose “Suggest a starting model for this work” to return to automatic suggestions. Changing the platform clears the old platform’s hardware facts rather than reusing them as confirmed equipment.

In model-first mode, the platform menu changes the installation instructions, while both hardware directions remain available.

“Compare other models within this planning budget” shows fitting alternatives with their purposes. It emphasizes a lightweight option, an everyday option and a distinct larger architecture where available, rather than taking the last three names from the catalog. These are not ranked by a quality benchmark. Selecting one changes the model, not your hardware.

When you explore Qwen 3.5 · 4B, Qwen 3 · 8B or Qwen 3 · 14B, a fitting Qwen 3.5 · 9B also appears as a comparison. It supplements those alternatives rather than displacing an existing choice.

## Why the calculation shows its assumptions

The expandable “How the estimate works” section makes the arithmetic inspectable without requiring it before your first choice. The basic structure is weights, plus context memory, plus operating space. The KV cache stores the attention state used as the model processes and generates tokens.

### Context memory

- Where architecture information supports a calculation, the tool estimates an F16 cache.
- For hybrid models, it accounts for the full-attention portion and adds an allowance for other working state.
- Where exact allocation is not modeled, it shows a broad allowance of 0.25–1.5 GiB per 4K tokens per request.
- The visible difference is intentional: a range is more useful than a precise-looking invented value.

### Operating allowances

- Ordinary operating buffers are budgeted from the larger of 1 GiB or 10% of weights, up to the larger of 3 GiB or 20%.
- Hybrid models use 1.5 GiB or 15% at the low end, and 4 GiB or 25% at the high end.
- These allowances scale with simultaneous requests. They are planning choices, not measured requirements for every runtime.

### Memory kept in reserve

- **The Mac calculation** reserves the larger of 3 GiB or 20% for other work.
- **The dedicated-GPU calculation** reserves the larger of 1 GiB or 10%.
- **Offload screening** leaves the estimated working set in host RAM and reserves the larger of 6 GiB or 20% for the system.
- This conservative approach explains why a carefully tuned demonstration can work on less memory than the guide suggests.

### Custom-model sizing

A custom scenario multiplies total parameters by bits per value, divides by eight to obtain bytes, and adds 15% for packaging. It then applies broad runtime allowances.

Specialized architectures can include additional components that this simple formula does not capture. That is why exact model packages and their documentation remain important as you move from exploration to installation.

## Installation, printing, and what the buttons actually do

### Start with a working local model

When a named package fits the selected memory plan, **Local setup, start to finish** groups its installation steps into **Prepare**, **Install and configure**, and **Use your model**. A separate **Recommended workarounds** section offers relevant alternatives after the main path. The full R1 package instead stops at a capacity decision when the selected machine is below its planning range; switching to a workable hardware route regenerates the installation steps.

Each expandable step says where you are, what to do, what you should see and what to do if something differs. The outline stays visible, and Show all steps opens the complete procedure. The page and printout use the same step list. A custom parameter scenario has preparation steps and an exact-artifact choice, not invented installation commands.

The instructions distinguish current official documentation from a physical walkthrough. Their source date and Ollama release appear with the guide. They are documented for the selected platform; they are not presented as hardware-tested across every combination. If the application changes, check current official documentation and include the plan revision and step when seeking help.

### Download, run, and copy commands

- For a named model, the download command obtains its package and the run command opens a chat with it.
- **“Copy this command”** copies one displayed command or explicitly identified server-configuration block. Download and chat are separate numbered steps.
- The context command appears separately because it belongs inside the Ollama chat, not in the same place as the first commands.
- The guide also includes a command for checking whether the running model is using the GPU, CPU, or a combination.

The main path uses two named command windows: window A runs a local-only Ollama server; window B downloads the selected model and opens the conversation. The current desktop app is quit first so it does not compete for the same server port. Explicit settings set context and supported request count, disable cloud features, keep access on the local computer, and keep one model loaded. These are session-only settings, so **Finish safely—and start again next time** explains exactly what to repeat. The Windows CPU-only route adds a settings-file step that gives the model a local CPU-specific name before its first load. Download, chat, offline check and restart instructions all follow that selected route.

Changing a configuration regenerates its steps and clears old copy notices. An earlier command may still be in the operating-system clipboard, so the page tells you to copy again. A pending older copy cannot mark the new configuration as copied.

### Recommended workarounds

These source-supported options address specific problems without replacing the main setup. Each includes the steps, expected result, source, and how to return to standard settings.

- **Memory pressure:** reduce context or simultaneous requests, compare a smaller model, or consider system-RAM offloading on a Windows NVIDIA configuration. Changing these controls regenerates the main plan and its estimates.
- **Conversation-cache memory:** a q8_0 cache with Flash Attention can reduce the memory used for context. This option appears for the catalog’s conventional-attention models when memory is constrained, context is at least 8,192 tokens, or you are exploring hardware for that model. It can apply to Mac, Windows GPU, and CPU routes. Hybrid models and models without the required cache information use their existing setup instead. The load messages confirm whether the model and backend applied the setting. Half the cache memory does not mean half the total model memory.
- **Manual GPU layers:** for a Windows NVIDIA configuration using a conventional-attention model, a separate profile can request fewer GPU layers when automatic placement is unsuitable. The count comes from the actual model-load messages, not a guess based on VRAM capacity. Returning to the original model restores automatic placement.
- **Another model drive:** the guide can start Ollama with a different model folder and download the selected package there. Existing downloads stay in place. This addresses disk space, not RAM or GPU capacity.

The cache, layer, and storage recipes are session alternatives. Their effects do not silently change the base plan’s sizing figures or saved settings. The help request includes a place to record the workaround and what actually happened. Their commands, sources, and recovery steps appear in the complete printout too.

These recommendations draw on Ollama’s documentation and versioned implementation, with a supporting source linked beside each procedure.

### Check usefulness and local operation

The first comparison focuses on answer usefulness, time until an answer starts, and total waiting time.

The local-only steps cover turning cloud use off, keeping network exposure off, and checking operation without internet after downloads are complete.

Perform that offline check locally without disconnecting a network connection needed for remote control.

### Alternative applications

This complete runbook uses Ollama. LM Studio is an alternative graphical experience and llama.cpp offers finer control; their different installation procedures are not mixed into this guide.

- LM Studio provides model discovery, chat, and load settings.
- llama.cpp provides the lower-level controls used in several demonstrations.
- These are different ways to operate models, like different control panels for similar equipment. A matching model name across applications does not guarantee identical packaging or performance. [LM Studio basics](https://lmstudio.ai/docs/app/basics) and [llama.cpp](https://github.com/ggml-org/llama.cpp).

### Keep a printed plan

“Print complete plan” opens the browser’s print dialog, where you can print or save a PDF. It includes the result, hardware directions, assumptions, source links and every applicable setup-step body—even when all steps are collapsed on screen. If the selected hardware cannot support a complete setup path, the button says “Print planning estimate” and prints the capacity decision instead of implying an installable guide. Both versions omit the input controls and demonstration grid.

A printout is a useful record because selections live only in the open tab. Local troubleshooting copy and download actions include the selected configuration and step. Ordinary refreshes or unrelated navigation do not promise saved progress; this public guide has no session-bound return transfer.

### Ask about the exact step

“Copy troubleshooting details” copies the current model, hardware, context, request count, plan revision and step to your clipboard. “Download troubleshooting details” saves the same text locally. Nothing is submitted or sent. Add your own description and remove private information before sharing it with someone you choose. If clipboard access is unavailable, select the displayed text and copy it manually.

### Keeping the work together

Calculations run in the page using the specifications you enter. Configuration and troubleshooting details are not sent to a server by this guide. The optional first-seen model marker uses browser storage for presentation only; storage failure does not block planning. This describes application behavior, not a promise about future hosting-provider access logs.

## Why these six demonstrations are here

### 1. A 35B model with an 8 GB laptop GPU

- The first demonstration shows a 35B sparse Qwen model running with an 8 GB laptop GPU and 64 GB of system RAM. The creator reports 21.4 tokens per second using llama.cpp and a partial GPU allocation.
- It leads the default example list because it answers a useful question: can existing equipment do more than its GPU-memory number alone suggests?

- The reported run placed 12 of 41 model layers on the GPU. Layers are stages of calculation; assigning some to the GPU is like putting selected production steps on faster equipment.
- MTP was enabled, a setting intended to produce or anticipate multiple tokens during generation.
- The cited measurement was short, and the notes and narration identify the CPU differently.
- A configured 131K context does not mean that speed was measured with the whole window filled. [Source demonstration](https://youtu.be/cB6lpKYf67w?t=746).

### 2. The same 35B model with a Tesla T4

- The second demonstration uses the same 35B model with a Tesla T4, 16 GB of GPU memory, and 192 GB of system RAM. It reports 29.9 tokens per second with 28 layers assigned to the GPU.
- It broadens the range of workable setups.
- Because the CPU, RAM, layer split, and other settings also change, the difference cannot be credited to GPU memory alone. [Source demonstration](https://youtu.be/cB6lpKYf67w?t=746).

### 3. gpt-oss 120B with an 8 GB laptop GPU

- The third runs gpt-oss 120B on the smaller 8 GB laptop GPU with 64 GB of system RAM, reporting 12.7 tokens per second.
- This example challenges the idea that the entire model must fit in VRAM to be useful.
- Its exact package revision and context are missing, and the reported Q4 format is not confirmed equivalent to Ollama’s MXFP4 package. It remains a specific reported success rather than a promise that the guide’s download reproduces it. [Source demonstration](https://youtu.be/cB6lpKYf67w?t=783).

### 4. A dense 27B model on the smaller GPU

- The fourth returns to the smaller laptop GPU with a dense Qwen 27B model, reporting about 5.7 tokens per second.
- It is included beside the larger sparse model because fewer total parameters did not produce faster generation in these runs.
- Context and the exact package revision are missing. Architecture and execution settings explain why model size alone is a poor speed forecast. [Source demonstration](https://youtu.be/cB6lpKYf67w?t=681).

### 5. A higher-end Windows laptop

- The fifth shows a higher-end Windows laptop: a Razer Blade 18 with an RTX 5090 Laptop GPU and 24 GB of VRAM.
- Its creator reports 169.1 tokens per second for the 35B sparse Qwen model.
- It demonstrates another performance class, while missing precision, context, and system-RAM details limit a direct comparison. [Source demonstration](https://youtu.be/KIYhV0pLaSE?t=1158).

### 6. A high-memory Mac laptop

- The sixth shows a high-memory Mac laptop running a 122B sparse Qwen model. The creator reports 47 tokens per second and about 94 GB of memory use on a 128 GB machine.
- It gives the shared-memory path a concrete example, although quantization and context are not specified.
- The 122B model is not currently in the calculator, so this card has a source link but no “Explore this model” button. [Source demonstration](https://youtu.be/KIYhV0pLaSE?t=1207).

### What the demonstration buttons change

The six demonstrations remain in a fixed order, with the hardware, settings and differences shown in each card.

- **“Watch source”** opens the cited video at the relevant segment.
- **“Try this model on my current setup”** changes only the model selection. It does not copy the creator’s computer, software, context, or advanced settings into your plan. Each demonstration carries “not directly comparable” because missing settings and different runtimes prevent a fair speed ranking.

## How models earn a place

### A distinct reason for every model

A useful shortlist gives each model a reason to be there: better results on relevant work, a smaller memory requirement, a useful feature, an easier setup, or a demonstrated operating advantage. A different brand name alone does not provide that reason.

### Why task and hardware come first

There are two reasonable ways to present the research.

- One overall ranking is easy to scan and gives a quick sense of broad capability.
- Ranking by task and hardware takes more explanation, but preserves specialists and useful lower-resource options.

The design direction favors task and hardware because the best choice for document work may differ from the best choice for coding or a small computer.

### Kimi and GLM: different strengths

Kimi K3 and GLM-5.3 illustrate the distinction. In the reviewed Artificial Analysis comparison, GLM leads the terminal-work measure, while Kimi leads the long-context and document-reasoning measures.

Their aggregate scores are close. That supports giving each a distinct role rather than treating a small overall score difference as a universal verdict.

Those evaluations also do not establish the speed or quality of every local compressed package. [Kimi and GLM comparison](https://artificialanalysis.ai/models/comparisons/glm-5-3-vs-kimi-k3).

### How to explain an omission

The same rule applies to omissions. For a model that has been assessed, the useful explanation is: “For the work and hardware selected, the available evidence did not show a meaningful advantage over the alternatives already included.”

A model that has not been assessed is simply unassessed. The catalog can change when a new capability or a better comparison gives it a reason to change.

## Models being considered next: practical computers

These are researched candidates, not additional settings already implemented. The proposed practical-computer list contains seven distinct choices. Three overlap the current calculator; the others would need their own package and setup records before becoming calculator entries.

### IFM K2-Horizon-7B

- IFM K2-Horizon-7B is a compact text-reasoning candidate, with a roughly 5.6 GB compact package. It offers a stronger text-focused alternative within a modest footprint.
- Its setup currently requires the maker’s adapted llama.cpp runtime rather than assuming the standard installation handles it. K2 Horizon is not the Kimi family. [Official package and setup](https://huggingface.co/IFM/K2-Horizon-7B-GGUF).

### IFM K2-Horizon-3.7B

- IFM K2-Horizon-3.7B is the smaller text alternative, with a roughly 3.2 GB compact package. It earns a separate place because it reaches a lower memory class.
- It has the same specialized runtime requirement. In both K2 models, the headline name excludes some stored components, so published package sizes are more useful for planning than the name alone. [Official package](https://huggingface.co/IFM/K2-Horizon-3.7B-GGUF).

### Three Qwen candidates with different roles

- Qwen 3.5 4B remains the small visual generalist. Its reason for staying is not only size: image-capable work differs from a text-only model’s role.
- Qwen 3.8 27B remains the larger reasoning comparison, supported by stronger broad evaluation results within the examined practical set.
- Qwen 3.6 35B remains the sparse efficiency option, with documented partial-offload examples.

These are three different trade-offs, not three equal claims to being “best.” [Qwen packages](https://ollama.com/library/qwen3.5/tags), [27B evaluation](https://artificialanalysis.ai/models/qwen3-8-27b), and [35B package](https://ollama.com/library/qwen3.6).

### Gemma 4 12B Unified IT

- Gemma 4 12B Unified IT adds speech, image, and video possibilities in a compact model.
- Its roughly 7.2 GB Ollama package is not proof that every application exposes every capability: Ollama’s listing exposes text and image support, while audio needs a compatible operating path. It earns consideration for the kinds of input it can handle, not for leading every reasoning score. [Model capabilities](https://ai.google.dev/gemma/docs/core/model_card_4) and [runtime packages](https://ollama.com/library/gemma4/tags).

### IFM K2-Horizon-MoVA-36B-A4B

- IFM K2-Horizon-MoVA-36B-A4B adds a larger sparse text candidate. Its roughly 22.4 GB compact package offers a different reasoning-to-computation trade-off from a dense model.
- It also requires the adapted K2 runtime. The full stored model and its active portion are different quantities, and neither should be inferred solely from the abbreviated name. The maker’s compact-package evaluations cover non-agent tasks; equivalent agent performance remains to be tested rather than inferred from the underlying model’s scores. [Official package](https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B-GGUF).

## Models being considered next: advanced capacity

The advanced reference set looks beyond ordinary laptop installations. These models help explain what higher-capacity exploration could unlock. Their published weights can run outside a hosted service, but that does not make them practical on every personal computer. Most require separately planned workstation or server-scale resources.

### MiMo-V2.6-Pro-RL

- MiMo-V2.6-Pro-RL represents a high-capability, multimodal reference with roughly a trillion total parameters. It earns consideration through strong broad evaluation results and multiple input types.
- Its scale makes it a reference for a larger deployment discussion, not a starter download. [Official model](https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL) and [independent evaluation](https://artificialanalysis.ai/models/comparisons/mimo-v2-6-pro-vs-grok-4-6).

### GLM-5.3 and Kimi K3

- GLM-5.3 is included for demanding text, coding, and terminal-oriented work. It has about 753B total parameters.
- Kimi K3 is included for document and long-context work, with about 2.8 trillion total parameters. Their different strengths justify retaining both in the research set; their very different footprints make hardware practicality a separate decision. [GLM model](https://huggingface.co/zai-org/GLM-5.3) and [Kimi model](https://huggingface.co/moonshotai/Kimi-K3).

### GLM-5.3-Flash

- GLM-5.3-Flash offers a smaller high-capability alternative within this advanced group, at roughly 320B total parameters.
- **“Smaller”** is relative: this is still well beyond the small-model starting scenarios. Its role is a capability-to-capacity compromise rather than a promise of laptop fit. [Official model](https://huggingface.co/zai-org/GLM-5.3-Flash).

### Qwen3.8-Flash-Next

- Qwen3.8-Flash-Next earns consideration because the reviewed results approach a much larger Qwen model while requiring substantially fewer stored parameters.
- Its full composition is around 180B, including components beyond its main network. The much smaller active count describes work per step, not everything that must be available. [Official model](https://huggingface.co/Qwen/Qwen3.8-Flash-Next) and [comparative results](https://artificialanalysis.ai/models/comparisons/qwen3-8-flash-next-vs-qwen3-8-2-4t-a95b).

DeepSeek V4.1 Flash appears in advanced hosting research above, not as a selectable installation. It remains a separate runtime path from the local Ollama choices.

## A document helper is a different kind of choice

### PaddleOCR-VL-1.6

PaddleOCR-VL-1.6 is being considered as a small document-processing helper. It turns document pages into usable text and structure, including elements such as tables. That is a different job from deciding what an article means or composing a thoughtful answer.

Its reason for inclusion is strong document-parsing evidence, not a general chat ranking. A small specialist can prepare cleaner material for a reasoning model, much as a careful intake process gives a specialist better information. The full-page processing system and a small recognition example are different setups, so implementation must follow the appropriate route. [Document benchmark](https://github.com/opendatalab/OmniDocBench) and [model and setup](https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6).

### Specialists that still need targeted comparisons

Other candidates remain worth targeted comparisons rather than automatic additions.

- Kimi Linear addresses long-context efficiency; Kimi VL addresses visual reasoning.
- Devstral Small 2 and Qwen3-Coder-Next address coding-agent work.
- Qwen3-VL-8B addresses compact visual work.
- Each needs a clear advantage for the selected task over an option already included. They are not hidden choices in the current drop-down.

## The surrounding software matters too

### Routine work and model judgment

The longer-term design approach assigns routine work to software and focused judgment to the model.

- Ordinary local software can retrieve approved documents, calculate totals, check permissions, and format results.
- The model can then work on the narrower question that needs interpretation.

An assembly line is a useful comparison. A scripted machine can repeat a precise operation without being an intelligent decision-maker. The surrounding software can similarly perform well-defined tasks, leaving the model less material to sift through. This can reduce unnecessary model work without claiming to turn a small model into a larger one.

### What still needs to be built and tested

- Retrieval can prepare relevant passages, but it does not guarantee that the model interprets them correctly.
- Permission checks can limit which files a tool opens, but a prompt alone is not that permission system.
- This infrastructure needs to be built and tested separately. Installing a local model does not automatically install a governed file-search assistant, and the website is not presenting one as already included.

## Use the guide as a working reference

### Your next step

- For an existing computer, choose its platform and memory, describe the work, and inspect the suggested model.
- For a desired model, use the reverse path and compare the hardware directions.
- Change one setting at a time so its effect stays clear.
- Print a promising plan or copy its troubleshooting details before seeking help.

### Available now and being considered next

The current tool provides the model catalog, memory estimates, setup guidance, printable plans, and source-linked demonstrations.

The researched shortlist is the next design direction, not a newly deployed ranking engine. Local measurements will refine both the recommendations and the assumptions as actual setups are tried.

### Keeping this reference current

This brief is maintained alongside the tool. When a model, option, calculation, example, or setup path changes, its explanation is reviewed and updated with the same release. The purpose is to keep the reasoning as usable as the controls.
