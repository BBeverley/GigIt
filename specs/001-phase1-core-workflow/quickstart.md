# Quickstart: Phase 1 Core Workflow

**Branch**: `001-phase1-core-workflow`  
**Date**: 2026-01-20

This quickstart is a high-level guide for running and validating the Phase 1 workflow locally.

## What you can validate end-to-end

Use [`spec.md`](spec.md:1) as the behavioral source of truth.

1. Sign in
2. Create a Job (Admin/PM)
3. Assign crew (Admin/PM)
4. Upload Shared/Internal files (Admin/PM/Senior Tech)
5. Create/edit plug-up sheet rows (Admin/PM/Senior Tech)
6. Export plug-up sheet PDF (including Warehouse)
7. View/edit Job notes (Admin/PM/Senior Tech)

## Local run (conceptual)

### Prerequisites

- Node.js 20 LTS
- npm
- Docker Desktop (recommended) OR Postgres (local install)

### One-command dev

From repo root:

```sh
npm install
npm run dev
```

This starts:

- Backend on `http://localhost:3001`
- Frontend on `http://localhost:5173`

Health check:

```sh
curl http://localhost:3001/health
```

### Database + migrations

Start Postgres (Docker):

```sh
docker compose up -d postgres
```

Then run migrations:

```sh
npm --workspace backend run migrate
```

## Core checks

- Permission check: an unassigned user cannot access a Job by guessing an identifier.
- Visibility check: Warehouse can view Shared files and export PDFs, but cannot edit plug-up sheet.
- Internal files check: Warehouse/Technician cannot see Internal files.
- Uniqueness check: creating a Job with an existing reference is rejected.
