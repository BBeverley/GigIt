---

description: "Task list for implementing Phase 1 Core Workflow"
---

# Tasks: Phase 1 Core Workflow

**Input**: Design documents from [`specs/001-phase1-core-workflow/`](specs/001-phase1-core-workflow:1)
**Prerequisites**: [`plan.md`](specs/001-phase1-core-workflow/plan.md:1), [`spec.md`](specs/001-phase1-core-workflow/spec.md:1), [`research.md`](specs/001-phase1-core-workflow/research.md:1), [`data-model.md`](specs/001-phase1-core-workflow/data-model.md:1), [`contracts/openapi.yaml`](specs/001-phase1-core-workflow/contracts/openapi.yaml:1)

**Tests**:

- Tests are REQUIRED for changes that touch auth, permissions, migrations, exports, or file access (per constitution).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create a runnable monorepo skeleton with a web app + API service + shared package.

- [x] T001 Create workspace root config in [`package.json`](package.json:1) (workspaces for `backend/`, `frontend/`, `packages/shared/`)
- [x] T002 Add root TypeScript config in [`tsconfig.base.json`](tsconfig.base.json:1) and reference it from package projects
- [x] T003 Create backend app package skeleton in [`backend/package.json`](backend/package.json:1) and [`backend/src/server.ts`](backend/src/server.ts:1)
- [x] T004 Create frontend app (React/Vite) skeleton in [`frontend/package.json`](frontend/package.json:1) and [`frontend/src/main.tsx`](frontend/src/main.tsx:1)
- [x] T005 Create shared package skeleton in [`packages/shared/package.json`](packages/shared/package.json:1) and [`packages/shared/src/index.ts`](packages/shared/src/index.ts:1)
- [x] T006 [P] Add environment templates in [`.env.example`](.env.example:1) and [`backend/.env.example`](backend/.env.example:1)
- [x] T007 [P] Add repo tooling scripts in [`package.json`](package.json:1) to start frontend+backend together (dev) and run lint/test
- [x] T008 [P] Add formatting/linting config in [`.eslintrc.cjs`](.eslintrc.cjs:1) and [`.prettierrc`](.prettierrc:1)
- [x] T009 Define a single local dev command and document concrete prerequisites + exact command(s) in [`specs/001-phase1-core-workflow/quickstart.md`](specs/001-phase1-core-workflow/quickstart.md:1) (update as scripts evolve)


---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infrastructure that MUST be complete before ANY user story can be implemented.

**Checkpoint**: API can boot, frontend can boot, auth is enforced on protected routes, DB/migrations framework exists.

- [x] T010 Add API health route in [`backend/src/api/health.ts`](backend/src/api/health.ts:1) and mount it from [`backend/src/api/index.ts`](backend/src/api/index.ts:1)
- [x] T011 Add versioned API routing (`/api/v1/...`) in [`backend/src/api/index.ts`](backend/src/api/index.ts:1)
- [x] T012 [P] Add API error handler middleware in [`backend/src/api/middleware/error.ts`](backend/src/api/middleware/error.ts:1)
- [x] T013 Add DB connection + migration wiring in [`backend/src/db/client.ts`](backend/src/db/client.ts:1) and [`backend/src/db/migrate.ts`](backend/src/db/migrate.ts:1)
- [x] T014 [P] Add baseline schema folder in [`backend/src/db/schema/`](backend/src/db/schema:1) (placeholder file [`backend/src/db/schema/index.ts`](backend/src/db/schema/index.ts:1))
- [x] T015 Implement JWT verification middleware in [`backend/src/auth/verifyJwt.ts`](backend/src/auth/verifyJwt.ts:1) and [`backend/src/api/middleware/auth.ts`](backend/src/api/middleware/auth.ts:1)
- [x] T016 Implement request context (`currentUser`) in [`backend/src/auth/requestContext.ts`](backend/src/auth/requestContext.ts:1)
- [x] T017 [P] Add shared ID and enum schemas in [`packages/shared/src/schemas/common.ts`](packages/shared/src/schemas/common.ts:1)
- [x] T018 [P] Implement API request/response validation helper in [`backend/src/api/middleware/validate.ts`](backend/src/api/middleware/validate.ts:1) and apply it in [`backend/src/api/index.ts`](backend/src/api/index.ts:1)
- [x] T019 [P] Create shared API request/response schema barrel in [`packages/shared/src/schemas/api/index.ts`](packages/shared/src/schemas/api/index.ts:1)
- [x] T020 [P] Add validation middleware unit tests in [`backend/tests/unit/api/validate.test.ts`](backend/tests/unit/api/validate.test.ts:1)
- [x] T021 [P] Create frontend API client wrapper in [`frontend/src/api/client.ts`](frontend/src/api/client.ts:1) (inject auth token)
- [x] T022 Create protected routing + app shell placeholders in [`frontend/src/routes/router.tsx`](frontend/src/routes/router.tsx:1) and [`frontend/src/components/AppShell.tsx`](frontend/src/components/AppShell.tsx:1)
- [x] T023 Add placeholder pages for My Jobs + Profile in [`frontend/src/pages/MyJobsPage.tsx`](frontend/src/pages/MyJobsPage.tsx:1) and [`frontend/src/pages/ProfilePage.tsx`](frontend/src/pages/ProfilePage.tsx:1)

