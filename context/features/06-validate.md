### 4. Validate & clean AI result — programmatic

write a function that:

- Parse and validate JSON against the contract
- Drop items with missing/empty `term` or `explanation`
- Enforce max explanation length
- Deduplicate identical terms (case-insensitive unless meaning requires otherwise)