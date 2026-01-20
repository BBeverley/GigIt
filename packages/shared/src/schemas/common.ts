import { z } from 'zod';

export const IdSchema = z.string().min(1);

export const JobStatusSchema = z.enum(['Draft', 'Active', 'Archived']);

export const JobRoleSchema = z.enum(['Admin', 'PM', 'SeniorTechnician', 'Technician', 'Warehouse']);

export const FileAreaSchema = z.enum(['Shared', 'Internal']);

