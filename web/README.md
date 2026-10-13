# Local AI Configurator frontend

A standalone React, TypeScript, and Vite application for local AI setup planning. Adolph White Jr. owns the original application source. See the [project overview](../README.md) for the architecture and a source walkthrough.

## Develop and verify

Starting from this repository’s root directory in a terminal with Node.js 22.13 or newer and npm installed:

```sh
cd web
npm ci --ignore-scripts --no-audit --no-fund
npm run typecheck
npm run build
npm run check:baseline
npm run dev
```

Open the URL printed by Vite. `npm run preview` serves the built frontend. `npm test` runs the existing unit suite; individual files can be run with `node --experimental-strip-types --test tests/<test-file>.test.mjs`.

`check:baseline` requires a built app and starts temporary loopback servers. It verifies anonymous routes, rendered setup instructions, exclusion of internal integrations, canonical document downloads, and complete-print behavior. It does not run a local language model.

## Optional isolated browser workflow check

`scripts/check-prototype-browser.mjs` exercises the actual interface with an installed Puppeteer module and Chrome executable. Before running it, set `LOCAL_GUIDE_PUPPETEER_MODULE` to the full path of the installed Puppeteer module file and `LOCAL_GUIDE_CHROME` to the full path of the Chrome executable. Then, from this `web` directory, run:

```sh
npm run build
node scripts/check-prototype-browser.mjs
```

It creates a separate browser profile, serves the app on loopback, checks selection and candidate changes, stale-result handling, actual local downloads, and print behavior, then closes the browser and server. Screenshots, PDF and results are written to ignored `verification/`; the temporary profile is also ignored. No personal browser session is used. Missing module or executable inputs fail before browser creation.

## Routes

- `/` and `/local-models`: configurator.
- `/local-models/design-brief`: rendered canonical document.
- `/local-models/design-brief/download`: equivalent Markdown download.

Static hosting must serve assets and the extensionless download before the app fallback, preserve deep links, and return the Markdown content type and attachment header for the download. Vite’s development and preview servers implement this behavior in [`vite.config.ts`](vite.config.ts).

Trial notes remain in page memory and exports are user-controlled local files. A presentation-only first-visit marker uses local storage. The rule-based planner and reviewed phrase suggestions do not make trained-model predictions. Generated runbook commands are instructions for a separate model runtime, and model inference is not initiated by this application.
