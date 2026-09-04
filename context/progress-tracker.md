# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

Feature 08: Resolve conflicts (complete)

## Current Goal

Awaiting next feature

## In Progress

- (nothing active)

## Completed

- 08-resolve-conflicts — `lib/resolve-conflicts.ts` removes overlapping spans (prefers longer phrase, then earliest start), caps annotations at 50, and sorts by `start` for stable rendering.
- 07-add-explanations — `lib/locate-terms.ts` finds each validated term in the original text via case-insensitive search, produces `start`/`end` offsets from the first occurrence, skips terms not found, and never trusts model-provided offsets.
- 06-validate — `lib/validate-result.ts` parses and validates AI JSON against the contract, drops items with missing/empty `term` or `explanation`, enforces a 300-char max explanation length, and deduplicates identical terms (case-insensitive).
- 05-find-text-and-explanations — `lib/find-explanations.ts` calls `z-ai/glm-5.2:free` via OpenRouter with a JSON schema (`lib/explain-terms-schema.json`) to identify terms worth explaining and return `{ terms: [{ term, explanation }] }`. Does not return HTML or offsets.
- 04-chunks — `lib/chunk-text.ts` splits long text at paragraph or sentence boundaries where possible, enforces a configurable chunk-size limit, and overlaps adjacent chunks to preserve nearby context.
- 03-normalize-input — `lib/normalize-input.ts` trims whitespace, normalizes `\r\n`/`\r` to `\n`, rejects empty input, enforces a 10,000 character max, and rejects known prompt-injection patterns. The form calls it on submit and shows the error message when validation fails.
- 02-layout — `components/form.tsx` at page top with dark-gray textarea (`paste your text...`), green Explain text button, loading spinner, and annotated output with green underlined terms + hover tooltips. Dark mode + green accents in `globals.css`.
