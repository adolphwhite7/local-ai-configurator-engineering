import PublicHeader from "@/app/public-header";
import LocalModelPlanner from "./journey";


export default function LocalModelsPage() {

  return <main className="local-page">
    <PublicHeader />

    <div className="local-frame">
      <section className="local-hero" aria-labelledby="local-title">
        <div>
          <p className="local-kicker">LOCAL MODEL GUIDE</p>
          <h1 id="local-title">Find a fitting model. Try your own work.</h1>
          <p>Decide whether local suits your needs, compare hardware, and build a personal trial with a complete setup plan.</p>
        </div>
        <a className="local-brief-link" href="/local-models/design-brief">
          <strong>Design Brief</strong>
          <span>How This Guide Works</span>
        </a>
      </section>

      <LocalModelPlanner />

      <p className="prototype-attribution">Local Model Guide is continuously developed to improve hardware planning, setup guidance, and personal trials.</p>
      <section className="local-evidence" aria-labelledby="local-evidence-title">
        <div>
          <p className="local-kicker">REFERENCE</p>
          <h2 id="local-evidence-title">Sources and calculations</h2>
        </div>
        <div>
          <p>This guide combines published model and hardware specifications, practitioner demonstrations, and engineering estimates. Each serves a purpose: specifications describe the parts, demonstrations show what someone achieved, and estimates help us explore another configuration.</p>
          <ul>
            <li><a href="https://lmstudio.ai/docs/app/system-requirements" target="_blank" rel="noreferrer">LM Studio system requirements</a> — 8 GB Macs need smaller models and modest context.</li>
            <li><a href="https://docs.ollama.com/faq" target="_blank" rel="noreferrer">Ollama FAQ</a> — context, concurrent requests, and memory behavior.</li>
            <li><a href="https://github.com/ggml-org/llama.cpp/tree/master/tools/llama-bench" target="_blank" rel="noreferrer">llama.cpp benchmark documentation</a> — controlled model/runtime measurements, not an end-to-end user-experience score.</li>
            <li><a href="https://ollama.com/library" target="_blank" rel="noreferrer">Ollama model library</a> — named local model downloads, formats, and licenses.</li>
            <li><a href="https://youtu.be/mevUEQcumzU?t=421" target="_blank" rel="noreferrer">Practitioner hardware-selector walkthrough</a> — model-first exploration, optional preferences, and source-linked benchmark records. Memory formulas are detailed in the Design Brief.</li>
          </ul>
          <p className="local-source-note">Reviewed September 24, 2026. Parameter count describes size; reasoning quality also depends on training, architecture, quantization, the task, and the surrounding software.</p>
        </div>
      </section>
    </div>
  </main>;
}
