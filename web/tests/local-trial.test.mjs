import assert from "node:assert/strict";
import test from "node:test";
import { applyIntent, interpretGoal, normalizeSelection, trialCandidates, trialProfiles, trialSheet } from "../lib/local-trial.ts";
import { EMPTY_SELECTION, effectiveInput, validSelection } from "../lib/local-setup-selection.ts";
import { MODELS } from "../lib/local-model-planner.ts";
import { setupRunbook } from "../lib/local-setup-runbook.ts";

test("mixed and negated rules remain review suggestions; stale or unknown drafts cannot apply", () => {
  const before = { ...EMPTY_SELECTION, platform: "mac", platformKnown: true, ram: 24, modelId: "qwen8", context: 8192 };
  const draft = interpretGoal("Search scanned PDFs by voice, not code");
  assert.deepEqual(draft.workflows, ["retrieval", "ocr", "voice"]);
  assert.ok(draft.tasks.includes("code"));
  assert.match(draft.warning, /Negation/);
  assert.equal(applyIntent(before, draft.tasks, 1, 2), null);
  assert.equal(applyIntent(before, [], 2, 2), null);
  assert.equal(applyIntent(before, ["invented"], 2, 2), null);
  const applied = applyIntent(before, ["documents"], 2, 2);
  assert.deepEqual(applied, { ...before, goalChosen: true, goal: "balanced" });
  assert.equal(before.goalChosen, false);
  assert.ok(validSelection(before)); // exact prior selection remains available for Undo
  assert.deepEqual(interpretGoal("something unfamiliar").tasks, []);
});

test("normalization protects serial models and invalid hardware while retaining explicit choice", () => {
  const selected = { ...EMPTY_SELECTION, modelId: "qwen8", parallel: 4 };
  const normalized = normalizeSelection(selected, { modelId: "qwen359" });
  assert.equal(normalized.parallel, 1);
  assert.ok(validSelection(normalized));
  assert.equal(normalizeSelection(selected, { context: 12345 }), null);
  const mac = normalizeSelection({ ...selected, ram: 2048, vram: 24 }, { platform: "mac" });
  assert.equal(mac.ram, 0);
  assert.equal(mac.vram, -1);
});

test("candidate setup uses exact tags and controlled comparison; both memory profiles resize", () => {
  const own = { ...EMPTY_SELECTION, platformKnown: true, goalChosen: true, ram: 32, vram: 12, modelId: "qwen8", context: 8192, parallel: 2 };
  const profiles = trialProfiles(own);
  assert.ok(profiles.everyday.high > profiles.comparison.high);
  assert.equal(profiles.comparison.cache, .5625);
  const candidates = trialCandidates(own, ["documents"]);
  assert.deepEqual(candidates.map(c => c.model.id), ["qwen8", "qwen35", "qwen359"]);
  for (const { model } of candidates) {
    const next = normalizeSelection(own, { modelId: model.id, context: 4096, parallel: 1 });
    const steps = setupRunbook(effectiveInput(next));
    assert.ok(steps.find(s => s.id === "download").commands.includes(`ollama pull ${model.tag}`));
    assert.ok(steps.find(s => s.id === "chat").commands.includes("/set parameter num_ctx 4096"));
  }
  assert.equal(MODELS.length, 11);
  assert.deepEqual(trialCandidates({ ...own, modelId: "custom" }, ["code"]), []);
  const shopping = { ...own, mode: "model" };
  assert.deepEqual(trialCandidates(shopping, ["code"]), trialCandidates({ ...shopping, ram: 8, vram: 0, offload: true }, ["code"]));
});

test("local trial export binds current plan, representative tasks and unrun evidence limits", () => {
  const sheet = trialSheet({ ...EMPTY_SELECTION, modelId: "qwen8" }, ["code"], ["ide"], ["Repair my function", "", "A hard edge case"], "Hidden tests pass", ["Pass"], ["Privacy"]);
  assert.match(sheet, /Why local: Privacy/);
  assert.match(sheet, /qwen3:8b-q4_K_M/);
  assert.match(sheet, /Task 3: A hard edge case/);
  assert.match(sheet, /RECORD FROM YOUR INSTALL/);
  assert.match(sheet, /not run/);
  assert.match(sheet, /No measurement upload or trained prediction is implemented/);
});
