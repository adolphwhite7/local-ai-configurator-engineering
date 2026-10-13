import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer, preview } from "vite";
import { EMPTY_SELECTION } from "../lib/local-setup-selection.ts";

const root = resolve(import.meta.dirname,"..");
const forbidden = /Adolph|MGV|AI Workroom|Ask the Team|hasWorkroomAccess|workroomTransferOwner|TRANSFER_KEY|parseTransfer|appgprj_|appgdep_|\/conversation[?"/]|\/consultation|\/meeting-history/i;
function files(path) {
  return readdirSync(path).flatMap(name => {
    if (["node_modules",".git",".vite"].includes(name)) return [];
    const file=resolve(path,name);
    return statSync(file).isDirectory() ? files(file) : [file];
  });
}
const deploymentFiles = files(resolve(root,"dist"));
for (const file of deploymentFiles) assert.ok(!forbidden.test(readFileSync(file,"utf8")),`Excluded public identity/seam in ${file}`);
assert.ok(deploymentFiles.every(file=>!file.endsWith(".map")),"No source maps in deployment");
const source=readFileSync(resolve(root,"content/local-model-design-brief.md"),"utf8").replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/,"").trim();
assert.equal(readFileSync(resolve(root,"dist/local-models/design-brief/download"),"utf8"),source);
const css=readFileSync(resolve(root,"app/local-models.css"),"utf8");
// Collapse is screen-only; normal block bodies remain printable without changing CSS.
assert.ok(/@media screen\{\.guide-step-body\.is-collapsed\{display:none\}/.test(css),"Collapse remains screen-only");
assert.ok(/@media print\{[\s\S]*\.guide-step-body\[hidden\]\{display:block!important\}/.test(css),"Existing complete-print rules retained");

const server=await createServer({root,configLoader:"runner",configFile:resolve(root,"vite.config.ts"),server:{middlewareMode:true,hmr:{host:"127.0.0.1",port:0},watch:null}});
try {
  const {default:App}=await server.ssrLoadModule("/App.tsx");
  for (const path of ["/","/local-models"]){
    globalThis.window={location:{pathname:path}};
    const html=renderToStaticMarkup(createElement(App));
    assert.match(html,/Start with my computer/);
    assert.match(html,/Help me choose a setup/);
    assert.match(html,/Still needed:/);
    assert.doesNotMatch(html,/JoinForm|sign.in|Ask the Team|MGV/);
  }
  globalThis.window={location:{pathname:"/local-models/design-brief"}};
  const brief=renderToStaticMarkup(createElement(App));
  assert.match(brief,/Design Brief/);
  assert.match(brief,/October 10, 2026/);
  assert.match(brief,/Download README/);
  assert.doesNotMatch(brief,/hasWorkroomAccess|Ask the Team/);
  const {default:Runbook}=await server.ssrLoadModule("/app/local-models/runbook.tsx");
  const selection={...EMPTY_SELECTION,platform:"mac",platformKnown:true,goalChosen:true,ram:16,modelId:"qwen8"};
  const guide=renderToStaticMarkup(createElement(Runbook,{selection,generation:{current:{value:0,copying:false}}}));
  assert.match(guide,/ollama pull qwen3:8b-q4_K_M/);
  assert.match(guide,/Print complete plan/);
  assert.match(guide,/Copy troubleshooting details/);
  assert.match(guide,/Download troubleshooting details/);
  assert.match(guide,/guide-step-body is-collapsed/);
  assert.doesNotMatch(guide,/\/conversation|Ask the Team|owner=/);
} finally { delete globalThis.window; await server.close(); }

const staticServer=await preview({root,configLoader:"runner",configFile:resolve(root,"vite.config.ts"),preview:{host:"127.0.0.1",port:0,open:false}});
try {
  const address=staticServer.httpServer.address();
  const base=`http://127.0.0.1:${address.port}`;
  for (const path of ["/","/local-models","/local-models/design-brief"]){
    const response=await fetch(base+path);
    assert.equal(response.status,200,path);
    assert.equal(response.headers.get("set-cookie"),null);
    assert.match(await response.text(),/Local Model Guide/);
  }
  const response=await fetch(base+"/local-models/design-brief/download");
  assert.equal(response.status,200);
  assert.match(response.headers.get("content-type"),/text\/markdown/);
  assert.match(response.headers.get("content-disposition"),/attachment/);
  assert.equal(await response.text(),source);
} finally { await new Promise((ok,bad)=>staticServer.httpServer.close(error=>error?bad(error):ok())); }
console.log(JSON.stringify({deploymentFiles:deploymentFiles.length,publicBoundary:"PASS",canonicalDownload:"PASS",anonymousHttpRoutes:4,serverRenderedPages:3,collapsedRunbookMarkup:"PASS",printRule:"PASS",browserVisualAcceptance:"NOT_RUN"},null,2));
