import { normalizeInput, type NormalizeInputFailure } from "./normalize-input";
import { chunkText, type ChunkTextOptions } from "./chunk-text";
import { findExplanations } from "./find-explanations";
import { validateResult } from "./validate-result";
import { locateTerms, type LocatedTerm } from "./locate-terms";
import { resolveConflicts } from "./resolve-conflicts";

export interface AnalyzeTextSuccess {
  ok: true;
  text: string;
  annotations: LocatedTerm[];
}

export type AnalyzeTextResult = AnalyzeTextSuccess | NormalizeInputFailure;

export async function analyzeText(
  raw: string,
  chunkOptions?: ChunkTextOptions,
): Promise<AnalyzeTextResult> {
  // 1. Normalize input
  const normalized = normalizeInput(raw);
  if (!normalized.ok) return normalized;

  const { text } = normalized;

  // 2. Chunk text
  const chunks = chunkText(text, chunkOptions);

  // 3. Find explanations (sequential to respect free-tier rate limits)
  const results = [];
  for (const chunk of chunks) {
    console.log("chunk", chunk);
    results.push(await findExplanations(chunk));
  }

  // 4. Validate & clean each result, then merge terms
  const allTerms = results.flatMap((r) => validateResult(r).terms);

  // 5. Locate terms in the original text
  const located = locateTerms(text, allTerms);

  // 6. Resolve conflicts
  const annotations = resolveConflicts(located);

  return { ok: true, text, annotations };
}
