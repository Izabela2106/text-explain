# TextExplain

TextExplain takes a passage you paste in and returns the same text with hover tooltips on key words and concepts. A language model proposes terms worth explaining; the app then finds those phrases in the original text and draws underlined, hoverable annotations.

**Live demo:** [https://text-explain.vercel.app](https://text-explain.vercel.app)

## How it works

The home page is a form: paste text, click **Explain text**, and wait for an annotated copy of that text. Hover a highlighted phrase to read a short explanation.

Analysis runs on the server (a Next.js Server Action), not in the browser. The pipeline is:

1. **Normalize** - Trim the input, normalize line endings, reject empty text, cap length at 10,000 characters, and reject obvious prompt-injection patterns.
2. **Chunk** - Split long text at paragraph or sentence boundaries (about 5,000 characters per chunk, with a small overlap so terms near a split still have context).
3. **Find explanations** - For each chunk, call [OpenRouter](https://openrouter.ai/) with NVIDIA Nemotron 3 Ultra (`nvidia/nemotron-3-ultra-550b-a55b:free`). The model must return JSON of the form `{ "terms": [{ "term", "explanation" }] }`. Requests retry on HTTP 429; invalid JSON is repaired when possible, then retried.
4. **Validate** - Drop empty or duplicate terms, and truncate explanations that are too long.
5. **Locate** - Search the original string for each term (case-insensitive). Model-supplied offsets are never trusted.
6. **Resolve conflicts** - Prefer longer phrases when spans overlap, sort by position, and keep at most 50 annotations.

The client then renders the original text, wrapping located spans so a tooltip appears on hover.

```
Browser (form) → analyzeTextAction → normalize → chunk → OpenRouter
                                              → validate → locate → resolve
                                              → annotated text + tooltips
```

## Tech stack

| Area | Choice |
| --- | --- |
| App framework | [Next.js](https://nextjs.org/) 16 (App Router) |
| Language | TypeScript |
| UI | React 19, [Tailwind CSS](https://tailwindcss.com/) 4 |
| Fonts | Geist via `next/font` |
| LLM access | OpenRouter Chat Completions API (`fetch`) |
| Quality | ESLint (`eslint-config-next`) |

There is no database. State lives in the form until you submit; the server returns annotations for that request only.

### Project layout

- `app/` - Root layout, home page, global styles
- `components/form.tsx` - Paste field, submit, annotated result
- `lib/actions.ts` - Server Action entry point
- `lib/analyze-text.ts` - Orchestrates the pipeline
- `lib/normalize-input.ts`, `chunk-text.ts`, `find-explanations.ts`, `parse-model-json.ts`, `validate-result.ts`, `locate-terms.ts`, `resolve-conflicts.ts` - Pipeline steps
- `lib/explain-terms-schema.json` - JSON shape expected from the model

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` in the project root and add an [OpenRouter](https://openrouter.ai/) API key:

   ```bash
   OPENROUTER_API_KEY=your_key_here
   ```

3. Start the app:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

Production build:

```bash
npm run build
npm start
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