### Required foundational tests

- [x] T024 [P] Add auth middleware unit tests in [`backend/tests/unit/auth/verifyJwt.test.ts`](backend/tests/unit/auth/verifyJwt.test.ts:1)
- [x] T025 Add protected endpoint integration test (401 without token) in [`backend/tests/integration/auth/protectedRoutes.test.ts`](backend/tests/integration/auth/protectedRoutes.test.ts:1)

---

## Phase 3: User Story 1 - Create a Job workspace and assign crew (Priority: P1) 🎯 MVP

**Goal**: Admin/PM can create Jobs and assign crew; users only see permitted Jobs; Job workspace navigation is Job-scoped and consistent.

**Independent Test**: Create a Job, assign 3 users, verify visibility rules; open Job workspace and see Overview + Crew + Notes placeholders.

### US1 Tests (auth/permissions/migrations required)

- [x] T026 [P] [US1] Add permission boundary integration tests for Job access in [`backend/tests/integration/jobs/access.test.ts`](backend/tests/integration/jobs/access.test.ts:1)
- [x] T027 [P] [US1] Add integration tests for Job CRUD permissions in [`backend/tests/integration/jobs/crud.test.ts`](backend/tests/integration/jobs/crud.test.ts:1)
- [x] T028 [P] [US1] Add integration tests for assignment management permissions in [`backend/tests/integration/assignments/permissions.test.ts`](backend/tests/integration/assignments/permissions.test.ts:1)

### US1 Implementation

#### Data model + migrations

- [x] T029 [US1] Create User table schema in [`backend/src/db/schema/users.ts`](backend/src/db/schema/users.ts:1)
- [x] T030 [US1] Create Job table schema (including unique `reference`, date-only start/end, and `status` = Draft/Active/Archived) in [`backend/src/db/schema/jobs.ts`](backend/src/db/schema/jobs.ts:1)
- [x] T031 [US1] Create JobRoleAssignment table schema in [`backend/src/db/schema/jobRoleAssignments.ts`](backend/src/db/schema/jobRoleAssignments.ts:1)
- [x] T032 [US1] Create JobNotes table schema in [`backend/src/db/schema/jobNotes.ts`](backend/src/db/schema/jobNotes.ts:1)
- [x] T033 [US1] Create AuditEvent table schema in [`backend/src/db/schema/auditEvents.ts`](backend/src/db/schema/auditEvents.ts:1)
- [x] T034 [US1] Wire schemas export barrel in [`backend/src/db/schema/index.ts`](backend/src/db/schema/index.ts:1)
- [x] T035 [US1] Add initial migration for US1 tables (including Job status default + unique reference) in [`backend/src/db/migrations/0001_us1_core.sql`](backend/src/db/migrations/0001_us1_core.sql:1)

