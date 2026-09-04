### 3. Identify terms + write explanations — AI

write a function that:

- Decide which words or concepts are worth explaining
- Return a short explanation for each term
- Prefer multi-word concepts when that is the meaningful unit (e.g. "machine learning" over "machine")
-use z-ai/glm-5.2:free model
- define response schema in separate json file

Do **not** ask the AI to:

- Return marked-up HTML
- Return `start` / `end` offsets
- Rewrite the original text