import assert from "node:assert/strict";
import test from "node:test";
import { INITIAL, MODELS } from "../lib/local-model-planner.ts";
import { setupRunbook, SERIAL_MODELS, helpDraft } from "../lib/local-setup-runbook.ts";
import { EMPTY_SELECTION, PLAN_REVISION, editedHardwareOrigin, effectiveInput, gpuLabel, missingFacts, validSelection } from "../lib/local-setup-selection.ts";

test("each supported model/platform/context/request combination produces only its own commands", () => {
  let checked = 0;
  for (const model of MODELS.filter(m=>!m.deployment)) for (const platform of ["mac","windows"]) for (const context of [2048,4096,8192,16384,32768]) for (const parallel of [1,2,4]) {
    const input = {...INITIAL, platform, modelId:model.id, context, parallel, ram:model.id === "r1full" && platform === "windows" ? 1024 : 128, vram:32};
    if (SERIAL_MODELS.includes(model.id) && parallel>1) { assert.throws(()=>setupRunbook(input)); continue; }
    if (model.id === "r1full" && platform === "mac") {
      assert.deepEqual(setupRunbook(input).map(s=>s.id),["capacity"]);
      continue;
    }
    const steps=setupRunbook(input), text=JSON.stringify(steps);
    assert.equal(steps.filter(s=>s.stage!=="Recommended workarounds").length,10);
    assert.equal(new Set(steps.map(s=>s.id)).size,steps.length);
    for (const s of steps) for (const key of ["where","expected","recovery","source"]) assert.ok(s[key]);
    assert.ok(steps.every(s=>s.actions.length && s.source.startsWith("https://")));
    assert.equal(steps.find(s=>s.id==="chat").commands[0],`ollama run ${model.tag}`);
    assert.ok(steps.find(s=>s.id==="chat").commands.includes(`/set parameter num_ctx ${context}`));
    assert.ok(steps.find(s=>s.id==="download").commands.includes(`ollama pull ${model.tag}`));
    assert.equal(steps.find(s=>s.id==="next-session").commands[0],`ollama stop ${model.tag}`);
    const server=steps.find(s=>s.id==="server").commands[0];
    assert.match(server,/127\.0\.0\.1:11434/);
    assert.ok(server.includes(`OLLAMA_NUM_PARALLEL=${platform==="mac"?parallel:`"${parallel}"`}`));
    assert.equal(server.includes("$env:"),platform==="windows");
    assert.doesNotMatch(text,/undefined|NaN|selected-tag|actual-Modelfile-path/);
    checked++;
  }
  assert.equal(checked,235);
});

test("serial-model guard states the request limit without implying a release-specific exception", () => {
  const input = {...INITIAL, modelId:"qwen35", parallel:2};
  assert.throws(() => setupRunbook(input), error => {
    assert.match(error.message, /requires one active request/);
    assert.doesNotMatch(error.message, /Ollama 0\.34\.4/);
    return true;
  });
});

test("Windows CPU-only profiles are created before loading and used through shutdown",()=>{
  for(const model of MODELS.filter(m=>!m.deployment)){
    const steps=setupRunbook({...INITIAL,platform:"windows",vram:0,ram:model.id === "r1full" ? 768 : 64,modelId:model.id,parallel:1,context:8192});
    const alias=`localguide-${model.id}-cpu:ctx8192`;
    assert.equal(steps.filter(s=>s.stage!=="Recommended workarounds").length,11);
    const profile=steps.find(s=>s.id==="cpu-profile");
    assert.match(profile.commands[0],/Set-Content -LiteralPath/);
    assert.ok(profile.commands[0].includes(`FROM ${model.tag}`));
    assert.match(profile.commands[0],/PARAMETER num_gpu 0/);
    assert.match(profile.commands[0],/PARAMETER num_ctx 8192/);
    assert.ok(steps.find(s=>s.id==="chat").commands.includes(`ollama run ${alias}`));
    assert.ok(JSON.stringify(steps.find(s=>s.id==="offline")).includes(`ollama run ${alias}`));
    assert.equal(steps.find(s=>s.id==="next-session").commands[0],`ollama stop ${alias}`);
    assert.doesNotMatch(JSON.stringify(steps),/download the recommended driver/);
  }
});

