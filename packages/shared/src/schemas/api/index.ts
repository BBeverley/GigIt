import { z } from 'zod';

import { FileAreaSchema, IdSchema, JobRoleSchema, JobStatusSchema } from '../common';

// ---
// /me
// ---

export const MeResponseSchema = z.object({
  user: z.object({
    userId: IdSchema,
    email: z.string().email().optional(),
    displayName: z.string().min(1).optional(),
  }),
});

// ---
// Jobs
// ---

export const JobSchema = z.object({
  jobId: IdSchema,
  reference: z.string().min(1),
  name: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  location: z.string().min(1),
  notes: z.string().optional(),
  status: JobStatusSchema,
});

export const JobsListResponseSchema = z.object({
  jobs: z.array(JobSchema),
});

export const JobResponseSchema = z.object({
  job: JobSchema,
});

export const CreateJobRequestSchema = z.object({
  reference: z.string().min(1),
  name: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  location: z.string().min(1),
  notes: z.string().optional(),
  status: JobStatusSchema.optional(),
});

export const UpdateJobRequestSchema = z
  .object({
    name: z.string().min(1).optional(),
    startDate: z.string().min(1).optional(),
    endDate: z.string().min(1).optional(),
    location: z.string().min(1).optional(),
    notes: z.string().nullable().optional(),
    status: JobStatusSchema.optional(),
  })
  .strict();

// ---
// Assignments
// ---

export const AssignmentSchema = z.object({
  assignmentId: IdSchema,
  jobId: IdSchema,
  userId: IdSchema,
  role: JobRoleSchema,
  assignmentNotes: z.string().optional(),
});

export const AssignmentsListResponseSchema = z.object({
  assignments: z.array(AssignmentSchema),
});

export const AssignmentResponseSchema = z.object({
  assignment: AssignmentSchema,
});

export const CreateAssignmentRequestSchema = z.object({
  userId: IdSchema,
  role: JobRoleSchema,
  assignmentNotes: z.string().optional(),
});

export const UpdateAssignmentRequestSchema = z
  .object({
    role: JobRoleSchema.optional(),
    assignmentNotes: z.string().nullable().optional(),
  })
  .strict();

// ---
// Notes
// ---

export const JobNotesSchema = z.object({
  jobId: IdSchema,
  text: z.string(),
  lastEditedByUserId: IdSchema.optional(),
  lastEditedAt: z.string().optional(),
});

export const JobNotesResponseSchema = z.object({
  notes: JobNotesSchema,
});

export const UpdateJobNotesRequestSchema = z.object({
  text: z.string(),
});

// ---
// Files/Paperwork exports are added in later phases.
// ---

export const JobFileAreaSchema = FileAreaSchema;

// ---
// Files (US2)
// ---

export const SignedUrlSchema = z.object({
  url: z.string().min(1),
  method: z.enum(['GET', 'PUT']),
  headers: z.record(z.string()),
});

export const JobFileSchema = z.object({
  fileId: IdSchema,
  jobId: IdSchema,
  area: FileAreaSchema,
  category: z.string().min(1),
  originalFileName: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  uploadedByUserId: IdSchema,
  uploadedAt: z.string().min(1),
});

export const JobFilesListResponseSchema = z.object({
  files: z.array(JobFileSchema),
});

export const CreateJobFileUploadRequestSchema = z.object({
  area: FileAreaSchema,
  category: z.string().min(1),
  originalFileName: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
});

export const InitiateUploadResponseSchema = z.object({
  file: JobFileSchema,
  upload: SignedUrlSchema,
});

export const DownloadUrlResponseSchema = z.object({
  download: SignedUrlSchema,
});

// ---
// Paperwork: Plug-up sheet (US3)
// ---

export const PlugUpRowSchema = z.object({
  rowId: IdSchema,
  orderIndex: z.number().int().nonnegative(),
  label: z.string(),
  value: z.string(),
});

export const PlugUpSheetSchema = z.object({
  jobId: IdSchema,
  rows: z.array(PlugUpRowSchema),
  lastEditedByUserId: IdSchema.optional(),
  lastEditedAt: z.string().optional(),
});

export const GetPlugUpResponseSchema = z.object({
  sheet: PlugUpSheetSchema,
});

export const UpdatePlugUpRequestSchema = z
  .object({
    rows: z.array(
      z.object({
        rowId: IdSchema.optional(),
        orderIndex: z.number().int().nonnegative(),
        label: z.string(),
        value: z.string(),
      }),
    ),
  })
  .strict();

export const UpdatePlugUpResponseSchema = z.object({
  sheet: PlugUpSheetSchema,
});

// ---
// Plug-up export (US3)
// ---

export const PlugUpExportResponseSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.literal('application/pdf'),
  pdfBase64: z.string().min(1),
});