#### Authorization helpers

- [x] T036 [P] [US1] Define role enums and helpers in [`backend/src/domain/auth/roles.ts`](backend/src/domain/auth/roles.ts:1)
- [x] T037 [P] [US1] Implement job permission checks in [`backend/src/domain/auth/jobPermissions.ts`](backend/src/domain/auth/jobPermissions.ts:1)

#### API: user provisioning + current user

- [x] T038 [US1] Implement user auto-provisioning on first request in [`backend/src/domain/users/provisionUser.ts`](backend/src/domain/users/provisionUser.ts:1)
- [x] T039 [US1] Define and apply request/response schemas for `GET /me` in [`packages/shared/src/schemas/api/index.ts`](packages/shared/src/schemas/api/index.ts:1) and validate in [`backend/src/api/me.ts`](backend/src/api/me.ts:1)

#### API: jobs

- [x] T040 [US1] Implement Jobs service (create/update/list/get) in [`backend/src/domain/jobs/jobsService.ts`](backend/src/domain/jobs/jobsService.ts:1) including: default hide Archived jobs + allow status filter
- [x] T041 [US1] Define and apply request/response schemas for Jobs endpoints in [`packages/shared/src/schemas/api/index.ts`](packages/shared/src/schemas/api/index.ts:1) and validate in [`backend/src/api/jobs.ts`](backend/src/api/jobs.ts:1)
- [x] T042 [US1] Add Jobs routes in [`backend/src/api/jobs.ts`](backend/src/api/jobs.ts:1) (maps to [`contracts/openapi.yaml`](specs/001-phase1-core-workflow/contracts/openapi.yaml:1) `/jobs` and `/jobs/{jobId}`)
- [x] T043 [US1] Enforce global visibility (Admin/PM) vs assigned-only list in [`backend/src/domain/jobs/jobsService.ts`](backend/src/domain/jobs/jobsService.ts:1)
- [x] T044 [US1] Enforce unique Job reference with user-friendly error in [`backend/src/domain/jobs/jobsService.ts`](backend/src/domain/jobs/jobsService.ts:1)

#### API: crew assignments

- [x] T045 [US1] Implement Assignments service in [`backend/src/domain/assignments/assignmentsService.ts`](backend/src/domain/assignments/assignmentsService.ts:1)
- [x] T046 [US1] Define and apply request/response schemas for Assignments endpoints in [`packages/shared/src/schemas/api/index.ts`](packages/shared/src/schemas/api/index.ts:1) and validate in [`backend/src/api/assignments.ts`](backend/src/api/assignments.ts:1)
- [x] T047 [US1] Add Assignments routes in [`backend/src/api/assignments.ts`](backend/src/api/assignments.ts:1) (maps to `/jobs/{jobId}/assignments`)

#### API: job notes (read/write permissions)

- [x] T048 [US1] Implement Job notes service in [`backend/src/domain/notes/jobNotesService.ts`](backend/src/domain/notes/jobNotesService.ts:1)
- [x] T049 [US1] Define and apply request/response schemas for Job notes endpoints in [`packages/shared/src/schemas/api/index.ts`](packages/shared/src/schemas/api/index.ts:1) and validate in [`backend/src/api/jobNotes.ts`](backend/src/api/jobNotes.ts:1)
- [x] T050 [US1] Add Job notes routes in [`backend/src/api/jobNotes.ts`](backend/src/api/jobNotes.ts:1) (maps to `/jobs/{jobId}/notes`)

#### Audit events (US1 subset)

- [x] T051 [P] [US1] Implement audit event writer in [`backend/src/domain/audit/auditService.ts`](backend/src/domain/audit/auditService.ts:1)
- [x] T052 [US1] Record audit events for Job create/update and assignment changes in [`backend/src/domain/audit/auditService.ts`](backend/src/domain/audit/auditService.ts:1)

