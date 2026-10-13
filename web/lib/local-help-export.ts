import { missingFacts, validSelection, type Selection } from "./local-setup-selection.ts";
import { helpDraft } from "./local-setup-runbook.ts";

// Regenerate from allowlisted selection/step; no stored prose or private transfer.
export function localHelpExport(selection: Selection, step: string) {
  if (!validSelection(selection) || missingFacts(selection).length) return null;
  const draft = helpDraft(selection, step);
  if (!draft) return null;
  return { ...draft, filename: "local-model-guide-troubleshooting.txt" };
}
