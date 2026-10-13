"use client";
import { useEffect, useRef, useState } from "react";
import { MODELS, REVIEW_DATE, availableMemory, estimateMemory, planLocalSetup } from "@/lib/local-model-planner";
import { EMPTY_SELECTION, editedHardwareOrigin, effectiveInput, gpuLabel, missingFacts, type Selection } from "@/lib/local-setup-selection";
import { SERIAL_MODELS } from "@/lib/local-setup-runbook";
import { PRACTITIONER_EXAMPLES } from "@/lib/local-model-examples";
import { newlySeenModels } from "@/lib/local-model-new";
import Runbook from "./runbook";
import { TrialDirection, TrialKit } from "./trial";
import { normalizeSelection, type TaskId, type WorkflowId } from "@/lib/local-trial";
import { DEEPSEEK_ADDITIONS, hardwareOutlook, MAC_CAPACITY_SOURCE, WINDOWS_CAPACITY_SOURCE, WINDOWS_RUNTIME_SOURCE } from "@/lib/deepseek-options";

const capacities = [8,16,24,32,36,48,64,96,128,192,256,512,768,1024,1536,2048];
const size = (n: number | null) => n ? `${n} GB` : "Specialist hardware";
export default function LocalModelPlanner() {
  const [selection, setSelection] = useState<Selection>(EMPTY_SELECTION);
  const [notice, setNotice] = useState("");
  const [tasks, setTasks] = useState<TaskId[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowId[]>([]);
  const [reasons, setReasons] = useState<string[]>([]);
  const [newModelIds, setNewModelIds] = useState<string[]>([]);
  const generation = useRef({ value: 0, copying: false });
  const input = effectiveInput(selection);
  const missing = missingFacts(selection);
  const ready = !missing.length;
  const result = planLocalSetup(input);
  const { model, memory } = result;
  const specialist = model.deployment === "specialist";
  const capacityBlocked = model.id === "r1full" && result.fit === "larger";
  const sizingOnly = model.id === "custom";
  const completeGuide = !specialist && !capacityBlocked && !sizingOnly;
  const smallGpuFits = memory.high <= availableMemory({ ...input, platform: "windows", vram: 8 });
  const serial = SERIAL_MODELS.includes(model.id);
  useEffect(()=>{
    const refresh = () => {
      let ids: string[] = [];
      try { ids = newlySeenModels(localStorage); } catch { /* Storage is optional. */ }
      setNewModelIds(previous => previous.join(",")===ids.join(",") ? previous : ids);
    };
    refresh();
    const timer = window.setInterval(refresh, 60000);
    return () => window.clearInterval(timer);
  },[]);
  function commit(next: Selection, message: string) {
    generation.current.value++; setSelection(next); setNotice(message);
  }
  function change(patch: Partial<Selection>, message = "Setup changed—copy any commands again. Your clipboard may still hold an older command.") {
    const next = normalizeSelection(selection, patch);
    if (!next) { setNotice("Invalid selection: your current plan was kept."); return; }
    if (next.parallel !== (patch.parallel ?? selection.parallel)) message += " The selected model supports one request at a time in this setup; the request count was normalized.";
    commit(next, message);
  }
  function scenario(platform: "mac"|"windows", ram:number, vram:number, label:string) {
    generation.current.value++;
    setSelection({...EMPTY_SELECTION,mode:"hardware",platform,platformKnown:true,ram,vram,gpuName:platform==="windows"?label:"",goal:"deep",goalChosen:true,origin:"example"});
    setNotice(`Example selected: ${label}; ${ram} GB RAM, ${vram} GB dedicated VRAM, analysis goal, 4K context, one request, offload off.`);
  }
  function compare(platform:"mac"|"windows",ram:number,vram:number,offload=false) {
    generation.current.value++;
    setSelection({...selection,mode:"hardware",platform,platformKnown:true,ram,vram,gpuName:platform==="windows"?"NVIDIA memory-class scenario — exact GPU to confirm":"",origin:"hypothetical",offload,modelId:model.id});
    setNotice("Hardware scenario selected. Model, context and request count were kept; the setup guide now follows this scenario.");
  }
  const guideKey=JSON.stringify(selection)+generation.current.value;
  return <>
    <TrialDirection selection={selection} revision={generation.current.value} tasks={tasks} workflows={workflows} reasons={reasons} setReasons={setReasons} commit={commit} setIntent={(nextTasks, nextWorkflows) => { setTasks(nextTasks); setWorkflows(nextWorkflows); }}/>
    <div className="local-mode-bar" role="group" aria-label="Choose your starting point"><button type="button" aria-pressed={selection.mode==="hardware"} onClick={()=>change({mode:"hardware"})}><strong>Start with my computer</strong><span>Find a model for equipment you have.</span></button><button type="button" aria-pressed={selection.mode==="model"} onClick={()=>change({mode:"model"})}><strong>Help me choose a setup</strong><span>Compare options for the work you want to do.</span></button></div>
    <section className="local-workbench" aria-label="Choose a local setup">
      <div className="local-form-panel">
        <p className="local-kicker">01 · YOUR STARTING POINT</p><h2>{selection.mode==="hardware"?"What are you working with?":"What would you like it to do?"}</h2>
        <p className="local-panel-intro">{selection.mode==="hardware"?"Enter the specifications you know. The lookup steps below help you find the rest.":"Choose the work you have in mind, then compare models and the hardware that supports them."}</p>
        <div className="local-fields">
          <label>The work you want to do<select value={selection.goalChosen?selection.goal:""} onChange={e=>change({goal:(e.target.value||"balanced") as Selection["goal"],goalChosen:!!e.target.value})}><option value="">Choose the work</option><option value="quick">Short questions and everyday help</option><option value="balanced">Writing, documents and coding</option><option value="deep">More involved reasoning and analysis</option></select><small>This helps choose an initial model.</small></label>
          <label>{selection.mode==="hardware"?"Computer platform":"Platform to explore"}<select value={selection.platformKnown?selection.platform:""} onChange={e=>change({platform:(e.target.value||"windows") as Selection["platform"],platformKnown:!!e.target.value})}><option value="">I’m not sure / choose a platform</option><option value="mac">Mac · Apple silicon</option><option value="windows">Windows · NVIDIA or CPU</option></select></label>
          {selection.mode==="hardware"&&selection.platformKnown&&<>
            <label>{selection.platform==="mac"?"Unified memory":"System RAM"}<select value={selection.ram} onChange={e=>change({ram:Number(e.target.value),origin:editedHardwareOrigin(selection)})}><option value="0">I’m not sure</option>{capacities.map(n=><option key={n} value={n} hidden={selection.platform==="mac"&&n>512} disabled={selection.platform==="mac"&&n>512}>{n} GB</option>)}</select></label>
            {selection.platform==="windows"&&<>
              <label>Dedicated NVIDIA GPU memory<select value={selection.vram} onChange={e=>change({vram:Number(e.target.value),gpuName:"",origin:editedHardwareOrigin(selection)})}><option value="-1">I’m not sure</option><option value="0">CPU-only · no supported NVIDIA GPU</option>{[4,6,8,12,16,24,32,48,64,96,128].map(n=><option key={n} value={n}>{n} GB dedicated VRAM</option>)}</select><small>Shared GPU memory is not dedicated VRAM.</small></label>
              {selection.vram!==0&&<label>NVIDIA GPU name (optional)<input value={selection.gpuName} maxLength={100} placeholder="For example: RTX 5090 Laptop GPU" onChange={e=>change({gpuName:e.target.value.replace(/[\r\n<>]/g,""),origin:editedHardwareOrigin(selection)})}/><small>Leave blank if unknown. RAM and dedicated VRAM are enough for this estimate. The setup guide shows how to identify your GPU and check its support.</small></label>}
            </>}
            <details className="lookup-help"><summary>Help me find {selection.platform==="mac"?"my chip and memory":"my RAM, GPU name and memory"}</summary>{selection.platform==="mac"?<p>On the Mac, click Apple menu → About This Mac. Read Chip and Memory. This guide supports Apple M-series chips; an Intel Mac needs a different path.</p>:<p>On Windows, click Start → Settings → System → About for Installed RAM. Press Ctrl + Shift + Esc → Performance → GPU. Read the full GPU name and Dedicated GPU memory capacity. Check every GPU entry.</p>}</details>
          </>}
          {selection.mode==="model"&&<><label>Response-time preference<select value={selection.priority} onChange={e=>change({priority:e.target.value as Selection["priority"]})}><option value="">No preference yet</option><option value="responsive">Favor a more responsive starting point</option><option value="patient">Longer waits can be worthwhile</option></select></label><label>Equipment preference<select value={selection.spending} onChange={e=>change({spending:e.target.value as Selection["spending"]})}><option value="">Still exploring</option><option value="existing">Prefer equipment I already have</option><option value="compare">Compare possible purchases</option></select></label></>}
          <label>Model<select value={selection.modelId} onChange={e=>change({modelId:e.target.value})}><option value="auto">Suggest a starting model for this work</option>{MODELS.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}<option value="custom">Explore another parameter count</option></select><small>{newModelIds.length>0&&<><strong>New: {MODELS.filter(m=>newModelIds.includes(m.id)).map(m=>m.name).join(", ")}.</strong> </>}{MODELS.length} local setup choices. <a href="#advanced-local-hosting">Advanced hosting research</a> covers larger server models that do not yet have complete setup paths.</small></label>
          {selection.modelId==="custom"&&<><label>Total parameters (billions)<input type="number" min="1" max="700" value={selection.customParameters} onChange={e=>change({customParameters:Math.max(1,Math.min(700,Number(e.target.value)||1))})}/><small>For MoE, enter total parameters, not active parameters.</small></label><label>Weight precision<select value={selection.customBits} onChange={e=>change({customBits:Number(e.target.value)})}><option value="4">4-bit</option><option value="8">8-bit</option><option value="16">16-bit</option></select><small>Sizing only, not an installable artifact.</small></label></>}
        </div>
        <details className="local-adjust"><summary>Adjust context and simultaneous requests</summary><div className="local-fields">
          <label>Context length<select value={selection.context} onChange={e=>change({context:Number(e.target.value),contextChanged:true})}>{[2048,4096,8192,16384,32768].map(n=><option key={n} value={n}>{n/1024}K tokens{n===4096?" · default":""}</option>)}</select><small>Includes your question, source material and generated tokens. More context needs more memory.</small></label>
          <label>Simultaneous requests<select value={selection.parallel} onChange={e=>change({parallel:Number(e.target.value),parallelChanged:true})}><option value="1">One at a time · default</option><option value="2" disabled={serial}>Two at once</option><option value="4" disabled={serial}>Four at once</option></select><small>{serial?"This architecture is limited to one request at a time.":"More active requests share memory and processing time."}</small></label>
        </div></details>
        {!specialist&&selection.platformKnown&&selection.platform==="windows"&&selection.mode==="hardware"&&selection.vram>0&&<label className="local-checkbox"><input type="checkbox" checked={selection.offload} onChange={e=>change({offload:e.target.checked})}/>Consider system-RAM offloading · larger models, longer waits</label>}
        <details className="local-samples"><summary>Example configurations</summary><p>These replace the whole starting scenario, including task and settings.</p><div className="local-presets"><button type="button" onClick={()=>scenario("windows",64,24,"RTX 5090 Laptop GPU")}>Example · Windows 24 GB GPU<span>64 GB RAM · analysis · 4K context · 1 request · no offload</span></button><button type="button" onClick={()=>scenario("windows",64,32,"RTX 5090 desktop GPU")}>Example · Windows 32 GB GPU<span>64 GB RAM · analysis · 4K context · 1 request · no offload</span></button><button type="button" onClick={()=>scenario("mac",64,0,"Apple silicon Mac")}>Example · Mac 64 GB<span>Analysis · 4K context · 1 request</span></button></div></details>
        <p className="local-private-note">Your selections update the recommendations and setup steps together.</p>
      </div>
      <div className="local-result-panel" id="configuration-result">
        {!ready?<div className="local-empty"><p className="local-kicker">YOUR DIRECTION WILL APPEAR HERE</p><h2>Choose your platform and preferences.</h2><p>Still needed: {missing.join(", ")}.</p><p>Use “Help me find…” beside the hardware fields, or try a labeled example. Unknown memory is not treated as CPU-only.</p><p>The result includes a model, memory and storage requirements, and the setup path or capacity decision for that choice.</p></div>:<>
          <div className="local-result-head"><div><p className="local-kicker">02 · {selection.origin==="example"?"EXAMPLE · ":selection.origin==="hypothetical"?"HYPOTHETICAL · ":""}PLANNING ESTIMATE</p><h2>{selection.origin==="example"?"Example: ":""}{model.name}</h2></div><button type="button" onClick={()=>window.print()}>{completeGuide?"Print complete plan":"Print planning estimate"}</button></div>
          <p className="local-configuration">{REVIEW_DATE} · {model.quant} planning assumption · installed precision/digest unverified · {input.context.toLocaleString()} context tokens · {input.parallel} active request{input.parallel>1?"s":""} · {input.platform==="mac"?"Apple silicon Mac":"Windows"}{input.mode==="hardware"?` · ${input.ram} GB RAM${input.platform==="windows"?` / ${input.vram} GB VRAM · ${gpuLabel(selection)}`:""}`:" · hardware comparison, not confirmed equipment"}</p>
          <p className="local-explanation">{model.purpose}</p>
          <div className="trial-actions"><a href="#personal-trial">Build your personal trial</a><a href="#setup-guide">Show setup for this model</a></div>
          <p className="local-change-note" role="status" aria-live="polite">{notice || "This direction follows the task and settings above."}</p>
          {selection.spending==="existing"&&input.mode==="model"&&<p>Prefer to reuse equipment? Choose “Start with my computer” and enter its specifications to check this direction against it.</p>}
          <div className="local-stats"><div><strong>{(model.bytes/1e9).toFixed(1)} GB</strong><span>{model.id==="custom"?"Estimated weight storage":"Model download"}</span></div><div><strong>{memory.low.toFixed(1)}–{memory.high.toFixed(1)} GiB</strong><span>RAM/VRAM to run the model · planning range</span></div><div><strong>{memory.storage} GB</strong><span>Suggested free disk space</span></div></div>
          {specialist?<p className="local-response"><strong>Deployment direction:</strong> {result.speed}</p>:input.mode==="hardware"?<><div className={`local-fit local-fit-${result.fit}`}><h3>{result.title}</h3><p>{result.explanation}</p></div><dl className="local-memory-pools">{result.resources.map(resource=><div key={resource.label}><dt>{resource.label}</dt><dd>{resource.text}</dd></div>)}</dl><p className="local-response"><strong>Likely experience:</strong> {result.speed}</p></>:<p className="local-response">Compare capacity alongside chip speed, memory bandwidth and the model’s thinking time.</p>}
          <TrialKit selection={selection} revision={generation.current.value} tasks={tasks} workflows={workflows} reasons={reasons} useCandidate={id => { change({modelId:id,context:4096,parallel:1,contextChanged:true,parallelChanged:true}, "Trial candidate selected with 4K context and one request. Setup and print use these comparison settings; copy commands again."); requestAnimationFrame(() => document.getElementById("setup-guide")?.scrollIntoView({block:"start"})); }}/>
          <p className="local-settings-effect">{specialist ? "The context and request controls change a provisional memory budget, not a validated server command. Long-context and image workloads need separate runtime sizing." : "Longer context and more requests increase memory demand. Offloading can increase capacity but adds waiting. These choices update the instructions below."}</p>
          <a className="local-guide-jump" href="#setup-guide">{specialist ? "See the deployment plan ↓" : capacityBlocked ? "See the capacity decision ↓" : sizingOnly ? "Choose an exact model ↓" : "See the full setup process ↓"}</a>
          <details className="local-hardware-options" open={input.mode==="model"}><summary>{input.mode==="model"?"Compare hardware directions":"Explore other hardware for this model"}</summary>
            <article><h3>Mac · unified memory</h3><strong>{result.mac ? size(result.mac) : `${result.outlook.macTarget} GiB planning target`}</strong><p>{result.outlook.mac}</p>{!specialist&&result.mac&&<button type="button" onClick={()=>compare("mac",result.mac!,0)}>Explore this Mac scenario</button>}<a href={MAC_CAPACITY_SOURCE} target="_blank" rel="noreferrer">Current Mac capacity</a></article>
            <article><h3>{specialist ? "GPU server · memory target" : "Windows · GPU-resident target"}</h3><strong>{result.gpu ? size(result.gpu) : `${result.outlook.gpuTarget} GiB`} VRAM + {result.host ? size(result.host) : `${result.outlook.hostTarget} GiB`} RAM</strong><p>{specialist ? "GPU memory is a server-planning target, not one consumer card. The publisher's server runtime needs compatible accelerators and a supported multi-GPU layout. Native Windows support is not established by this memory estimate." : "Above 32 GB VRAM, investigate a workstation GPU; multiple GPUs need separate planning. Verify the exact GPU, not only capacity."}</p>{!specialist&&result.gpu&&result.host&&<button type="button" onClick={()=>compare("windows",result.host!,result.gpu!)}>Explore this GPU scenario</button>}<a href={specialist ? WINDOWS_RUNTIME_SOURCE : "https://docs.ollama.com/gpu"} target="_blank" rel="noreferrer">Runtime hardware requirements</a></article>
            {specialist||!result.host?<article><h3>Windows · system memory</h3><strong>{result.outlook.hostTarget} GiB RAM planning target</strong><p>{result.outlook.windows}</p><a href={WINDOWS_CAPACITY_SOURCE} target="_blank" rel="noreferrer">Workstation memory specification</a></article>:<article><h3>Windows · an 8 GB GPU option</h3><strong>{size(result.host)} RAM with an 8 GB GPU example</strong><p>{smallGpuFits?"This model fits the 8 GB GPU planning allowance; system-RAM offloading is not needed in this estimate.":"This model exceeds the 8 GB GPU planning allowance. System RAM provides an offload route; Ollama chooses the split automatically."}</p><button type="button" onClick={()=>compare("windows",result.host!,8,!smallGpuFits)}>{smallGpuFits?"Compare this GPU scenario":"Compare this offload scenario"}</button></article>}
          </details>
          {!specialist&&input.mode==="hardware"&&result.alternatives.length>0&&<details className="local-alternatives"><summary>Compare other models within this planning budget</summary><p>Compare what each model is suited to. Selecting one keeps your hardware settings.</p>{result.alternatives.map(m=><div key={m.id}><button type="button" onClick={()=>change({modelId:m.id})}>{m.name}</button><p>{m.purpose}</p></div>)}</details>}
          <Runbook key={guideKey} selection={selection} generation={generation}/>
          <details className="local-method"><summary>How the estimate works · assumptions and sources</summary><p>Model package + context cache + runtime buffers, with separate OS headroom. This is a planning range, not a measured confidence interval or benchmark. GB downloads are decimal; GiB memory uses 2³⁰ bytes. Nominal hardware classes are screened as GiB.</p><p>{memory.cache===null?"Exact cache allocation is not established; a broad allowance of 0.25–1.5 GiB per 4K tokens per request is used.":`Calculated F16 ${model.hybrid?"full-attention component of ":""}KV cache: ${memory.cache.toFixed(2)} GiB.`} Buffers and hybrid recurrent state add memory.</p><p>We reserve max(3 GiB, 20%) on Mac, max(1 GiB, 10%) of VRAM, and max(6 GiB, 20%) of host RAM for offload. These are planning assumptions, not OS limits. RAM and VRAM are not one equally fast pool.</p><p><a href={model.source} target="_blank" rel="noreferrer">Exact model source</a> · <a href="https://docs.ollama.com/context-length" target="_blank" rel="noreferrer">Context and memory</a> · <a href="https://github.com/ollama/ollama/blob/v0.34.4/server/sched.go#L501-L515" target="_blank" rel="noreferrer">Runtime concurrency limits</a> · <a href="/local-models/design-brief">Full methods in the Design Brief</a></p></details>
        </>}
      </div>
    </section>
    <section className="local-examples" id="advanced-local-hosting"><details><summary>Advanced local hosting · capacity research</summary><p>These published DeepSeek packages are being evaluated for specific server setups. The figures below are 4K-context, one-request planning targets; they are not selectable installation plans.</p><div className="local-example-grid">{DEEPSEEK_ADDITIONS.filter(m=>m.deployment).map(m=>{const memory=estimateMemory(m,4096,1), target=hardwareOutlook(memory.high); return <article key={m.id}><h3>{m.name}</h3><p>{m.purpose}</p><p><strong>{target.macTarget} GiB</strong> unified-memory target · <strong>{target.gpuTarget} GiB</strong> full-resident GPU target with <strong>{target.hostTarget} GiB</strong> host-RAM planning · <strong>{memory.storage} GB</strong> free disk target.</p><p><a href={m.source} target="_blank" rel="noreferrer">Published package and deployment sources</a> · <a href="/local-models/design-brief">Design Brief</a></p></article>;})}</div></details></section>
    <section className="local-examples"><details><summary>Practitioner demonstrations · reference, not speed predictions</summary><p>Different runtimes and incomplete settings prevent direct ranking. Choosing a demonstration changes only the model, never copies the creator’s hardware into your plan.</p><div className="local-example-grid">{PRACTITIONER_EXAMPLES.map(e=><article key={e.id}><p className="local-example-tag">Creator-reported · {e.id} · not directly comparable</p><h3>{e.name}</h3><strong className="local-example-speed">{e.speed}</strong><p>{e.hardware}</p><p>{e.model}</p><p>{e.detail}</p><p>{e.limits}</p><a href={e.source} target="_blank" rel="noreferrer">Watch source · {e.anchor}</a>{e.modelId&&<button type="button" onClick={()=>{change({modelId:e.modelId!});document.getElementById("configuration-result")?.scrollIntoView({block:"start"});}}>Try this model on my current setup</button>}</article>)}</div></details></section>
  </>;
}
