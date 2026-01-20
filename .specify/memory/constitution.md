<!--
Sync Impact Report

- Version change: unversioned-template -> 1.0.0
- Modified principles: placeholder template -> GigIt core principles (15)
- Added sections: Architecture & Service Boundaries; Delivery Workflow & Quality Gates
- Removed sections: none
- Templates requiring updates:
  - ✅ updated `.specify/templates/plan-template.md`
  - ✅ updated `.specify/templates/spec-template.md`
  - ✅ updated `.specify/templates/tasks-template.md`
- Deferred / TODOs: none
-->

# GigIt Constitution

## Core Principles

### 1. Real-world workflows first

All features MUST map to real production workflows used by touring and warehouse
teams. Avoid abstract designs that do not reflect how crews actually prep, load,
build, and tour shows.

Rationale: A production tool that does not match crew workflows will not be used.

### 2. Job-centric permission model

All operational data MUST be scoped to Jobs (Projects).

- Users MUST only see Jobs they are assigned to unless they are Admin/PM.
- Permissions MUST be enforced at the API level, not only in the UI.
- Roles determine capabilities per Job.

Rationale: Access in production follows the show/job and the crew call.

### 3. Separation of concerns by service, not by repo

The project is a monorepo, but runtime responsibilities are separate:

- Web App (Vite + React): UI only.
- API Service (Node): business logic, permissions, DB access, file signing, PDF
  jobs.
- Database: Postgres via Drizzle.
- Auth: AWS Cognito.

Do not mix database logic or secret-handling logic into the frontend.

### 4. Database is source of truth for business logic

Cognito handles identity only. All business rules MUST live in Postgres:

- Roles
- Job assignments
- Permissions
- Templates
- Documents metadata
- Audit logs

Cognito Groups MAY be used for coarse access but MUST NOT replace DB
authorization.

### 5. Type safety and schema consistency

All data flowing between frontend and backend MUST be validated.

- Drizzle defines DB schema.
- Zod defines API request/response schemas.
- Shared types live in packages/shared when appropriate.
- Never trust raw client input without validation.

### 6. Migrations and version control are mandatory

All database changes MUST be made via migrations. No manual schema edits in
production environments.

The system MUST be deployable from scratch using only:

- Git repo
- Environment variables
- Migration scripts

### 7. PDF and export outputs are first-class features

Paperwork quality is a core product requirement.

- Exports MUST be reproducible.
- Exports MUST be template-driven.
- Exports MUST support branding and job metadata.
- Export rendering MUST be consistent across machines.
- Export logic MUST live in backend services or workers, not in the browser.

### 8. File storage is object storage, not database

All uploaded files MUST be stored in S3 or equivalent object storage.

Database stores only:

- Metadata
- Ownership
- Permissions
- Version references

Frontend MUST access files via signed URLs only.

### 9. Design for offline-ish workflows

Users may be in warehouses or venues with unstable internet.

- UI SHOULD cache job data where reasonable.
- UI MUST fail gracefully.
- Basic workflows MUST NOT require constant websocket connectivity.

### 10. Security over convenience

This is a professional production system handling commercial data.

- JWTs MUST be verified on every API request.
- No secrets in frontend builds.
- All admin operations MUST be server-side gated.
- Never bypass auth or permission checks for speed of development.

### 11. Iterative MVP-first development

Build vertically, not horizontally.

Preferred development sequence:

Auth -> Users -> Jobs -> Assignments -> One paperwork feature -> Export

Avoid building large generic systems before at least one real workflow is usable
end-to-end.

### 12. Extensibility over hard-coded logic

Where possible, prefer configuration tables, templates, and metadata-driven
behavior. Avoid hard-coding business rules that are likely to vary by company or
show type.

### 13. Code quality and maintainability

This is not a prototype.

- TypeScript everywhere.
- Meaningful function and variable names.
- Clear folder boundaries.
- No giant god files.

If a feature becomes complex, refactor rather than stack hacks.

### 14. Developer experience matters

Local development MUST be simple.

- One command to start DB.
- One command to start API.
- One command to start Web.

If setup becomes painful, improve tooling rather than ignoring it.

### 15. Document decisions

When architectural or workflow decisions are made:

- Record them in docs or comments.
- Prefer small ADR-style notes over memory.

## Architecture & Service Boundaries

- The Web App is UI only and MUST call the API for any privileged operation.
- The API Service is the only runtime component that may:
  - validate JWTs
  - decide job-scoped permissions
  - access Postgres
  - sign file URLs
  - generate PDFs/exports
- Object storage is mandatory for files; the DB stores references and
  permissions.

Compliance expectation: any new feature that introduces data MUST define its Job
scope, permission checks, validation schema, and migration plan.

## Delivery Workflow & Quality Gates

- Feature work MUST be spec-driven for user-visible behavior.
- Authorization and permissions MUST be tested at the API boundary.
- DB changes MUST include migrations and rollback considerations.
- Exports SHOULD have reproducible rendering tests when feasible.
- Security-sensitive changes MUST include a clear review plan.

## Governance

This constitution supersedes all other practices.

### Amendment process

- Amendments MUST be proposed as a PR updating this file.
- The PR MUST include rationale and impact.
- Approval requires Admin/PM (or designated maintainers).

### Versioning policy

- Semantic versioning is used for governance:
  - MAJOR: backward-incompatible governance changes (principle removal or
    redefinition)
  - MINOR: new principle/section added or materially expanded guidance
  - PATCH: clarifications, wording, typo fixes, non-semantic refinements

### Compliance review expectations

- Every plan/spec MUST include a constitution check.
- PRs touching auth, permissions, migrations, exports, or file access MUST
  include automated tests covering the change.

**Version**: 1.0.0 | **Ratified**: 2026-01-20 | **Last Amended**: 2026-01-20
