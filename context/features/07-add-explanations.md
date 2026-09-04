### 5. Locate terms in the original text — programmatic

Write function that:

- Find each term in the **exact** original string
- Produce `start` / `end` offsets from successful matches
- Skip terms that cannot be found in the original text
- Prefer first occurrence unless a later rule says otherwise

Never trust model-provided offsets; they drift.