"use client";
import { useState, type RefObject } from "react";
import { setupRunbook, STAGES, RUNTIME_VERSION } from "@/lib/local-setup-runbook";
import { effectiveInput, PLAN_REVISION, type Selection } from "@/lib/local-setup-selection";
import { localHelpExport } from "@/lib/local-help-export";
import { REVIEW_DATE, modelFor } from "@/lib/local-model-planner";

export default function Runbook({ selection, generation }: { selection: Selection; generation: RefObject<{value:number;copying:boolean}> }) {
  const steps = setupRunbook(effectiveInput(selection));
  const specialist = modelFor(effectiveInput(selection)).deployment === "specialist";
  const capacityBlocked = steps.length === 1 && steps[0]?.id === "capacity";
  const sizingOnly = modelFor(effectiveInput(selection)).id === "custom";
  const [open, setOpen] = useState<string[]>([]);
  const [copyStatus, setCopyStatus] = useState<Record<string,string>>({});
  const [copyBusy, setCopyBusy] = useState(false);
  const [fallback, setFallback] = useState("");
  async function copy(command: string, id: string, troubleshooting = false) {
    if (generation.current.copying) return;
    const started = generation.current.value;
    generation.current.copying = true;
    setCopyBusy(true);
    try { await navigator.clipboard.writeText(command); if (started === generation.current.value) setCopyStatus({ [id]: troubleshooting ? "Troubleshooting details copied. Review them before sharing." : "Copied. Paste it only in the window named above." }); }
    catch { if (started === generation.current.value) { setCopyStatus({ [id]: "Copy was unavailable. Select the displayed text and copy it manually." }); if (troubleshooting) setFallback(command); } }
    finally { generation.current.copying = false; if (started === generation.current.value) setCopyBusy(false); }
  }
  function copyHelp(step: string) {
    const draft = localHelpExport(selection, step);
    if (draft) void copy(draft.body, `help-${step}`, true);
  }
  function downloadHelp(step: string) {
    const draft = localHelpExport(selection, step);
    if (!draft) return;
    const url = URL.createObjectURL(new Blob([draft.body], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = draft.filename;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  return <section className="local-setup" id="setup-guide" aria-labelledby="setup-title">
    <p className="local-kicker">03 · {specialist ? "DEPLOYMENT PLAN" : capacityBlocked ? "CAPACITY DECISION" : "YOUR SETUP GUIDE"}</p><h2 id="setup-title">{specialist ? "Plan the server deployment." : capacityBlocked ? "Choose hardware that can hold this model." : sizingOnly ? "Choose a named model to continue." : "Local setup, start to finish."}</h2>
    <p>{specialist ? "The published package, capacity targets and server documentation are available below. A complete platform-specific walkthrough is not yet included for this release." : capacityBlocked ? "This selection does not meet the model’s working-memory estimate. The installation steps will appear when you choose a configuration with enough capacity." : sizingOnly ? "The parameter scenario sizes memory, but it does not identify a package to download. Choose a named model to generate its installation steps." : "Install Ollama, download your selected model, and get it running locally. Each step shows where to work, what to do, and how to check the result."}</p>
    <details className="local-source-note"><summary>Version and source notes</summary><p>{REVIEW_DATE} · {specialist ? "Publisher server-runtime documentation" : `Ollama ${RUNTIME_VERSION}`} · plan {PLAN_REVISION}. {specialist ? "Weight package checked; hardware figures are planning assumptions, not a verified installation." : "Instructions checked against current documentation and source code. End-to-end hardware walkthrough: pending."} Sources are linked at each step.</p></details>
    <div className="guide-actions"><button type="button" disabled={open.length===steps.length} onClick={() => setOpen(steps.map(s=>s.id))}>Show all steps</button><button type="button" disabled={open.length===0} onClick={() => setOpen([])}>Collapse steps</button><button type="button" onClick={() => window.print()}>{specialist||capacityBlocked||sizingOnly?"Print planning estimate":"Print complete plan"}</button></div>
    {STAGES.filter(stage=>steps.some(step=>step.stage===stage)).map(stage=><section className="guide-stage" key={stage}><h3>{stage}</h3>{stage==="Recommended workarounds" && <p>Options matched to this configuration. Choose the one that addresses your issue; these are alternatives, not additional steps everyone needs to complete. Each includes its source, the expected result, and a way back to the standard setup.</p>}{steps.filter(s=>s.stage===stage).map(step=>{
      const index=steps.indexOf(step)+1; const expanded=open.includes(step.id);
      return <article className="guide-step" key={step.id}>
        <h4><button type="button" aria-expanded={expanded} aria-controls={`body-${step.id}`} onClick={()=>setOpen(old=>expanded?old.filter(id=>id!==step.id):[...old,step.id])}><span>{String(index).padStart(2,"0")}</span>{step.title}<b aria-hidden="true">{expanded?"−":"+"}</b></button></h4>
        <div id={`body-${step.id}`} className={`guide-step-body${expanded?"":" is-collapsed"}`}>
          <p><strong>Where you are</strong><br/>{step.where}</p>
          <p><strong>What to do</strong></p><ol>{step.actions.map(action=><li key={action}>{action}</li>)}</ol>
          {step.commands?.map((command,i)=><div className="guide-command" key={command}><p><strong>Command {i+1}{step.id==="chat"?(i===0?" · normal command prompt":" · inside model chat (>>>)"):""}</strong></p><pre><code>{command}</code></pre><button type="button" disabled={copyBusy} aria-describedby={`copy-${step.id}-${i}`} onClick={()=>copy(command,`${step.id}-${i}`)}>Copy this command</button><span id={`copy-${step.id}-${i}`} className="local-copy-status" role="status">{copyStatus[`${step.id}-${i}`]}</span></div>)}
          <p className="guide-success"><strong>What you should see</strong><br/>{step.expected}</p>
          <p><strong>If something differs</strong><br/>{step.recovery}</p>
          <div className="guide-step-links"><a href={step.source} target="_blank" rel="noreferrer">Source for this step</a><button type="button" disabled={copyBusy} onClick={()=>copyHelp(step.id)}>Copy troubleshooting details</button><button type="button" onClick={()=>downloadHelp(step.id)}>Download troubleshooting details</button><span className="local-copy-status guide-help-export" role="status">{copyStatus[`help-${step.id}`]}</span></div>
        </div>
      </article>;
    })}</section>)}
    {fallback && <div role="alert" className="guide-fallback guide-help-export"><h3>Copy these troubleshooting details</h3><p>Clipboard access was unavailable. Select this text and copy it manually. Nothing has been sent.</p><textarea aria-label="Troubleshooting details" readOnly value={fallback} rows={9}/></div>}
    <p className="guide-print-notes">Notes from my setup: ____________________________________________________</p>
  </section>;
}
