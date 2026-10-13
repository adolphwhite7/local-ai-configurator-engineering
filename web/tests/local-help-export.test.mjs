import assert from "node:assert/strict";
import test from "node:test";
import { EMPTY_SELECTION } from "../lib/local-setup-selection.ts";
import { localHelpExport } from "../lib/local-help-export.ts";

const ready = { ...EMPTY_SELECTION, platform:"mac", platformKnown:true, goalChosen:true, ram:16, modelId:"qwen8" };

test("local export includes selected step and settings, rejects unknown and incomplete state", () => {
  const result = localHelpExport(ready,"chat");
  assert.equal(result.filename,"local-model-guide-troubleshooting.txt");
  assert.match(result.body,/qwen3:8b-q4_K_M/);
  assert.match(result.body,/16 GB unified memory/);
  assert.match(result.body,/Context: 4096/);
  assert.equal(localHelpExport(ready,"unknown-step"),null);
  assert.equal(localHelpExport(EMPTY_SELECTION,"chat"),null);
  assert.equal(localHelpExport({...ready,modelId:"invented"},"chat"),null);
  assert.equal(localHelpExport({...ready,gpuName:"<script>"},"chat"),null);
  assert.equal(localHelpExport({...ready,modelId:"qwen359",parallel:2},"chat"),null);
});

test("exports regenerate on model/context changes and ignore arbitrary stored prose", () => {
  const first = localHelpExport({...ready,body:"injected",commands:"injected"},"chat");
  assert.doesNotMatch(first.body,/injected/);
  const next = localHelpExport({...ready,modelId:"llama3",context:8192,contextChanged:true},"chat");
  assert.match(next.body,/llama3.2:3b/);
  assert.match(next.body,/Context: 8192 \(changed\)/);
  assert.doesNotMatch(next.body,/qwen3:8b/);
  assert.notEqual(first.body,next.body);
});
