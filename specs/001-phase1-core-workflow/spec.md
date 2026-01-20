# Feature Specification: Phase 1 Core Workflow

**Feature Branch**: `001-phase1-core-workflow`  
**Created**: 2026-01-20  
**Status**: Draft  
**Input**: User description: "Phase 1 core workflow: job creation, crew assignment, job roles & permissions, job workspace navigation, job files, power & data plug-up sheet, PDF export, lightweight auditability."

## Clarifications

### Session 2026-01-20

- Q: Should `Job reference number` be unique across the whole system, or only unique within a client/production? → A: Unique across the whole system
- Q: For Phase 1, should Job files have any permissions beyond Job membership (e.g., internal-only folders), or is it a single shared file area per Job? → A: Two areas: Internal/Shared
- Q: When two users edit the plug-up sheet around the same time, what should happen? → A: Last write wins (silent)
- Q: Should Warehouse users be allowed to export the plug-up sheet PDF, or view/download only? → A: Warehouse can export PDF
- Q: Who can upload Job files, and to which area? → A: Admin/PM/Senior Tech upload; Technician/Warehouse download only
- Q: Should `date(s)` for a Job be stored/handled as just a start date + end date (date-only), or as full date+time values? → A: Date-only range (start date + end date)
- Q: In Phase 1, should Admin/PM be able to delete Jobs? → A: No delete; use Archived status
- Q: Should file deletion be supported in Phase 1, and who can do it? → A: Admin/PM can delete files
- Q: Who should be able to view the per-Job activity log in Phase 1? → A: Admin/PM/Senior Tech only
- Q: Should the plug-up sheet enforce separate fields for power vs data, or allow a single “type + qty” style row (power or data) per line? → A: One row per item with both power + data fields

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a Job workspace and assign crew (Priority: P1)

As a PM (or Admin), I can create a Job, set key job information, and assign staff with job-specific roles so that the right people can see and open the Job workspace.

As a Technician/Warehouse user, I can sign in and see only the Jobs I’m assigned to, then open a Job workspace with clear job context.

**Why this priority**: Without job creation + assignments + job-scoped access, no other Phase 1 workflow can be safely used.

**Independent Test**: Create one Job, assign 3 users (PM, Technician, Warehouse), and verify each user sees/opens the Job correctly with appropriate permissions.

**Acceptance Scenarios**:

1. **Given** a PM user, **When** they create a Job with name, reference, start date/end date (date-only), and location, **Then** the Job is saved and appears in their Job list.
2. **Given** a Job with assigned users and job roles, **When** each assigned user signs in, **Then** they can see and open that Job workspace.
3. **Given** a user who is not assigned to a Job and has no elevated permissions, **When** they try to access the Job, **Then** access is denied and job details are not revealed.
4. **Given** a Job workspace is open, **When** a user navigates within the workspace, **Then** it is always clear which Job they are working in (name + reference visible).

---

### User Story 2 - Store and retrieve job documents & files (Priority: P2)

As a PM or Senior Technician, I can upload and organise job-related files so that crew and warehouse can reliably access the latest paperwork, plans, and documents for that Job.

As a Technician/Warehouse user, I can download/view assigned Job files without editing job metadata.

**Why this priority**: Real production teams depend on shared files; this replaces ad-hoc drives and message threads.

**Independent Test**: Upload files into two categories for a Job and verify each role can view/download according to access rules.

**Acceptance Scenarios**:

1. **Given** a Job and a user with file upload permission, **When** they upload a file and assign it to a folder/category, **Then** other permitted users can see and download it from the Job.
2. **Given** a user without access to a Job, **When** they attempt to download a Job file, **Then** the system prevents access.
3. **Given** a Warehouse user assigned to a Job, **When** they open Documents & Files, **Then** they can browse categories and download files.

---

### User Story 3 - Create technical paperwork and export to PDF (Priority: P3)

As a Senior Technician (or PM), I can build and maintain a structured “Power & Data Plug-up Sheet” within the Job so the team can prepare and deliver the show consistently.

As a Warehouse user, I can view the paperwork and download a professional PDF export so I can prep and pack accordingly.

**Why this priority**: This is the core “replace spreadsheets” value and enables warehouse preparation.

**Independent Test**: Create a plug-up sheet with at least 10 rows, edit it, verify audit details, and export a PDF that matches what is shown.

**Acceptance Scenarios**:

