# Local AI Configurator — engineering showcase

An interactive React and TypeScript application that turns a person’s hardware, intended work, and model choice into an explainable setup plan. The same selected configuration drives memory estimates, installation instructions, troubleshooting exports, and a personal trial sheet.

**Created and owned by Adolph White Jr.** This project is developed with AI-assisted engineering. My work spans the product requirements, architecture and workflow decisions, implementation direction, and review of the resulting behavior. It is under continuing development, with the runnable planning interface and its source available here for inspection.

## What to inspect

| Engineering decision | Implementation | Why it matters |
|---|---|---|
| One effective configuration | [`local-setup-selection.ts`](web/lib/local-setup-selection.ts) | Sizing, commands, exports, and printing agree on the current choice. Hardware-shopping mode clears hidden equipment assumptions. |
| Explainable capacity planning | [`local-model-planner.ts`](web/lib/local-model-planner.ts) | Separates model weights, context cache, runtime allowance, RAM, and VRAM; ties catalog entries to sources. |
| Instructions generated from state | [`local-setup-runbook.ts`](web/lib/local-setup-runbook.ts) | Produces platform-specific setup steps, expected results, and recovery instructions. Custom sizing scenarios do not invent installable model tags. |
| Reviewable goal interpretation | [`local-trial.ts`](web/lib/local-trial.ts), [`trial.tsx`](web/app/local-models/trial.tsx) | Phrase rules propose editable choices with Apply/Undo. Stale suggestions cannot overwrite a newer configuration. |
| Export with explicit boundaries | [`local-help-export.ts`](web/lib/local-help-export.ts) | Rebuilds troubleshooting details from validated, allowed fields and the selected step. The user controls local copying and download. |
| A canonical Design Brief | [`design-brief.ts`](web/lib/design-brief.ts), [`vite.config.ts`](web/vite.config.ts) | One Markdown source feeds both the readable document and its downloadable form. |

The application uses React 19, TypeScript, and Vite. It operates without an account or application backend. Trial notes remain in page memory; a first-visit presentation marker uses browser local storage. Model execution occurs separately on the user’s computer: this interface generates guidance and records manually entered trial outcomes. Its current planning engine is deterministic; learned prediction and measured model execution are continuing development areas.

## Run the interface

From a terminal, with Git and Node.js 22.13 or newer installed:

```sh
git clone https://github.com/adolphwhite7/local-ai-configurator-engineering.git
cd local-ai-configurator-engineering/web
npm ci --ignore-scripts --no-audit --no-fund
npm run dev
```

Open the localhost URL printed by Vite, normally `http://127.0.0.1:5173`. No account, API key, or model download is needed to explore the interface. The **Start with my computer** route uses known equipment; **Help me choose a setup** compares hardware possibilities. Select a platform, memory, and intended work, then inspect the recommendation and generated setup plan. The buttons for downloading a trial sheet or troubleshooting details save local text files. Printing uses the complete current plan.

A static production build is also available:

```sh
npm run build
npm run preview
```

Open the preview URL printed by Vite. The generated `dist/` directory contains the static frontend. See the [web README](web/README.md) for route handling when hosting it.

## A five-minute source walkthrough

1. Start with `effectiveInput` in [`local-setup-selection.ts`](web/lib/local-setup-selection.ts). Follow its output into `planLocalSetup` and the generated runbook. This is the central consistency boundary.
2. Read `estimateMemory` in [`local-model-planner.ts`](web/lib/local-model-planner.ts). Note the separate physical memory pools and explicit planning assumptions.
3. Read `applyIntent` and `normalizeSelection` in [`local-trial.ts`](web/lib/local-trial.ts). They preserve explicit choices, reject stale revisions, and normalize incompatible selections.
4. Inspect [`local-model-planner.test.mjs`](web/tests/local-model-planner.test.mjs) and [`local-setup-runbook.test.mjs`](web/tests/local-setup-runbook.test.mjs) for concrete edge cases, then run the checks below.
5. Open the interface, change the selected model or context length, and observe how setup instructions and trial context follow that change.

## Verification

From the repository’s `web` directory:

```sh
npm run typecheck
npm run build
npm run check:baseline
```

The baseline check serves the actual build on temporary loopback ports. It checks anonymous routes, the rendered configuration and runbook, complete-print rules, and exact agreement between the canonical document and its download. It also checks that the public build excludes internal integration routes. These checks establish frontend packaging and those selected behaviors; model execution is separate.

The existing unit tests are runnable with `npm test`, or individually with `node --experimental-strip-types --test tests/<test-file>.test.mjs`. They cover planner calculations, runbook branches, selection/trial transitions, document rendering, and troubleshooting exports. See [web/README.md](web/README.md) for the optional isolated browser workflow check.

## Development and ownership

This repository contains the runnable frontend, its tests, and its design document. It is an employer-facing source snapshot of a project under active development. Adolph White Jr. owns the original application source. Public availability is for inspection; this repository does not add an open-source license. Dependencies and referenced tools retain their own licenses; see [third-party notes](THIRD_PARTY.md).
