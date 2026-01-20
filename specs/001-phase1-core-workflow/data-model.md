# Data Model: Phase 1 Core Workflow

**Branch**: `001-phase1-core-workflow`  
**Date**: 2026-01-20  
**Spec**: [spec.md](./spec.md)

This is a logical data model (business entities + rules). It is not a database implementation.

## Entities

### User

Represents a person who can sign in.

**Core fields**:

- `userId` (stable identity key)
- `email`
- `displayName`
- `createdAt`

**Notes**:

- Identity provider is the source of identity; business data uses `userId` as the stable link.

### Job

Represents a live event production project and is the scope boundary for operational data.

**Core fields**:

- `jobId`
- `reference` (required; **unique system-wide**)
- `name` (required)
- `startDate` / `endDate` (required)
- `location` (required; free text)
- `notes` (optional; free text)
- `status` (Draft / Active / Archived)
- `createdAt`, `updatedAt`

**Rules**:

- Job access is determined by role assignment unless user is Admin/PM with global visibility.

### JobRoleAssignment

Links a `User` to a `Job` with a job-specific role.

**Core fields**:

- `assignmentId`
- `jobId`
- `userId`
- `role` (Admin / PM / Senior Technician / Technician / Warehouse)
- `assignmentNotes` (optional)
- `createdAt`, `updatedAt`

**Rules**:

- A user may have multiple assignments across jobs.
- A user has at most one active role assignment per job.

### JobNotes

Plain-text instructions for the Job.

**Core fields**:

- `jobId`
- `text` (plain text)
- `lastEditedByUserId`
- `lastEditedAt`

**Rules**:

- Editable by Admin/PM/Senior Technician; viewable by all users with Job access.

### JobFile

Metadata for an uploaded file.

**Core fields**:

- `fileId`
- `jobId`
- `area` (Shared / Internal)
- `category` (e.g., General, Rider, Plots, Paperwork, Other)
- `originalFileName`
- `mimeType`
- `sizeBytes`
- `storageObjectKey` (reference to object storage)
- `uploadedByUserId`
- `uploadedAt`
- `deletedAt` (optional; if soft-delete is used)

**Rules**:

- Only Admin/PM/Senior Technician may upload.
- Technician/Warehouse are download-only.
- `area=Internal` is visible only to Admin/PM/Senior Technician (on that Job).

### PlugUpSheet

Represents the Job’s single Phase 1 paperwork document.

**Core fields**:

- `jobId`
- `lastEditedByUserId`
- `lastEditedAt`

**Rules**:

- One plug-up sheet per Job.

### PlugUpRow

A structured row/item within the plug-up sheet.

**Core fields**:

- `rowId`
- `jobId`
- `sortOrder` (number)
- `identifier` (item identifier/name)
- `position` (location/position)
- `powerRequirement`
- `dataRequirement`
- `notes` (optional)
- `createdAt`, `updatedAt`

**Rules**:

- Editable by Admin/PM/Senior Technician.
- View-only for Technician/Warehouse.
- Concurrency behavior: last write wins.

### AuditEvent

Lightweight traceability for major events.

**Core fields**:

- `eventId`
- `jobId`
- `actorUserId`
- `eventType` (JobCreated / JobUpdated / AssignmentChanged / FileUploaded / FileDeleted / PlugUpEdited / PlugUpRowDeleted / PlugUpExported)
- `eventAt`
- `summary` (short text)

**Rules**:

- Events are Job-scoped.

## Relationships

- Job 1—N JobRoleAssignment
- User 1—N JobRoleAssignment
- Job 1—N JobFile
- Job 1—N PlugUpRow (through PlugUpSheet)
- Job 1—N AuditEvent
- Job 1—1 JobNotes

## Validation rules (high impact)

- Job `reference` is required and unique.
- Users must be signed in to access any Job-scoped data.
- Role checks are enforced on all Job-scoped operations.
- Internal files are never visible to Technician/Warehouse.
