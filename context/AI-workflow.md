# Development Workflow

## Approach

Develop the project incrementally using a specification-driven workflow. The context files define the intended functionality, implementation approach, and current progress. Follow these specifications during implementation rather than making assumptions or introducing undefined behavior.

## Scoping Rules

- Focus on a single feature or subsystem at a time.
- Favor small, testable iterations instead of large, speculative changes.
- Keep implementation steps within a single system boundary whenever possible.

## When to Split Work

Break work into separate tasks if it includes:

- UI updates alongside background task implementation
- Real-time canvas state management together with database persistence
- Multiple unrelated API endpoints
- Functionality that is not clearly specified in the context files

If a change cannot be verified end to end within a reasonable scope, divide it into smaller implementation steps.

## Handling Missing Requirements

- Do not introduce product behavior that is not documented in the context files.
- If a requirement is unclear, clarify it in the appropriate context file before writing code.
- If a requirement is missing, record it as an open question in `progress-tracker.md` before proceeding.

## Protected Foundation Components

Do not modify generated third-party foundation components unless the task explicitly requires it.

This includes:

- `components/ui/*` (shadcn/ui components)
- Internal code of third-party libraries

Keep these components reusable and close to their original implementation.

Apply project-specific styling, layouts, and business logic in application-level components rather than altering foundation components.

Only update these files when explicitly instructed to do so.

## Keeping Documentation Up to Date

Whenever implementation changes affect the project, update the relevant context files accordingly.

This includes changes to:

- System architecture or boundaries
- Storage model decisions
- Coding standards or conventions
- Feature scope

Ensure that the documented progress always matches the actual implementation rather than planned work.

## Before Moving to the Next Unit

1. Verify that the current unit functions correctly within its defined scope.
2. Confirm that no architectural invariant from `architecture-context.md` has been violated.
3. Update `progress-tracker.md` to accurately reflect the completed implementation.