#### Frontend: navigation + Job workspace shell

- [x] T053 [P] [US1] Add Jobs list pages (My Jobs + All Jobs) in [`frontend/src/pages/MyJobsPage.tsx`](frontend/src/pages/MyJobsPage.tsx:1) and [`frontend/src/pages/AllJobsPage.tsx`](frontend/src/pages/AllJobsPage.tsx:1) including: hide Archived by default + status filter
- [x] T054 [US1] Add Job workspace layout + tab routing in [`frontend/src/pages/JobWorkspace/JobWorkspaceLayout.tsx`](frontend/src/pages/JobWorkspace/JobWorkspaceLayout.tsx:1)
- [x] T055 [P] [US1] Implement Job Overview tab in [`frontend/src/pages/JobWorkspace/OverviewTab.tsx`](frontend/src/pages/JobWorkspace/OverviewTab.tsx:1)
- [x] T056 [P] [US1] Implement Job Crew tab in [`frontend/src/pages/JobWorkspace/CrewTab.tsx`](frontend/src/pages/JobWorkspace/CrewTab.tsx:1)
- [x] T057 [P] [US1] Implement Job Notes tab in [`frontend/src/pages/JobWorkspace/NotesTab.tsx`](frontend/src/pages/JobWorkspace/NotesTab.tsx:1)
- [x] T058 [US1] Ensure Job context (name + reference) is always visible in [`frontend/src/pages/JobWorkspace/JobWorkspaceLayout.tsx`](frontend/src/pages/JobWorkspace/JobWorkspaceLayout.tsx:1)

#### Frontend: create/edit Job (Admin/PM)

- [x] T059 [P] [US1] Add Job form component in [`frontend/src/components/jobs/JobForm.tsx`](frontend/src/components/jobs/JobForm.tsx:1)
- [x] T060 [US1] Add Create Job page in [`frontend/src/pages/CreateJobPage.tsx`](frontend/src/pages/CreateJobPage.tsx:1)
- [x] T061 [US1] Add Edit Job page in [`frontend/src/pages/EditJobPage.tsx`](frontend/src/pages/EditJobPage.tsx:1)

---

## Phase 4: User Story 2 - Store and retrieve job documents & files (Priority: P2)

**Goal**: Upload/download Job files with categories and two file areas (Shared/Internal) with correct permissions.

**Independent Test**: Upload a Shared file and confirm Technician/Warehouse can download it; upload an Internal file and confirm they cannot see it.

### US2 Tests (permissions + file access required)

- [x] T062 [P] [US2] Add file visibility permission tests in [`backend/tests/integration/files/visibility.test.ts`](backend/tests/integration/files/visibility.test.ts:1)
- [x] T063 [P] [US2] Add upload permission tests (Admin/PM/Senior only) in [`backend/tests/integration/files/uploadPermissions.test.ts`](backend/tests/integration/files/uploadPermissions.test.ts:1)

### US2 Implementation

#### Data model + migrations

- [x] T064 [US2] Create JobFile schema (including `area` and `category`) in [`backend/src/db/schema/jobFiles.ts`](backend/src/db/schema/jobFiles.ts:1)
- [x] T065 [US2] Add migration for JobFile in [`backend/src/db/migrations/0002_us2_files.sql`](backend/src/db/migrations/0002_us2_files.sql:1)

#### Storage integration (object storage + signed URLs)

- [x] T066 [P] [US2] Define storage provider interface in [`backend/src/files/storageProvider.ts`](backend/src/files/storageProvider.ts:1)
- [x] T067 [P] [US2] Implement dev/local storage provider in [`backend/src/files/localStorageProvider.ts`](backend/src/files/localStorageProvider.ts:1)
- [x] T068 [P] [US2] Implement signed URL service wrapper in [`backend/src/files/signedUrlService.ts`](backend/src/files/signedUrlService.ts:1)

#### API: files

