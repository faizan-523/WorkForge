import { z } from 'zod';

export const PROJECT_CATEGORIES = [
  'Development',
  'Design',
  'Writing',
  'Marketing',
  'Data Science',
  'DevOps',
  'Mobile',
] as const;

export const EXPERIENCE_LEVELS = ['ENTRY', 'INTERMEDIATE', 'EXPERT'] as const;

export const ProjectFormSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'Title must be at least 5 characters' })
    .max(100, { message: 'Title must be 100 characters or fewer' }),
  description: z
    .string()
    .min(20, { message: 'Description must be at least 20 characters' })
    .max(5000, { message: 'Description must be 5000 characters or fewer' }),
  category: z
    .string()
    .min(2, { message: 'Please select or specify a category' }),
  experienceLevel: z.enum(EXPERIENCE_LEVELS, {
    message: 'Please select a valid experience level',
  }),
  budget: z.coerce
    .number({ message: 'Budget must be a number' })
    .positive({ message: 'Budget must be a positive amount ($)' }),
  deadline: z
    .string()
    .min(1, { message: 'Please select a project deadline' })
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid deadline date' }),
  skills: z
    .string()
    .min(2, { message: 'Please enter at least one skill' }),
  attachments: z.string().optional().default(''),
});

export type ProjectFormValues = z.infer<typeof ProjectFormSchema>;

export const ProjectFilterSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  level: z.string().optional(),
  minBudget: z.coerce.number().optional(),
  maxBudget: z.coerce.number().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
});

export type ProjectFilterValues = z.infer<typeof ProjectFilterSchema>;
