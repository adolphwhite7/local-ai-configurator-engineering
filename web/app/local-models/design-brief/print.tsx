"use client";
export default function BriefActions() {
  return <div className="brief-actions"><button type="button" onClick={() => window.print()}>Print or save PDF</button><a href="/local-models/design-brief/download" download="local-model-guide-design-brief.md">Download README</a></div>;
}