- [x] T069 [US2] Implement file metadata service in [`backend/src/domain/files/jobFilesService.ts`](backend/src/domain/files/jobFilesService.ts:1)
- [x] T070 [US2] Define and apply request/response schemas for Job files endpoints in [`packages/shared/src/schemas/api/index.ts`](packages/shared/src/schemas/api/index.ts:1) and validate in [`backend/src/api/jobFiles.ts`](backend/src/api/jobFiles.ts:1)
- [x] T071 [US2] Add file routes in [`backend/src/api/jobFiles.ts`](backend/src/api/jobFiles.ts:1) (maps to `/jobs/{jobId}/files*` in [`openapi.yaml`](specs/001-phase1-core-workflow/contracts/openapi.yaml:1))
- [x] T072 [US2] Enforce “two areas” rules (Shared visible to all; Internal restricted) in [`backend/src/domain/files/jobFilesService.ts`](backend/src/domain/files/jobFilesService.ts:1)
- [x] T073 [US2] Enforce upload role restriction (Admin/PM/Senior only) in [`backend/src/domain/files/jobFilesService.ts`](backend/src/domain/files/jobFilesService.ts:1)
- [x] T074 [US2] Record audit event for file upload in [`backend/src/domain/audit/auditService.ts`](backend/src/domain/audit/auditService.ts:1)
- [x] T075 [US2] Implement file delete endpoint (Admin/PM only) in [`backend/src/api/jobFiles.ts`](backend/src/api/jobFiles.ts:1) and enforce permissions in [`backend/src/domain/files/jobFilesService.ts`](backend/src/domain/files/jobFilesService.ts:1)
- [x] T076 [US2] Record audit event for file delete in [`backend/src/domain/audit/auditService.ts`](backend/src/domain/audit/auditService.ts:1)

#### Frontend: Files tab UI

- [x] T077 [P] [US2] Add Files tab UI in [`frontend/src/pages/JobWorkspace/FilesTab.tsx`](frontend/src/pages/JobWorkspace/FilesTab.tsx:1)
- [x] T078 [P] [US2] Add upload dialog component in [`frontend/src/components/files/FileUploadDialog.tsx`](frontend/src/components/files/FileUploadDialog.tsx:1)
- [x] T079 [US2] Implement area toggle (Shared/Internal) and category filtering in [`frontend/src/pages/JobWorkspace/FilesTab.tsx`](frontend/src/pages/JobWorkspace/FilesTab.tsx:1)
- [x] T080 [US2] Implement download action using signed download URL in [`frontend/src/pages/JobWorkspace/FilesTab.tsx`](frontend/src/pages/JobWorkspace/FilesTab.tsx:1)
- [ ] T081 [US2] Implement file delete UI action (Admin/PM only) in [`frontend/src/pages/JobWorkspace/FilesTab.tsx`](frontend/src/pages/JobWorkspace/FilesTab.tsx:1)
- [ ] T082 [US2] Hide/disable upload and delete UI for Technician/Warehouse in [`frontend/src/pages/JobWorkspace/FilesTab.tsx`](frontend/src/pages/JobWorkspace/FilesTab.tsx:1)

---

## Phase 5: User Story 3 - Create technical paperwork and export to PDF (Priority: P3)

**Goal**: Build plug-up sheet (structured rows) with last-edited attribution, and export to reproducible PDF (Warehouse can export).

**Independent Test**: Create 10 rows, edit them, verify last edited, export PDF twice and confirm consistent content.

### US3 Tests (permissions + exports required)

- [x] T083 [P] [US3] Add plug-up edit permission tests in [`backend/tests/integration/paperwork/plugupPermissions.test.ts`](backend/tests/integration/paperwork/plugupPermissions.test.ts:1)
- [x] T084 [P] [US3] Add export permission tests (including Warehouse) in [`backend/tests/integration/exports/plugupExportPermissions.test.ts`](backend/tests/integration/exports/plugupExportPermissions.test.ts:1)

### US3 Implementation

#### Data model + migrations

