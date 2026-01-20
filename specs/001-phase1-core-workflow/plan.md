# Implementation Plan: Phase 1 Core Workflow

**Branch**: `001-phase1-core-workflow` | **Date**: 2026-01-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-phase1-core-workflow/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command.

## Summary

Deliver a complete, Job-centric vertical slice for live event production teams:

- Users sign in and see the Jobs they can access
- Admin/PM can create Jobs and assign crew with job-scoped roles
- Job workspace provides tabbed sections (Overview / Crew / Files / Paperwork / Notes)
- Team can store Job files with two areas (Shared/Internal)
- Senior Tech/PM can maintain one core paperwork doc (Power & Data Plug-up Sheet)
- Users (including Warehouse) can export a reproducible, professional PDF
- Lightweight auditability: last edited + major activity events

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (Node.js 20 LTS)
**Primary Dependencies**: React (web app), Vite (web build), Node (API), Postgres (DB), Drizzle (schema/migrations), Zod (API validation)
**Storage**: Postgres for business data; S3 (or equivalent) for file objects; DB stores metadata only
**Testing**: Unit + integration + permission boundary tests (framework TBD; implement using the repo’s standard tooling)
**Target Platform**: Web app + API service
**Project Type**: Web application (frontend + backend)
**Performance Goals**:
- Job list and Job workspace loads feel fast in normal conditions (target: < 2 seconds perceived load after auth)
- PDF export completes quickly enough for real workflows (target: < 15 seconds for a 3-page export)
**Constraints**:
- No cross-Job data exposure is acceptable (permission checks on every request)
- Offline-ish UX: degrade gracefully under poor connectivity; no hard dependency on real-time connections
**Scale/Scope**:
- Phase 1 expects modest loads (tens to hundreds of concurrent users)
- Typical Job sizes: up to ~50 crew assignments; up to ~500 files metadata rows; plug-up sheet up to ~500 rows

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Use the constitution at `.specify/memory/constitution.md` as the source of truth.

### Required gates (GigIt)

- Job scope: all new operational data is scoped to a Job (Project)
- Authorization: permissions are enforced at the API (never UI-only)
- Identity vs business logic: Cognito is identity only; DB is business truth
- Validation: API requests/responses are validated (e.g., Zod)
- Migrations: DB changes include migrations; no manual production edits
- Files: uploads stored in object storage; browser uses signed URLs only
- Exports: PDF/export generation is backend/worker owned (not browser)
- Security: JWT verification and admin gating on every request
- Offline-ish UX: the feature fails gracefully under poor connectivity

**Gate evaluation (pre-design)**: PASS

Rationale:
- Spec is Job-scoped by design (Jobs, assignments, files, paperwork, notes, audit events are all Job-bound).
- API enforces authorization and JWT verification; UI is not trusted.
- File access uses signed URLs and object storage; PDF generation is backend-owned.
- Request/response validation and DB migrations are first-class requirements.

## Project Structure

### Documentation (this feature)

```text
specs/001-phase1-core-workflow/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# Web application (planned structure)
backend/
├── src/
│   ├── api/              # Route handlers/controllers
│   ├── auth/             # JWT verification + auth helpers
│   ├── db/               # Drizzle schema + migrations
│   ├── domain/           # Job/assignment/files/paperwork business rules
│   ├── exports/          # PDF/export generation
│   └── files/            # Signed URL + storage integration
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── routes/
│   └── api/              # API client + schemas
└── tests/

packages/
└── shared/
    ├── src/
    │   ├── schemas/      # Shared Zod schemas
    │   └── types/        # Shared types
    └── package.json
```

**Structure Decision**: Web application split into `backend/` and `frontend/` plus `packages/shared/`, consistent with the constitution’s service boundaries.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

**Post-design constitution check**: PASS (see [`research.md`](./research.md) + [`contracts/`](./contracts/) + [`data-model.md`](./data-model.md))

## Phase 0: Outline & Research (completed)

Outputs:

- [`research.md`](./research.md)

All Phase 0 decisions are resolved; no remaining `NEEDS CLARIFICATION` items block Phase 1 artifacts.

## Phase 1: Design & Contracts (completed)

Outputs:

- Data model: [`data-model.md`](./data-model.md)
- API contract: [`contracts/openapi.yaml`](./contracts/openapi.yaml)
- Quickstart: [`quickstart.md`](./quickstart.md)

### Design notes (high level)

- **Job-scoped authorization**: every API route that references a Job performs a permission check based on job role assignment (or Admin/PM global visibility).
- **Files**: object storage for file bytes; API provides signed URLs for upload/download; metadata lives in DB.
- **Exports**: PDF generation owned by backend/worker and is reproducible; export action creates an audit event.

### Agent context update (completed)

- Ran [`update-agent-context.ps1`](.specify/scripts/powershell/update-agent-context.ps1:1) for Roo context; updated [`specify-rules.md`](.roo/rules/specify-rules.md:1).