1. **Given** a Job workspace, **When** an authorised user creates/edits plug-up rows (e.g., equipment, position, power, data), **Then** the data persists and remains editable over time.
2. **Given** multiple users have access to the Job, **When** someone updates the plug-up sheet, **Then** the UI shows who last edited it and when.
3. **Given** a Warehouse user assigned to the Job, **When** they open the plug-up sheet, **Then** they can view it but cannot change it.
4. **Given** a plug-up sheet, **When** a user exports it to PDF, **Then** the PDF includes Job name/reference and renders consistently across repeated exports.

### Edge Cases

- User is removed from a Job while they are viewing it (access should be revoked on next access check).
- Two users edit the same plug-up row around the same time (last write wins; auditability shows last edited by/at).
- Upload attempt exceeds file size limits or uses an unsupported format (user gets a clear error and guidance).
- Job reference number is missing or duplicated (system enforces required fields and uniqueness rules per agreed constraints).
- PDF export requested when plug-up sheet has zero rows (export still works and clearly indicates “no rows”).
- User attempts to access a Job by guessing an identifier/link (no information disclosure).

## Requirements *(mandatory)*

### Functional Requirements

#### Access, roles, and visibility

- **FR-001**: System MUST require users to be signed in to access any Job content.
- **FR-002**: System MUST show each user a Job list containing only Jobs they are permitted to access.
- **FR-003**: System MUST prevent users from viewing or accessing Jobs they are not permitted to access.
- **FR-004**: System MUST support assigning users to a Job with a job-specific role (at minimum: Admin, PM, Senior Technician, Technician, Warehouse).
- **FR-005**: System MUST support users having different roles across different Jobs.
- **FR-006**: System MUST allow Admins and PMs to view all Jobs.
- **FR-007**: System MUST allow Admins and PMs to manage Job staff assignments (add/remove users, change job role).
- **FR-008**: System MUST prevent non-Admin/PM users from editing core Job metadata.

#### Job creation and management

- **FR-009**: System MUST allow Admins and PMs to create a Job with: job name, reference number, start date, end date, location, and notes.
- **FR-010**: System MUST allow Admins and PMs to edit Job metadata after creation.
- **FR-011**: System MUST allow non-Admin/PM users to view Job metadata (read-only) for Jobs they can access.
- **FR-011a**: System MUST enforce that Job reference numbers are unique across the whole system.
- **FR-011b**: Start date and end date MUST be stored and displayed as date-only values (no time-of-day in Phase 1).
- **FR-011c**: System MUST NOT allow deleting Jobs in Phase 1; Jobs are removed from active use by setting status to Archived.

#### Job workspace navigation

- **FR-012**: System MUST provide a dedicated Job workspace when a Job is opened.
- **FR-013**: System MUST clearly display the current Job context (job name + reference) throughout the Job workspace.
- **FR-014**: System MUST provide Job workspace sections for: Overview, Crew, Documents & Files, Paperwork, and Notes/Instructions.
- **FR-015**: System MUST ensure navigation within a Job feels like a tab/folder workspace (not a single long scrolling page).

#### Documents & files

- **FR-016**: System MUST allow permitted users to upload files to a Job.
- **FR-016a**: Only Admin, PM, and Senior Technician roles on a Job MUST be permitted to upload Job files.
- **FR-016b**: Technician and Warehouse roles MUST NOT be permitted to upload Job files.
- **FR-017**: System MUST allow users to organise Job files into simple folders/categories.
- **FR-017a**: System MUST provide two file areas per Job: (1) Shared and (2) Internal.
- **FR-017b**: Shared files MUST be visible to all users with Job access.
- **FR-017c**: Internal files MUST be visible only to Admin, PM, and Senior Technician roles on that Job.
- **FR-018**: System MUST allow permitted users to download files from a Job.
- **FR-019**: System MUST enforce Job permissions for file upload, listing, viewing, and download.
- **FR-020**: System MUST record who uploaded each file and when.
- **FR-020a**: System MUST allow Admin and PM roles to delete Job files.

#### Notes / instructions

- **FR-021**: System MUST allow authorised users to edit a simple text Notes/Instructions area per Job.
- **FR-022**: System MUST allow all users with Job access to view Notes/Instructions.

#### Paperwork (Power & Data Plug-up Sheet)

- **FR-023**: System MUST provide one core paperwork tool: a “Power & Data Plug-up Sheet” per Job.
- **FR-024**: Plug-up sheet MUST accept structured rows containing, at minimum: item identifier/name, location/position, power requirement, data requirement, and notes.
- **FR-024a**: Each plug-up row represents one item/position and includes both power and data requirement fields (not separate “type” rows).
- **FR-025**: System MUST allow authorised users to create, edit, reorder, and delete plug-up rows.
- **FR-026**: System MUST persist plug-up sheet data as part of the Job record.
- **FR-027**: System MUST allow Warehouse users to view plug-up sheets for assigned Jobs and MUST prevent them from editing.
- **FR-027a**: If two users save changes to the plug-up sheet concurrently, the system MUST use “last write wins” behavior.