- [x] T085 [US3] Create PlugUpSheet schema in [`backend/src/db/schema/plugUpSheets.ts`](backend/src/db/schema/plugUpSheets.ts:1)
- [x] T086 [US3] Create PlugUpRow schema in [`backend/src/db/schema/plugUpRows.ts`](backend/src/db/schema/plugUpRows.ts:1)
- [x] T087 [US3] Add migration for plug-up tables in [`backend/src/db/migrations/0003_us3_plugup.sql`](backend/src/db/migrations/0003_us3_plugup.sql:1)

#### API: plug-up sheet

- [x] T088 [US3] Implement plug-up service (get/update rows; last write wins) in [`backend/src/domain/paperwork/plugUpService.ts`](backend/src/domain/paperwork/plugUpService.ts:1)
- [x] T089 [US3] Define and apply request/response schemas for plug-up endpoints in [`packages/shared/src/schemas/api/index.ts`](packages/shared/src/schemas/api/index.ts:1) and validate in [`backend/src/api/plugUp.ts`](backend/src/api/plugUp.ts:1)
- [x] T090 [US3] Add plug-up routes in [`backend/src/api/plugUp.ts`](backend/src/api/plugUp.ts:1) (maps to `/jobs/{jobId}/paperwork/plugup`)
- [x] T091 [US3] Update last-edited fields and write audit events on edit in [`backend/src/domain/paperwork/plugUpService.ts`](backend/src/domain/paperwork/plugUpService.ts:1)

#### Backend exports: PDF

- [x] T092 [P] [US3] Create export template renderer for plug-up sheet in [`backend/src/exports/plugup/render.ts`](backend/src/exports/plugup/render.ts:1)
- [x] T093 [US3] Create PDF generation service wrapper in [`backend/src/exports/pdfService.ts`](backend/src/exports/pdfService.ts:1)
- [ ] T093a [P] [US3] Add PDF export reproducibility test (same input → stable output) in [`backend/tests/integration/exports/plugupExportReproducibility.test.ts`](backend/tests/integration/exports/plugupExportReproducibility.test.ts:1)
- [x] T094 [US3] Define and apply request/response schemas for export endpoint in [`packages/shared/src/schemas/api/index.ts`](packages/shared/src/schemas/api/index.ts:1) and validate in [`backend/src/api/plugUpExport.ts`](backend/src/api/plugUpExport.ts:1)
- [x] T095 [US3] Add export endpoint in [`backend/src/api/plugUpExport.ts`](backend/src/api/plugUpExport.ts:1) (maps to `/jobs/{jobId}/paperwork/plugup/export-pdf`)
- [x] T096 [US3] Record export audit event in [`backend/src/domain/audit/auditService.ts`](backend/src/domain/audit/auditService.ts:1)

#### Frontend: paperwork editor + export

- [ ] T097 [P] [US3] Add Paperwork tab UI shell in [`frontend/src/pages/JobWorkspace/PaperworkTab.tsx`](frontend/src/pages/JobWorkspace/PaperworkTab.tsx:1)
- [ ] T098 [P] [US3] Add plug-up editor component in [`frontend/src/components/paperwork/PlugUpEditor.tsx`](frontend/src/components/paperwork/PlugUpEditor.tsx:1)
- [ ] T099 [US3] Implement plug-up row CRUD + reorder UI in [`frontend/src/components/paperwork/PlugUpEditor.tsx`](frontend/src/components/paperwork/PlugUpEditor.tsx:1)
- [ ] T100 [US3] Display last edited by/at in [`frontend/src/components/paperwork/PlugUpEditor.tsx`](frontend/src/components/paperwork/PlugUpEditor.tsx:1)
- [ ] T100a [US3] Add UI hint showing “last saved by/at” near save controls in [`frontend/src/components/paperwork/PlugUpEditor.tsx`](frontend/src/components/paperwork/PlugUpEditor.tsx:1)
- [ ] T101 [US3] Add Export PDF button (available for all roles with Job access) in [`frontend/src/pages/JobWorkspace/PaperworkTab.tsx`](frontend/src/pages/JobWorkspace/PaperworkTab.tsx:1)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quality pass, audit log UI, empty/error/loading states, and quickstart validation.

