# Development Workflow

## Stack

| Layer            | Technology              | Role                                                           |
| ---------------- | ----------------------- | -------------------------------------------------------------- |
| Framework        | Next.js 16 + TypeScript | Full-stack app with server/client boundaries                   |
| UI               | Tailwind + shadcn/ui    | Component composition and styling                              |                            |
| Background tasks | Trigger.dev             | Durable AI generation workflows                                |


## Approach

Implement the project incrementally using a specification-first workflow. The context files define the expected behavior, implementation details, and current progress. Treat them as the source of truth rather than making assumptions or creating new behavior.

## Scoping Rules

- Complete one feature or subsystem before moving to the next.
- Prefer small, easy-to-verify changes over large implementation batches.
- Keep each implementation step focused on a single system boundary.

## When to Split Work

Separate work into smaller tasks when it involves:

- UI changes together with background processing
- Real-time canvas logic and database persistence
- Multiple independent API routes
- Features that are not fully defined in the context files

If an implementation cannot be validated end to end without excessive effort, reduce its scope before continuing.

## Handling Missing Requirements

- Never assume behavior that is not documented in the context files.
- Resolve ambiguous requirements by updating the appropriate context file before implementation.
- Record missing requirements as open questions in `progress-tracker.md` before proceeding.

## Protected Foundation Components

Avoid modifying generated third-party foundation components unless a task explicitly requires it.

This applies to:

- `components/ui/*` (shadcn/ui components)
- Third-party library source code or internals

Treat these components as reusable building blocks.

Implement application-specific styling, layouts, and business logic within your own components instead of changing foundation components.

Only edit these files when explicitly instructed.

## Keeping Documentation in Sync

Whenever implementation affects the project's design or behavior, update the appropriate context files.

This includes changes to:

- System architecture or boundaries
- Storage and data model decisions
- Development standards or conventions
- Feature scope

Documentation should always reflect the current implementation, not future plans.

## Before Moving to the Next Unit

1. Ensure the current unit works correctly within its intended scope.
2. Verify that all architectural constraints defined in `architecture-context.md` remain intact.
3. Update `progress-tracker.md` so it accurately represents the completed work.