test("custom sizing stops at artifact selection instead of producing a fabricated command",()=>{
  const steps=setupRunbook({...INITIAL,modelId:"custom"});
  assert.equal(steps.at(-1).id,"artifact");
  assert.equal(steps.length,5);
  assert.doesNotMatch(JSON.stringify(steps),/ollama pull|ollama run|ollama serve/);
});
test("full R1 stops before download when capacity does not fit and regenerates on a 768 GB offload route",()=>{
  const blockedMac=setupRunbook({...INITIAL,platform:"mac",ram:512,modelId:"r1full"});
  const blockedWindows=setupRunbook({...INITIAL,platform:"windows",ram:512,vram:8,offload:true,modelId:"r1full"});
  for(const steps of [blockedMac,blockedWindows]){
    assert.deepEqual(steps.map(s=>s.id),["capacity"]);
    assert.doesNotMatch(JSON.stringify(steps),/ollama pull|ollama run/);
  }
  const installable=setupRunbook({...INITIAL,platform:"windows",ram:768,vram:8,offload:true,modelId:"r1full"});
  assert.ok(installable.some(s=>s.id==="download"));
  assert.ok(installable.find(s=>s.id==="download").commands.includes("ollama pull deepseek-r1:671b"));
  assert.ok(validSelection({...EMPTY_SELECTION,platform:"windows",platformKnown:true,ram:768,vram:8,goalChosen:true,modelId:"r1full"}));
  assert.equal(validSelection({...EMPTY_SELECTION,platform:"mac",platformKnown:true,ram:768,goalChosen:true,modelId:"r1full"}),false);
});

test("recommended workarounds follow platform, model architecture, and pressure",()=>{
  const base={...INITIAL,modelId:"qwen8",context:8192,parallel:1,ram:64,vram:8};
  const ids=input=>setupRunbook(input).filter(s=>s.stage==="Recommended workarounds").map(s=>s.id);
  assert.ok(ids({...base,platform:"windows"}).includes("gpu-layer-adjustment"));
  for(const input of [{...base,platform:"mac"}, {...base,platform:"windows",vram:0}, {...base,platform:"windows",vram:-1}, {...base,mode:"model",platform:"windows"}]){
    assert.ok(!ids(input).includes("gpu-layer-adjustment"));
    assert.ok(ids(input).includes("cache-adjustment"));
    assert.ok(ids(input).includes("storage-adjustment"));
  }
  for(const modelId of ["qwen35","qwen359","qwen27","qwen36","oss120"]){
    const result=ids({...base,platform:"windows",modelId});
    assert.ok(!result.includes("cache-adjustment"));
    assert.ok(!result.includes("gpu-layer-adjustment"));
  }
  assert.ok(!ids({...base,platform:"mac",ram:128,context:2048}).includes("cache-adjustment"));
  assert.deepEqual(ids({...base,modelId:"custom"}),[]);
});