- [x] T102 Add audit events list endpoint (Admin/PM/Senior Tech only) in [`backend/src/api/auditEvents.ts`](backend/src/api/auditEvents.ts:1)
- [x] T102a Enforce activity log role gating at API boundary in [`backend/src/api/auditEvents.ts`](backend/src/api/auditEvents.ts:1) using [`backend/src/domain/auth/jobPermissions.ts`](backend/src/domain/auth/jobPermissions.ts:1)
- [x] T103 Add audit events UI (visible only to Admin/PM/Senior Tech) in [`frontend/src/components/audit/ActivityLog.tsx`](frontend/src/components/audit/ActivityLog.tsx:1)
- [x] T103a Hide activity log UI entry points for Technician/Warehouse in [`frontend/src/pages/JobWorkspace/JobWorkspaceLayout.tsx`](frontend/src/pages/JobWorkspace/JobWorkspaceLayout.tsx:1)
- [x] T104 [P] Add empty/loading/error state components in [`frontend/src/components/ui/EmptyState.tsx`](frontend/src/components/ui/EmptyState.tsx:1) and [`frontend/src/components/ui/LoadingState.tsx`](frontend/src/components/ui/LoadingState.tsx:1)
- [x] T105 Add job list search UI in [`frontend/src/pages/MyJobsPage.tsx`](frontend/src/pages/MyJobsPage.tsx:1)
- [x] T106 [P] Add API request logging baseline in [`backend/src/api/middleware/requestLogger.ts`](backend/src/api/middleware/requestLogger.ts:1)
- [ ] T107 Run [`quickstart.md`](specs/001-phase1-core-workflow/quickstart.md:1) flow manually and document findings in [`specs/001-phase1-core-workflow/quickstart-validation.md`](specs/001-phase1-core-workflow/quickstart-validation.md:1)
- [ ] T108 Ensure Job dates render as date-only in UI and PDF exports in [`frontend/src/pages/JobWorkspace/OverviewTab.tsx`](frontend/src/pages/JobWorkspace/OverviewTab.tsx:1) and [`backend/src/exports/plugup/render.ts`](backend/src/exports/plugup/render.ts:1)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion; BLOCKS all user stories.
- **User Stories (Phases 3–5)**: Depend on Foundational.
- **Polish (Phase 6)**: Depends on all implemented stories.

### User Story Dependencies

- **US1 (P1)** depends on authentication + DB foundations.
- **US2 (P2)** depends on US1 for Job access model (Job + assignments).
- **US3 (P3)** depends on US1 for Job access model and on exports foundation.

---

## Parallel Opportunities

- Within Phase 1–2: tasks marked **[P]** can be worked on in parallel.
- Within each user story: schema files, frontend components, and tests can often be parallelized when they touch different files.

---

## Parallel Example: US1

```text
# In parallel (schema files):
- [ ] T029 [US1] Create User table schema in backend/src/db/schema/users.ts
- [ ] T030 [US1] Create Job table schema in backend/src/db/schema/jobs.ts
- [ ] T031 [US1] Create JobRoleAssignment table schema in backend/src/db/schema/jobRoleAssignments.ts

# In parallel (tests scaffolding):
- [ ] T026 [US1] Add permission boundary integration tests for Job access in backend/tests/integration/jobs/access.test.ts
- [ ] T027 [US1] Add integration tests for Job CRUD permissions in backend/tests/integration/jobs/crud.test.ts
```

---

## Suggested MVP Scope

Implement **US1 only** (through [`T061`](specs/001-phase1-core-workflow/tasks.md:1)) to reach a demoable MVP:

- Auth-gated app shell
- Job list(s)
- Job create/edit
- Crew assignment management
- Job workspace navigation with Overview/Crew/Notes

Then proceed to US2 (files) and US3 (paperwork + PDF) to complete Phase 1 success criteria.
