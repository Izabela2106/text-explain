import type { ExplainResult, ExplainTerm } from "./find-explanations";

const MAX_EXPLANATION_LENGTH = 300;

/**
 * Validate and clean an AI-returned ExplainResult:
 * - Parse and validate JSON against the contract
 * - Drop items with missing/empty term or explanation
 * - Enforce max explanation length
 * - Deduplicate identical terms (case-insensitive)
 */
export function validateResult(raw: unknown): ExplainResult {
  if (
    raw === null ||
    typeof raw !== "object" ||
    !("terms" in raw) ||
    !Array.isArray((raw as Record<string, unknown>).terms)
  ) {
    return { terms: [] };
  }

  const seen = new Set<string>();
  const cleaned: ExplainTerm[] = [];

  for (const item of (raw as { terms: unknown[] }).terms) {
    if (item === null || typeof item !== "object") continue;

    const { term, explanation } = item as Record<string, unknown>;

    if (typeof term !== "string" || typeof explanation !== "string") continue;

    const trimmedTerm = term.trim();
    const trimmedExplanation = explanation.trim();

    if (!trimmedTerm || !trimmedExplanation) continue;

    const key = trimmedTerm.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    cleaned.push({
      term: trimmedTerm,
      explanation:
        trimmedExplanation.length > MAX_EXPLANATION_LENGTH
          ? trimmedExplanation.slice(0, MAX_EXPLANATION_LENGTH) + "…"
          : trimmedExplanation,
    });
  }

  return { terms: cleaned };
}
