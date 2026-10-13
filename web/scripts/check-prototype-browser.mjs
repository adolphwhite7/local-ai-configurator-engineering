import assert from "node:assert/strict";
import { accessSync, constants, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { preview } from "vite";
import { pathToFileURL } from "node:url";

const puppeteerModule = process.env.LOCAL_GUIDE_PUPPETEER_MODULE;
const chrome = process.env.LOCAL_GUIDE_CHROME;
assert.ok(puppeteerModule, "Set LOCAL_GUIDE_PUPPETEER_MODULE to an installed Puppeteer module file");
assert.ok(chrome, "Set LOCAL_GUIDE_CHROME to an installed Chrome executable");
accessSync(puppeteerModule, constants.R_OK);
accessSync(chrome, constants.X_OK);
const { default: puppeteer } = await import(pathToFileURL(resolve(puppeteerModule)).href);

const root = resolve(import.meta.dirname, ".."), output = resolve(root, "verification");
mkdirSync(output, { recursive: true });
const server = await preview({ root, configLoader: "runner", configFile: resolve(root, "vite.config.ts"), preview: { host: "127.0.0.1", port: 0, open: false } });
const base = `http://127.0.0.1:${server.httpServer.address().port}`;
let browser;
const checks = [], requests = [], errors = [];
try {
  browser = await puppeteer.launch({ headless: true, executablePath: chrome, userDataDir: resolve(root, ".headless-profile"), args: ["--disable-background-networking", "--no-first-run", "--no-default-browser-check"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1365, height: 1000 });
  page.on("request", request => requests.push({ url: request.url(), method: request.method(), body: request.postData() || "" }));
  page.on("pageerror", error => errors.push(error.message));
  const text = () => page.evaluate(() => document.body.innerText);
  async function click(label) {
    const found = await page.evaluate(label => { const button = [...document.querySelectorAll("button, summary")].find(el => el.textContent.trim().startsWith(label)); if (!button) return false; button.click(); return true; }, label);
    assert.ok(found, `Find clickable ${label}`); await new Promise(ok => setTimeout(ok, 60));
  }
  async function select(label, value) {
    const found = await page.evaluate(({ label, value }) => { const parent = [...document.querySelectorAll("label")].find(el => el.textContent.trim().startsWith(label)); const input = parent?.querySelector("select"); if (!input) return false; input.value = value; input.dispatchEvent(new Event("change", { bubbles: true })); return true; }, { label, value });
    assert.ok(found, `Find select ${label}`); await new Promise(ok => setTimeout(ok, 60));
  }
  async function fill(label, value) {
    const found = await page.evaluate(({ label, value }) => { const parent = [...document.querySelectorAll("label")].find(el => el.textContent.trim().startsWith(label)); const input = parent?.querySelector("input:not([type=checkbox]),textarea"); if (!input) return false; const proto = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, "value").set.call(input, value); input.dispatchEvent(new Event("input", { bubbles: true })); return true; }, { label, value });
    assert.ok(found, `Find input ${label}`); await new Promise(ok => setTimeout(ok, 60));
  }
  async function snap(name, selector = "#configuration-result") {
    await page.evaluate(selector => { document.documentElement.style.scrollBehavior = "auto"; document.querySelector(selector)?.scrollIntoView({ block: "start", behavior: "instant" }); }, selector);
    await page.screenshot({ path: resolve(output, `${name}.png`) });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `No horizontal overflow: ${name}`);
  }
  await page.goto(base, { waitUntil: "networkidle0" });
  assert.match(await text(), /Still needed:/); await snap("desktop-header", ".local-header"); await snap("desktop-start", ".trial-direction");
  const headerColors = await page.evaluate(() => ({ foreground: getComputedStyle(document.querySelector(".folio-wordmark")).color, background: getComputedStyle(document.querySelector(".folio-header")).backgroundColor }));
  const luminance = color => color.match(/\d+/g).slice(0, 3).map(n => Number(n) / 255).map(n => n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4).reduce((sum, n, i) => sum + n * [.2126, .7152, .0722][i], 0);
  const values = [luminance(headerColors.foreground), luminance(headerColors.background)].sort((a,b) => b-a);
  const headerContrast = (values[0] + .05) / (values[1] + .05);
  assert.ok(headerContrast >= 4.5); checks.push(`Actual header link contrast ${headerContrast.toFixed(2)}:1; corrected default-blue inheritance`);
  await click("Choose a task or describe your goal");
  await fill("Describe your goal", "Search scanned PDFs by voice, not code PRIVATE_GOAL_938");
  await click("Review suggestions");
  assert.match(await text(), /Negation detected/);
  assert.equal(await page.evaluate(() => JSON.stringify(localStorage).includes("PRIVATE_GOAL_938") || JSON.stringify(sessionStorage).includes("PRIVATE_GOAL_938") || location.href.includes("PRIVATE_GOAL_938")), false);
  assert.match(await text(), /Still needed:/);
  await select("Computer platform", "mac");
  assert.equal(await page.$eval(".trial-draft button", button => button.disabled), true);
  await select("Unified memory", "24");
  await click("Review suggestions");
  // Confirm removing the negated code match, preserving the documents task.
  await page.evaluate(() => { const field = document.querySelector(".trial-draft"); [...field.querySelectorAll("label")].find(label => label.textContent.trim() === "Explain or repair code").querySelector("input").click(); });
  await click("Apply reviewed choices");
  assert.match(await text(), /What you’ll also need/); assert.match(await text(), /whisper.cpp installation/);
  await snap("desktop-mixed-goal");
  await select("Model", "qwen8");
  await fill("Representative task 1", "My own function with empty-input and negative-value edge cases");
  await select("Observed outcome for the current model", "Pass");
  await click("Adjust context"); await select("Context length", "8192");
  assert.equal(await page.evaluate(() => [...document.querySelectorAll(".trial-example select")].every(select => select.value === "")), true);
  await click("Use Qwen 3.5 · 9B");
  assert.match(await text(), /4,096 context tokens/);
  await click("Show all steps");
  assert.match(await text(), /ollama pull qwen3.5:9b/);
  await snap("desktop-candidate-setup", "#setup-guide");
  const client = await page.createCDPSession(); await client.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: output });
  await click("Download personal trial sheet");
  await new Promise(ok => setTimeout(ok, 150));
  const downloaded = readFileSync(resolve(output, "personal-local-model-trial.txt"), "utf8");
  assert.match(downloaded, /qwen3.5:9b/); assert.match(downloaded, /My own function/); assert.match(downloaded, /not run/); assert.doesNotMatch(downloaded, /PRIVATE_GOAL_938/);
  checks.push("mixed/negated confirmation; stale draft blocked; current model/context/serial setup continuity; outcome invalidation; actual local file download");
  await click("Undo last Apply");
  assert.match(await text(), /Still needed:/); // restored original task-unselected snapshot
  await click("Help me choose a setup");
  await select("The work you want to do", "balanced");
  assert.match(await text(), /Before buying:/); assert.match(await text(), /hardware comparison, not confirmed equipment/);
  await snap("desktop-shopping"); checks.push("Undo restored prior selection; shopping route disregards hidden equipment");
  await select("Model", "custom"); assert.match(await text(), /Choose a named model to continue/); await snap("desktop-custom");
  await select("Model", "r1full"); assert.match(await text(), /Choose hardware that can hold this model/); await snap("desktop-capacity-blocked");
  checks.push("custom sizing has no invented tag; full R1 capacity block before download");
  await select("Model", "qwen8");
  await page.emulateMediaType("print");
  assert.equal(await page.evaluate(() => [...document.querySelectorAll(".guide-step-body")].every(body => getComputedStyle(body).display !== "none")), true);
  await page.pdf({ path: resolve(output, "current-plan-print.pdf"), format: "A4", printBackground: true });
  await page.emulateMediaType("screen"); checks.push("actual headless print PDF and all collapsed step bodies visible under print CSS");
  await page.setViewport({ width: 390, height: 844 }); await page.goto(base, { waitUntil: "networkidle0" });
  await click("Help me choose a setup"); await select("The work you want to do", "quick"); await select("Platform to explore", "windows");
  await snap("mobile-shopping");
  await click("Use Qwen 3 · 8B"); await snap("mobile-setup", "#setup-guide");
  await page.goto(base + "/local-models/design-brief", { waitUntil: "networkidle0" });
  assert.match(await text(), /October 10, 2026/); assert.match(await text(), /Test usefulness on your own work/);
  await snap("mobile-design-brief", ".brief-heading");
  assert.equal(await (await fetch(base + "/local-models/design-brief/download")).text(), readFileSync(resolve(root, "content/local-model-design-brief.md"), "utf8").replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim());
  checks.push("390px shopping/candidate/setup and Design Brief; canonical download equality");
  assert.ok(requests.every(request => request.url.startsWith(base) || request.url.startsWith("blob:")), "No outbound page requests");
  assert.ok(requests.every(request => !JSON.stringify(request).includes("PRIVATE_GOAL_938")), "Goal absent from requests");
  assert.deepEqual(errors, []);
  const result = { status: "PASS", checks, browser: await browser.version(), requests, errors, screenshots: 10, actualModelRuns: 0, privateBrowserUsed: false };
  writeFileSync(resolve(output, "browser-check-results.json"), JSON.stringify(result, null, 2)); console.log(JSON.stringify(result, null, 2));
} finally { if (browser) await browser.close(); await new Promise(ok => server.httpServer.close(ok)); }