#### Export and sharing

- **FR-028**: System MUST allow users with Job access to export the plug-up sheet to a PDF.
- **FR-028a**: Warehouse users with Job access MUST be able to export/download the plug-up sheet PDF.
- **FR-029**: PDF export MUST include Job branding information sufficient to identify the Job (at minimum: job name and reference number).
- **FR-030**: PDF export MUST be consistent and reproducible (same inputs produce the same output layout/content).
- **FR-031**: PDF export MUST match what users see in the app for the plug-up sheet (same rows and values).

#### Lightweight auditability

- **FR-032**: System MUST display “last edited by” and “last edited at” for the plug-up sheet.
- **FR-033**: System MUST capture a basic change history of major plug-up sheet events (create, delete, bulk import/paste if available, and export).
- **FR-033a**: System MUST provide a per-Job activity log viewable by Admin, PM, and Senior Technician roles.

### Acceptance Criteria (by requirement)

- **AC-001 (FR-001)**: If a user is not signed in, they cannot access any Job workspace, Job files, or paperwork.
- **AC-002 (FR-002)**: When a signed-in user views their Job list, it contains only Jobs they are permitted to access.
- **AC-003 (FR-003)**: When a user attempts to open a Job they are not permitted to access, the system denies access without revealing job details.
- **AC-004 (FR-004)**: For a given Job, Admin/PM can assign at least one user to each role: Admin, PM, Senior Technician, Technician, Warehouse.
- **AC-005 (FR-005)**: The same user can have different roles on two different Jobs and the system applies the correct permissions per Job.
- **AC-006 (FR-006)**: An Admin/PM can access the full list of Jobs, including Jobs with no assignment for them.
- **AC-007 (FR-007)**: An Admin/PM can add/remove a user assignment and change their job role, and the change takes effect for access and editing.
- **AC-008 (FR-008)**: A non-Admin/PM cannot edit Job metadata fields and is limited to read-only display.
- **AC-009 (FR-009)**: An Admin/PM can create a Job with required fields (name, reference, start date, end date, location) and optional notes.
- **AC-011b (FR-011b)**: Job date fields are entered and shown as dates (not times) throughout the Job workspace and PDF exports.
- **AC-010 (FR-010)**: An Admin/PM can update Job metadata and the updated values are visible throughout the Job workspace.
- **AC-011 (FR-011)**: A user with Job access can view Job metadata but is prevented from saving metadata changes.
- **AC-011a (FR-011a)**: If a user attempts to create or update a Job to use a reference number already in use, the system rejects the change with a clear message.
- **AC-012 (FR-012)**: Opening a Job takes the user into a dedicated workspace for that Job rather than a generic/global screen.
- **AC-011c (FR-011c)**: A Job can be marked Archived and becomes hidden from default active Job lists, while remaining accessible to Admin/PM and (optionally) to assigned users via filtering.
- **AC-013 (FR-013)**: The Job name and reference are visible across workspace sections so users can always confirm the current Job.
- **AC-014 (FR-014)**: The Job workspace provides the sections: Overview, Crew, Documents & Files, Paperwork, Notes/Instructions.
- **AC-015 (FR-015)**: Users can switch between workspace sections without losing context; each section is presented as a discrete area (tab/folder-style).
- **AC-016 (FR-016)**: A permitted user can upload at least one file to a Job and it becomes available within that Job.
- **AC-016a (FR-016a)**: A Technician/Warehouse user cannot upload files to the Job.
- **AC-016b (FR-016b)**: An Admin/PM/Senior Technician can upload files to both Shared and Internal areas (subject to visibility rules).
- **AC-017 (FR-017)**: A user can assign an uploaded file to a category and later filter/browse by category.
- **AC-017a (FR-017a)**: A user uploading a file must choose whether it is saved to Shared or Internal.
- **AC-017b (FR-017b)**: A Technician/Warehouse user assigned to the Job can view and download Shared files.
- **AC-017c (FR-017c)**: A Technician/Warehouse user assigned to the Job cannot view or download Internal files.
- **AC-018 (FR-018)**: A permitted user can download a Job file and the downloaded file matches the uploaded file.
- **AC-019 (FR-019)**: A user without Job permission cannot list, view, upload, or download files for that Job.
- **AC-020 (FR-020)**: Each Job file displays (or can be retrieved with) uploader identity and upload timestamp.
- **AC-020a (FR-020a)**: Admin/PM can delete a Job file; the file no longer appears in lists and an audit event is recorded.
- **AC-021 (FR-021)**: An authorised user can update Notes/Instructions for a Job and the text persists.
- **AC-022 (FR-022)**: All users with Job access can view Notes/Instructions.
- **AC-023 (FR-023)**: Each Job has exactly one plug-up sheet area available under Paperwork.
- **AC-024 (FR-024)**: A plug-up row includes values for identifier/name, location/position, power requirement, data requirement, and notes.
- **AC-025 (FR-025)**: An authorised user can add, edit, reorder, and delete rows; the resulting order and values persist.
- **AC-026 (FR-026)**: Closing and reopening the Job does not remove plug-up sheet data.
- **AC-027 (FR-027)**: A Warehouse user can view the plug-up sheet but cannot create/update/delete/reorder rows.
- **AC-027a (FR-027a)**: If two users save changes to the same plug-up row, the most recently saved values become the current saved state.
- **AC-028 (FR-028)**: A user with Job access can generate and download a PDF for the plug-up sheet.
- **AC-028a (FR-028a)**: A Warehouse user assigned to the Job can generate and download the plug-up sheet PDF.
- **AC-029 (FR-029)**: The PDF includes Job identifying information (at minimum job name and reference number).
- **AC-030 (FR-030)**: Re-exporting the same plug-up sheet produces a PDF with consistent content and layout.
- **AC-031 (FR-031)**: The PDF includes the same rows and values as currently shown in the app view.
- **AC-032 (FR-032)**: The plug-up sheet view displays the last editor and timestamp after changes.
- **AC-033 (FR-033)**: The system records major plug-up events (create, delete, export; plus any supported bulk change action) and they can be reviewed by Admin/PM/Senior Technician.
- **AC-033a (FR-033a)**: Technician/Warehouse users do not see the per-Job activity log.

