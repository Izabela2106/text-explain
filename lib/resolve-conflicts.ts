import type { LocatedTerm } from "./locate-terms";

const MAX_ANNOTATIONS = 50;

/**
 * Resolve overlapping spans and prepare annotations for rendering:
 * - Remove overlapping spans (prefer longer phrase, then earliest start)
 * - Cap the number of annotations
 * - Sort by start offset for stable rendering
 */
export function resolveConflicts(terms: LocatedTerm[]): LocatedTerm[] {
  if (terms.length === 0) return [];

  // Sort by: longest span first, then earliest start as tiebreaker
  const sorted = [...terms].sort((a, b) => {
    const lenDiff = (b.end - b.start) - (a.end - a.start);
    if (lenDiff !== 0) return lenDiff;
    return a.start - b.start;
  });

  // Greedily pick non-overlapping spans, preferring longer phrases
  const picked: LocatedTerm[] = [];

  for (const candidate of sorted) {
    const overlaps = picked.some(
      (p) => candidate.start < p.end && candidate.end > p.start,
    );
    if (!overlaps) {
      picked.push(candidate);
    }
  }

  // Sort by start for stable rendering, then cap
  return picked
    .sort((a, b) => a.start - b.start)
    .slice(0, MAX_ANNOTATIONS);
}