test("workaround commands retain plan settings, reset cache, and never delete originals",()=>{
  for(const platform of ["mac","windows"]){
    const input={...INITIAL,platform,modelId:"qwen8",ram:64,vram:8,context:16384,parallel:2};
    const steps=setupRunbook(input);
    const baseline=steps.find(s=>s.id==="server").commands[0];
    const cache=steps.find(s=>s.id==="cache-adjustment");
    const storage=steps.find(s=>s.id==="storage-adjustment");
    for(const command of [baseline,cache.commands[0],storage.commands[0]]){
      assert.match(command,/127\.0\.0\.1:11434/);
      assert.match(command,/OLLAMA_NO_CLOUD/);
      assert.match(command,/16384/);
      assert.match(command,/OLLAMA_NUM_PARALLEL/);
    }
    assert.match(baseline,/OLLAMA_KV_CACHE_TYPE=.*f16/);
    assert.match(baseline,platform==="mac"?/unset OLLAMA_FLASH_ATTENTION/:/Remove-Item Env:OLLAMA_FLASH_ATTENTION/);
    assert.match(cache.commands[0],/q8_0/);
    assert.match(storage.commands[0],/OLLAMA_MODELS/);
    assert.match(storage.commands[0],/f16/);
    assert.match(storage.commands[0],platform==="mac"?/^\{\nread -r/:/^& \{/);
    assert.match(storage.commands[1],/^ollama pull qwen3:8b/);
    assert.doesNotMatch(storage.commands.join("\n").replace("Remove-Item Env:OLLAMA_FLASH_ATTENTION -ErrorAction SilentlyContinue",""),/Remove-Item|rm -rf|Move-Item|OLLAMA_MODELS=.*undefined/);
    assert.match(storage.actions.join(" "),/freshly copied path/);
    assert.match(cache.actions.join(" "),/fresh window A/);
    assert.match(storage.actions.join(" "),/window B/);
  }
  const cpu=setupRunbook({...INITIAL,platform:"windows",modelId:"qwen8",ram:64,vram:0,context:8192,parallel:1});
  assert.equal(cpu.find(s=>s.id==="cache-adjustment").commands[1],"ollama run localguide-qwen8-cpu:ctx8192");
  assert.match(cpu.find(s=>s.id==="storage-adjustment").actions.join(" "),/Repeat Save the CPU-only settings/);
});

test("manual GPU recipe uses a separate profile and no guessed layer count",()=>{
  const input={...INITIAL,platform:"windows",modelId:"qwen8",ram:64,vram:8,context:8192,parallel:1};
  const step=setupRunbook(input).find(s=>s.id==="gpu-layer-adjustment");
  assert.match(step.commands[1],/^\. \{/);
  assert.match(step.commands[1],/Read-Host/);
  assert.match(step.commands[1],/PARAMETER num_gpu \$gpuLayers/);
  assert.match(step.commands[1],/FROM qwen3:8b/);
  assert.match(step.commands[1],/if \(\$LASTEXITCODE -eq 0\)/);
  assert.doesNotMatch(step.commands.join(" "),/OLLAMA_NUM_GPU|OLLAMA_GPU_LAYERS/);
  assert.match(step.actions.join(" "),/original model is unchanged/);
  assert.match(step.actions.join(" "),/load messages/);
});

test("workaround help distinguishes actual adjustments from base-plan estimates",()=>{
  const selection={...EMPTY_SELECTION,platform:"windows",platformKnown:true,goalChosen:true,modelId:"qwen8",ram:64,vram:8,context:8192,parallel:1};
  const help=helpDraft(selection,"cache-adjustment");
  assert.ok(help);
  assert.match(help.body,/Workaround tried/);
  assert.match(help.body,/base plan/);
  assert.doesNotMatch(helpDraft(selection,"computer").body,/Workaround tried/);
  const changed={...selection,modelId:"qwen35"};
  assert.equal(helpDraft(changed,"cache-adjustment"),null);
});

test("unknown hardware stays unknown and shopper suggestions respond to preferences",()=>{
  assert.ok(missingFacts(EMPTY_SELECTION).length);
  assert.notEqual(EMPTY_SELECTION.vram,0);
  const s={...EMPTY_SELECTION,mode:"model",goal:"deep",goalChosen:true,platformKnown:true};
  assert.equal(missingFacts(s).length,0);
  assert.equal(effectiveInput(s).modelId,"qwen27");
  assert.equal(effectiveInput({...s,priority:"responsive"}).modelId,"qwen14");
});

test("Windows estimates and GPU instructions do not require a GPU name",()=>{
  for(const gpuName of ["", "   ", "  NVIDIA GeForce RTX 3050 Laptop GPU  "]){
    const s={...EMPTY_SELECTION,platform:"windows",platformKnown:true,goalChosen:true,ram:16,vram:4,gpuName};
    assert.deepEqual(missingFacts(s),[]);
    assert.ok(validSelection(s));
    const label=gpuName.trim() || "NVIDIA GPU — model not specified";
    assert.equal(gpuLabel(s),label);
    const steps=setupRunbook(effectiveInput(s));
    assert.ok(!steps.some(step=>step.id==="cpu-profile"));
    assert.match(JSON.stringify(steps[0]),/Record the full GPU name/);
    const help=helpDraft(s,"computer");
    assert.ok(help.body.includes(`16 GB RAM / 4 GB VRAM; ${label}`));
    assert.doesNotMatch(help.body,/CPU-only/);
  }
});

test("GPU labels preserve unknown memory, CPU-only and Mac distinctions",()=>{
  const s={...EMPTY_SELECTION,platform:"windows",platformKnown:true,goalChosen:true,ram:16,gpuName:"stale GPU name"};
  assert.deepEqual(missingFacts(s),["dedicated GPU memory (or CPU-only)"]);
  assert.equal(gpuLabel(s),"GPU memory not specified");
  const cpu={...s,vram:0};
  assert.deepEqual(missingFacts(cpu),[]);
  assert.equal(gpuLabel(cpu),"CPU-only");
  assert.ok(setupRunbook(effectiveInput(cpu)).some(step=>step.id==="cpu-profile"));
  assert.match(helpDraft(cpu,"computer").body,/0 GB VRAM; CPU-only/);
  const mac={...s,platform:"mac"};
  assert.deepEqual(missingFacts(mac),[]);
  assert.match(helpDraft(mac,"computer").body,/16 GB unified memory; Apple silicon Mac/);
  assert.doesNotMatch(helpDraft(mac,"computer").body,/VRAM|stale GPU name|CPU-only/);
  const shopping={...s,mode:"model"};
  assert.deepEqual(missingFacts(shopping),[]);
  assert.match(helpDraft(shopping,"computer").body,/shopping comparison, not entered equipment/);
  assert.doesNotMatch(helpDraft(shopping,"computer").body,/stale GPU name|CPU-only/);
});

test("shopping guide ignores hidden previous hardware for every named model",()=>{
  for(const model of MODELS){
    const selection={...EMPTY_SELECTION,mode:"model",platformKnown:true,goalChosen:true,modelId:model.id};
    const expected=setupRunbook(effectiveInput(selection));
    for(const hardware of [{ram:64,vram:0,offload:false},{ram:64,vram:8,offload:true},{ram:512,vram:96,offload:false}]){
      const input=effectiveInput({...selection,...hardware});
      assert.equal(input.ram,0); assert.equal(input.vram,-1); assert.equal(input.offload,false);
      assert.deepEqual(setupRunbook(input),expected);
      if (model.id === "r1full") assert.deepEqual(expected.map(s=>s.id),["capacity"]);
      else if (!model.deployment) assert.match(expected.find(s=>s.id==="answer").expected,/no selected hardware route yet/);
      else assert.ok(expected.some(s=>s.id==="deployment-scope"));
    }
  }
});

test("automatic shopping recommendations ignore hardware history across goals and preferences",()=>{
  for(const goal of ["quick","balanced","deep"]) for(const priority of ["","responsive","patient"]){
    const selection={...EMPTY_SELECTION,mode:"model",platformKnown:true,goalChosen:true,goal,priority};
    const expected=setupRunbook(effectiveInput(selection));
    assert.deepEqual(setupRunbook(effectiveInput({...selection,ram:512,vram:6,offload:true})),expected);
    assert.deepEqual(setupRunbook(effectiveInput({...selection,ram:64,vram:0,offload:false})),expected);
  }
});

test("tight GPU runbook describes possible fallback instead of asserting mixed placement",()=>{
  const steps=setupRunbook({...INITIAL,ram:512,vram:6,modelId:"llama3",offload:true});
  assert.match(steps.find(s=>s.id==="answer").expected,/GPU-only or mixed CPU\/GPU placement is possible/);
});

test("edited example hardware remains hypothetical; entered hardware remains own",()=>{
  assert.equal(editedHardwareOrigin({...EMPTY_SELECTION,origin:"example"}),"hypothetical");
  assert.equal(editedHardwareOrigin({...EMPTY_SELECTION,origin:"hypothetical"}),"hypothetical");
  assert.equal(editedHardwareOrigin(EMPTY_SELECTION),"own");
});

test("Qwen 9B public help retains compatibility and rejects unsupported concurrency",()=>{
  const selection={...EMPTY_SELECTION,platform:"mac",platformKnown:true,goalChosen:true,ram:16,modelId:"qwen359"};
  assert.equal(PLAN_REVISION,"2026-09-26.deepseek-capacity1");
  assert.ok(SERIAL_MODELS.includes("qwen359"));
  assert.ok(validSelection(selection));
  const help=helpDraft(selection,"chat");
  assert.match(help.body,/Qwen 3\.5 · 9B \(qwen3\.5:9b\)/);
  assert.match(help.body,/16 GB unified memory/);
  for(const parallel of [2,4]){
    const invalid={...selection,parallel};
    assert.equal(validSelection(invalid),false);
    assert.throws(()=>setupRunbook(effectiveInput(invalid)),/one active request/);
  }
});

test("switching through Qwen 9B regenerates exact tags, CPU profiles and eligible workarounds",()=>{
  const base={...INITIAL,platform:"windows",ram:32,vram:12,context:8192,parallel:1};
  for(const modelId of ["qwen8","qwen359","qwen35","qwen359","qwen8"]){
    const model=MODELS.find(m=>m.id===modelId);
    const steps=setupRunbook({...base,modelId});
    const downloads=steps.find(s=>s.id==="download");
    assert.equal(downloads.source,model.source);
    assert.ok(downloads.commands.includes(`ollama pull ${model.tag}`));
    assert.equal(steps.find(s=>s.id==="chat").commands[0],`ollama run ${model.tag}`);
    assert.equal(steps.some(s=>s.id==="cache-adjustment"),modelId==="qwen8");
    assert.equal(steps.some(s=>s.id==="gpu-layer-adjustment"),modelId==="qwen8");
    const text=JSON.stringify(steps);
    for(const stale of MODELS.filter(m=>m.id!==modelId&&m.tag)) assert.ok(!text.includes(stale.tag));
  }
  const cpu=setupRunbook({...base,modelId:"qwen359",vram:0});
  assert.equal(cpu.find(s=>s.id==="chat").commands[0],"ollama run localguide-qwen359-cpu:ctx8192");
  const mac=setupRunbook({...base,modelId:"qwen359",platform:"mac",ram:16,context:4096});
  assert.ok(!mac.some(s=>s.id==="cpu-profile"));
  assert.equal(mac.find(s=>s.id==="chat").commands[0],"ollama run qwen3.5:9b");
  assert.ok(mac.find(s=>s.id==="chat").commands.includes("/set parameter num_ctx 4096"));
  assert.doesNotMatch(JSON.stringify(mac),/localguide-qwen359-cpu|\$env:|PowerShell/);
  assert.match(mac.find(s=>s.id==="version").expected,/requires at least 0\.17\.1/);
});
