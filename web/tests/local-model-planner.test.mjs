import assert from "node:assert/strict";
import test from "node:test";
import { INITIAL, MODELS, estimateMemory, modelFor, planLocalSetup } from "../lib/local-model-planner.ts";

test("capable hardware gets an immediately useful mid-size model, not a tiny-model gate", () => {
  const r = planLocalSetup(INITIAL);
  assert.equal(r.model.id, "qwen14");
  assert.equal(r.fit, "comfortable");
  assert.match(r.command, /qwen3:14b-q4_K_M/);
});
test("64 GB Mac can explore the selected 70B Q4", () => {
  const r = planLocalSetup({ ...INITIAL, platform: "mac", ram: 64, modelId: "r170" });
  assert.equal(r.fit, "comfortable");
  assert.equal(r.mac, 64);
  assert.ok(r.memory.high < 64);
});
test("full R1 has a real workstation memory comparison but exceeds the listed single-Mac ceiling", () => {
  const comparison = planLocalSetup({ ...INITIAL, mode: "model", platform: "windows", modelId: "r1full", ram: 0, vram: -1, offload: false });
  assert.equal(comparison.model.tag, "deepseek-r1:671b");
  assert.equal(comparison.host, 768);
  assert.equal(comparison.mac, null);
  assert.ok(comparison.outlook.macTarget > 512);
  const workable = planLocalSetup({ ...INITIAL, platform: "windows", modelId: "r1full", ram: 768, vram: 8, offload: true });
  assert.equal(workable.fit, "offload");
  assert.equal(planLocalSetup({ ...INITIAL, platform: "mac", modelId: "r1full", ram: 512 }).fit, "larger");
});
test("8 GB M1 remains a small-model option, not the global ceiling", () => {
  const r = planLocalSetup({ ...INITIAL, platform: "mac", ram: 8, modelId: "auto" });
  assert.equal(r.model.id, "llama3");
  assert.equal(r.fit, "tight");
  assert.doesNotMatch(r.command, /deepseek-r1:latest/);
});
test("Windows 8 GB GPU + 64 GB host RAM offers a 35B MoE offload path", () => {
  const r = planLocalSetup({ ...INITIAL, ram: 64, vram: 8, modelId: "qwen36" });
  assert.equal(r.fit, "offload");
  assert.ok(r.memory.weights > 20);
  assert.equal(r.model.active, 3);
});
test("no offload option does not silently use CPU RAM as VRAM", () => {
  const r = planLocalSetup({ ...INITIAL, ram: 128, vram: 8, modelId: "r170", offload: false });
  assert.equal(r.fit, "larger");
});
test("CPU-only mode is a genuine path when RAM is sufficient", () => {
  assert.equal(planLocalSetup({ ...INITIAL, ram: 64, vram: 0, modelId: "qwen14" }).fit, "cpu");
  assert.equal(planLocalSetup({ ...INITIAL, ram: 64, vram: 0, offload: false, modelId: "auto" }).model.id, "qwen14");
  assert.equal(planLocalSetup({ ...INITIAL, ram: 64, vram: 0, offload: false, modelId: "auto" }).fit, "cpu");
});
test("deep exploration can use enabled host offload rather than a tiny VRAM-only recommendation", () => {
  const r = planLocalSetup({ ...INITIAL, ram: 64, vram: 8, goal: "deep" });
  assert.equal(r.model.id, "qwen27");
  assert.equal(r.fit, "offload");
});
test("reverse hardware tiers satisfy the stated upper planning bound", () => {
  for (const model of MODELS) {
    const r = planLocalSetup({ ...INITIAL, mode: "model", modelId: model.id });
    if (r.mac) assert.ok(r.mac - Math.max(3, r.mac * .2) >= r.memory.high);
    if (r.gpu) assert.ok(r.gpu - Math.max(1, r.gpu * .1) >= r.memory.high);
  }
});
test("longer context and parallel requests increase memory estimates", () => {
  for (const model of MODELS) {
    const base = estimateMemory(model, 4096, 1);
    assert.ok(estimateMemory(model, 32768, 1).high > base.high);
    assert.ok(estimateMemory(model, 4096, 4).high > base.high);
  }
});
test("hybrid KV uses the partial full-attention component, plus a separate allowance", () => {
  const r = planLocalSetup({ ...INITIAL, modelId: "qwen27" });
  assert.equal(r.memory.cache, .25);
  assert.ok(r.memory.high > r.memory.weights + r.memory.cache);
});
test("custom quantization is arithmetic, not an executable model or quality score", () => {
  const low = planLocalSetup({ ...INITIAL, modelId: "custom", customParameters: 30, customBits: 4 });
  const high = planLocalSetup({ ...INITIAL, modelId: "custom", customParameters: 30, customBits: 8 });
  assert.equal(high.memory.weights, low.memory.weights * 2);
  assert.equal(low.command, null);
  assert.equal(low.memory.cache, null);
});
test("unknown model IDs safely fall back to a named catalog recommendation", () => {
  assert.ok(MODELS.some(m => m.id === modelFor({ ...INITIAL, modelId: "invalid" }).id));
});
test("catalog commands are explicit local tags, not cloud defaults", () => {
  for (const model of MODELS) {
    if (model.deployment) {
      assert.equal(model.tag, "");
      assert.equal(planLocalSetup({ ...INITIAL, modelId: model.id }).command, null);
    } else assert.match(model.tag, /^[a-z0-9.-]+:[a-zA-Z0-9_.-]+$/);
    assert.ok(!model.tag.includes("cloud"));
    assert.match(model.source, /^https:\/\//);
  }
});

test("likely experience puts memory constraints before a model's intended capabilities", () => {
  const m1 = planLocalSetup({ ...INITIAL, platform: "mac", ram: 8, modelId: "qwen35" });
  assert.equal(m1.fit, "tight");
  assert.match(m1.speed, /^A memory-constrained setup/);
  assert.match(m1.speed, /compact reasoning model/);
  assert.doesNotMatch(m1.speed, /accelerated, interactive|high.performance|higher-capacity setup|midrange setup/i);
  const oversized = planLocalSetup({ ...INITIAL, platform: "mac", ram: 8, modelId: "r170" });
  assert.equal(oversized.fit, "larger");
  assert.match(oversized.speed, /^Memory is the main obstacle/);
  assert.doesNotMatch(oversized.speed, /higher-capacity setup|fits with memory headroom/);
});

test("comfortable experience follows named-model use, not RAM size or requested goal", () => {
  const configuration = { ...INITIAL, platform: "mac", ram: 128, goal: "deep" };
  for (const [modelId, opening] of [["llama3", "A lightweight setup"], ["qwen35", "A compact reasoning setup"], ["qwen359", "A midrange reasoning setup"], ["qwen8", "A midrange setup"], ["qwen14", "A midrange setup"], ["qwen27", "A higher-capacity setup"], ["qwen32", "A higher-capacity setup"], ["qwen36", "A higher-capacity setup"], ["r170", "A higher-capacity setup"], ["oss120", "A higher-capacity setup"]]) {
    const result = planLocalSetup({ ...configuration, modelId });
    assert.equal(result.fit, "comfortable");
    assert.ok(result.speed.startsWith(opening), modelId);
    assert.doesNotMatch(result.speed, /highest.performance|fast replies|smarter|tokens per second/i);
  }
  const roomy = planLocalSetup({ ...INITIAL, platform: "mac", ram: 16, modelId: "qwen35" });
  assert.equal(roomy.fit, "comfortable");
  assert.match(roomy.speed, /^A compact reasoning setup/);
});

test("execution route, context and concurrency update likely experience", () => {
  const base = { ...INITIAL, modelId: "qwen14", ram: 64, vram: 8 };
  assert.match(planLocalSetup(base).speed, /^A GPU \+ system-RAM route/);
  assert.match(planLocalSetup({ ...base, vram: 0 }).speed, /^A CPU-based setup/);
  assert.match(planLocalSetup({ ...base, offload: false }).speed, /^The model exceeds the GPU-memory/);
  const mac = { ...INITIAL, platform: "mac", ram: 16, modelId: "llama3", context: 4096, parallel: 1 };
  assert.equal(planLocalSetup(mac).fit, "comfortable");
  const busy = planLocalSetup({ ...mac, parallel: 4 });
  assert.equal(busy.fit, "tight");
  assert.match(busy.speed, /One request at a time would leave more working room/);
  const roomy = planLocalSetup({ ...mac, ram: 64, parallel: 4 });
  assert.match(roomy.speed, /4 active requests; those requests share processing power/);
  assert.equal(planLocalSetup({ ...mac, modelId: "qwen14", context: 32768 }).fit, "larger");
});

test("custom sizing never invents a reasoning or performance class", () => {
  for (const platform of ["mac", "windows"]) for (const ram of [8, 64, 512]) for (const vram of [0, 8, 96]) {
    const r = planLocalSetup({ ...INITIAL, platform, ram, vram, modelId: "custom", customParameters: 30 });
    assert.match(r.speed, /An exact model is needed/);
    assert.doesNotMatch(r.speed, /midrange setup|higher-capacity setup|compact reasoning setup|accelerated, interactive/i);
  }
});

test("16 to 512 GB host RAM updates the explanation without being added to 6 GB VRAM", () => {
  const base = { ...INITIAL, vram: 6, goal: "deep", offload: false, modelId: "auto" };
  const small = planLocalSetup({ ...base, ram: 16 });
  const large = planLocalSetup({ ...base, ram: 512 });
  assert.equal(small.model.id, "llama3");
  assert.equal(large.model.id, small.model.id);
  assert.equal(small.available, 5);
  assert.equal(large.available, 5);
  assert.equal(small.hostAvailable, 10);
  assert.equal(large.hostAvailable, 409.6);
  assert.equal(large.fit, "tight");
  assert.notEqual(small.speed, large.speed);
  assert.match(large.speed, /GPU memory.*6 GB VRAM/);
  assert.match(large.speed, /512 GB of system RAM has capacity/);
  assert.match(small.speed, /would be Qwen 3 · 8B/);
  assert.match(large.speed, /would be Qwen 3.8 · 27B/);
  assert.doesNotMatch(large.speed, /little spare memory/);
});

test("offload-enabled automatic selection uses host capacity for every work goal", () => {
  for (const [goal, smallId, largeId] of [["quick", "qwen35", "qwen35"], ["balanced", "qwen8", "qwen14"], ["deep", "qwen8", "qwen27"]]) {
    for (const [ram, modelId] of [[16, smallId], [512, largeId]]) {
      const r = planLocalSetup({ ...INITIAL, ram, vram: 6, goal, offload: true });
      assert.equal(r.model.id, modelId);
      assert.equal(r.fit, "offload");
      assert.equal(r.available, 5);
    }
  }
});

test("borderline GPU fit offers host fallback without claiming actual mixed placement", () => {
  const r = planLocalSetup({ ...INITIAL, ram: 512, vram: 6, modelId: "llama3" });
  assert.equal(r.gpuFit, "tight");
  assert.equal(r.fit, "offload");
  assert.match(r.speed, /may stay on the GPU or use a CPU\/GPU split/);
  assert.equal(planLocalSetup({ ...INITIAL, ram: 8, vram: 6, modelId: "llama3" }).fit, "tight");
});

test("GPU-resident assessment does not imply the entire host has sufficient RAM", () => {
  const r = planLocalSetup({ ...INITIAL, ram: 8, vram: 96, modelId: "oss120", offload: false });
  assert.equal(r.fit, "comfortable");
  assert.match(r.title, /GPU-memory allowance/);
  assert.match(r.resources[1].text, /Does not cover.*system-memory route/);
  assert.match(r.speed, /8 GB of system RAM does not cover/);
});

test("borderline custom sizing has the same optional offload language as named models", () => {
  const r = planLocalSetup({ ...INITIAL, ram: 16, vram: 6, modelId: "custom", customParameters: 4, customBits: 4 });
  assert.equal(r.gpuFit, "tight");
  assert.equal(r.fit, "offload");
  assert.match(r.speed, /system RAM available if offloading is needed/);
  assert.doesNotMatch(r.speed, /relies on system RAM/);
});

test("offload preview does not promise a model before multi-request normalization", () => {
  const r = planLocalSetup({ ...INITIAL, ram: 24, vram: 6, goal: "deep", context: 32768, parallel: 2, offload: false });
  assert.doesNotMatch(r.speed, /starting suggestion.*would be/);
});

test("Qwen 3.5 9B uses its exact package with the shared hybrid architecture allowance", () => {
  const model = MODELS.find(m => m.id === "qwen359");
  assert.equal(MODELS[MODELS.indexOf(model) - 1].id, "qwen35");
  assert.equal(model.parameters, 9.65);
  assert.equal(model.bytes, 6594474711);
  assert.equal(model.quant, "Q4_K_M");
  assert.equal(model.tag, "qwen3.5:9b");
  assert.equal(model.minimum, "0.17.1");
  assert.equal(model.kvPerToken, 32768);
  assert.equal(model.hybrid, true);
  assert.match(model.purpose, /This plan covers text use\.$/);
  const memory = estimateMemory(model, 4096, 1);
  assert.equal(memory.weights, 6594474711 / 2 ** 30);
  assert.equal(memory.cache, 0.125);
  assert.equal(memory.low, memory.weights + 0.125 + 1.5);
  assert.equal(memory.high, memory.weights + 0.125 + 4);
  assert.equal(memory.storage, 24);
  assert.equal(estimateMemory(model, 8192, 1).high, memory.high + 0.125);
});

test("Qwen 3.5 9B manual choice produces separate Mac, GPU and host planning tiers", () => {
  const choice = { ...INITIAL, modelId: "qwen359", context: 4096, parallel: 1 };
  const result = planLocalSetup(choice);
  assert.equal(result.model.id, "qwen359");
  assert.equal(result.mac, 16);
  assert.equal(result.gpu, 12);
  assert.equal(result.host, 32);
  assert.match(result.command, /^ollama pull qwen3\.5:9b\nollama run qwen3\.5:9b$/);
  assert.equal(planLocalSetup({ ...choice, platform: "mac", ram: 8 }).fit, "larger");
  assert.equal(planLocalSetup({ ...choice, platform: "mac", ram: 16 }).fit, "comfortable");
  const gpuFirst = planLocalSetup({ ...choice, ram: 16, vram: 12 });
  assert.equal(gpuFirst.fit, "comfortable");
  assert.ok(gpuFirst.hostAvailable < gpuFirst.memory.high);
  assert.match(gpuFirst.speed, /16 GB of system RAM does not cover/);
  const fullHost = planLocalSetup({ ...choice, ram: 32, vram: 12 });
  assert.equal(fullHost.fit, "comfortable");
  assert.ok(fullHost.hostAvailable >= fullHost.memory.high);
});

test("Qwen 9B adds a nearby comparison without replacing existing defaults or bands", () => {
  for (const [modelId, expected] of [
    ["qwen35", ["llama3", "qwen8", "qwen36", "qwen359"]],
    ["qwen8", ["llama3", "qwen14", "qwen36", "qwen359"]],
    ["qwen14", ["llama3", "qwen8", "qwen36", "qwen359"]],
    ["llama3", ["qwen35", "qwen8", "qwen36"]],
    ["qwen359", ["llama3", "qwen8", "qwen36"]],
  ]) {
    const result = planLocalSetup({ ...INITIAL, platform: "mac", ram: 128, modelId });
    assert.deepEqual(result.alternatives.map(m => m.id), expected);
  }
  const small = planLocalSetup({ ...INITIAL, platform: "mac", ram: 8, modelId: "qwen35" });
  assert.ok(!small.alternatives.some(m => m.id === "qwen359"));
  for (const goal of ["quick", "balanced", "deep"]) for (const ram of [8, 16, 32, 64, 128, 512]) {
    for (const platform of ["mac", "windows"]) for (const vram of [0, 6, 12, 32]) {
      assert.notEqual(modelFor({ ...INITIAL, goal, ram, platform, vram }).id, "qwen359");
    }
  }
  const defaults = planLocalSetup(INITIAL);
  assert.equal(defaults.model.id, "qwen14");
  assert.deepEqual(defaults.alternatives.map(m => m.id), ["llama3", "qwen8", "qwen27", "qwen359"]);
});
