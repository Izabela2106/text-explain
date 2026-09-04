import type { ExplainTerm } from "./find-explanations";

export interface LocatedTerm {
  term: string;
  explanation: string;
  start: number;
  end: number;
}

/**
 * Find each term in the original text and produce start/end offsets.
 * Never trusts model-provided offsets — always searches the original string.
 * Prefers the first occurrence of each term. Skips terms not found.
 */
export function locateTerms(
  originalText: string,
  terms: ExplainTerm[],
): LocatedTerm[] {
  const results: LocatedTerm[] = [];

  for (const { term, explanation } of terms) {
    const index = originalText.toLowerCase().indexOf(term.toLowerCase());
    if (index === -1) continue;

    results.push({
      term: originalText.slice(index, index + term.length),
      explanation,
      start: index,
      end: index + term.length,
    });
  }

  return results;
}