### Role Permission Summary

| Capability | Admin | PM | Senior Technician | Technician | Warehouse |
|------------|:-----:|:--:|:----------------:|:----------:|:---------:|
| View all Jobs | Yes | Yes | No (assigned only) | No (assigned only) | No (assigned only) |
| Create/edit Job metadata | Yes | Yes | No | No | No |
| Manage Job staff assignments | Yes | Yes | No | No | No |
| View Job workspace (assigned Jobs) | Yes | Yes | Yes | Yes | Yes |
| Upload/download Job files (assigned Jobs) | Yes | Yes | Yes | Download only | Download only |
| Edit Notes/Instructions | Yes | Yes | Yes | No | No |
| Edit plug-up sheet | Yes | Yes | Yes | No | No |
| Export plug-up sheet to PDF | Yes | Yes | Yes | Yes | Yes |

### Out of Scope (explicit for Phase 1)

- Inventory and asset tracking
- Automated equipment allocation
- Logistics and trucking schedules
- Budgeting and cost tracking
- Advanced template systems
- Multi-company tenancy
- Client-facing portals
- Mobile app or offline-first native support

### Assumptions

- Users and authentication already exist; this feature relies on an existing sign-in mechanism.
- Role names are as defined in the project brief; exact permission boundaries are applied per-job.
- “Folders/categories” for files are lightweight and do not require deep hierarchy.

### Key Entities *(include if feature involves data)*

- **Job**: A production project (name, reference, dates, locations, notes) and the container for all Job-scoped content.
- **Job Role Assignment**: Links a user to a Job with a job-specific role and effective permissions.
- **Job Workspace Section**: The user-facing grouping of Job tools (Overview, Documents & Files, Paperwork, Notes/Instructions).
- **Job File**: A file attached to a Job, including filename, category, uploader identity, and upload timestamp.
- **File Category**: A lightweight label used to organise Job files.
- **Plug-up Sheet**: The paperwork document attached to a Job.
- **Plug-up Row**: A structured line item describing an equipment/position and its power/data requirements.
- **Audit Entry**: A minimal record of who changed the plug-up sheet and when, plus major event type.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A PM can create a Job and assign at least 5 crew members with job roles in under 5 minutes.
- **SC-002**: A Technician can sign in and open an assigned Job workspace in under 30 seconds and can clearly identify the current Job (name + reference) at all times.
- **SC-003**: A Senior Technician can create a plug-up sheet with 20 rows in under 10 minutes and later edit it without losing data.
- **SC-004**: A Warehouse user can locate the plug-up sheet for an assigned Job and download a PDF export in under 2 minutes.
- **SC-005**: In access testing, a user not assigned to a Job cannot view Job metadata, files, paperwork, or exports (0 successful unauthorised access attempts).
- **SC-006**: In a basic audit check, the plug-up sheet always displays the last editor and timestamp, and major change events are recorded for review.
