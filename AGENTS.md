# Project Guidance

## User Preferences

- Thai-language interface
- Everything in one app: post jobs, sell services, take on work
- Airtasker-style marketplace layout
- Clear navigation with dense, readable information on desktop and mobile

## Verified Commands

- **typecheck**: `pnpm -r --if-present run typecheck`
- **fix**: `pnpm -r --if-present run fix`
- **build**: `pnpm -r --if-present run build`

## Learnings

- Backend Blob fields surface as plain Uint8Array in generated frontend types; read files via File.arrayBuffer() and pass Uint8Array directly.
- UserRole/Category/JobStatus are value enums in the generated bindings — use enum members, not string literals.
- listOffersForJob is owner-only; non-owner participants resolve the accepted worker by matching job.acceptedOfferId against their own listMyOffers results.
- Gate owner-only queries with an { enabled } option rather than calling them unconditionally on shared detail pages.
- When a repair swaps a job-scoped collection for a cross-job collection, re-check every consumer's filter — per-job guards must filter by jobId explicitly.
- moc 2 treats unused imports as errors; remove them. Sibling type modules in lib/*.mo import as "../types/<name>".
- mo:core/Time.now() returns Int; wrap with Int.abs(...) when the Timestamp type is Nat.
- OQL auto-derivation fails for records with variant, nested-record, optional, or collection fields; use .toEntityManual with .payload/.flatten and ship value modules for option types.
- getApiDoc must live in its own mixin with a top-level mixin () block returning the Markdown literal directly.
- An identity-body migration is not needed and must be deleted; check-limit = 1 allows only one pending migration.
