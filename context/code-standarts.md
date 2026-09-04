# Code Standards

## General

- Keep modules focused and responsible for a single purpose.
- Solve issues at the root instead of adding workarounds.
- Avoid combining unrelated responsibilities within the same component or route.
- Follow the architectural boundaries described in `architecture-context.md`.

## TypeScript

- Enable and maintain strict mode across the entire project.
- Avoid using `any`; prefer explicit interfaces or narrowly defined types.
- Treat all external input as untrusted and validate it at system boundaries.
- Prefer `interface` when defining object contracts.

## Next.js

- Use React Server Components by default.
- Only add `"use client"` when browser APIs, React hooks, or client-side interactivity are required.
- Keep each route handler limited to a single responsibility.
- Offload long-running operations to background jobs instead of request handlers.

## Styling

- Use the CSS custom property tokens defined in `globals.css`; avoid raw Tailwind color classes (such as `zinc-*`) and hardcoded hex values.
- Access design tokens through Tailwind utilities like `bg-base`, `text-copy-primary`, `border-surface-border`, and `text-brand`.
- Follow the established border radius scale: `rounded-xl` for smaller elements, `rounded-2xl` for cards, and `rounded-3xl` for modals.

## API Routes

- Parse and validate request data before executing business logic.
- Verify authentication and project ownership before performing mutations.
- Return responses with a consistent and predictable structure.
- Keep route handlers lightweight by moving complex logic into shared modules or background tasks.

## Data and Storage

- Store project metadata and relationships in PostgreSQL using Prisma.
- Save canvas snapshots and generated specifications in Vercel Blob, with Prisma storing only the Blob URL.
- Avoid persisting large generated payloads directly in the database.
- Treat task runs as first-class relational records, and always verify ownership and run IDs before issuing tokens.

## File Organization

- `lib/` — shared infrastructure,helpers, and common utilities.
- `components/` — UI composition only; business logic should live elsewhere.
- Name files according to their responsibility rather than the technology they use.