import { z } from 'zod';

// ---------------------------------------------------------------------------
// Social Links — validated as optional URL fields
// ---------------------------------------------------------------------------
export const SocialLinksSchema = z.object({
  linkedin: z
    .string()
    .url({ message: 'Invalid LinkedIn URL' })
    .or(z.literal(''))
    .optional()
    .default(''),
  github: z
    .string()
    .url({ message: 'Invalid GitHub URL' })
    .or(z.literal(''))
    .optional()
    .default(''),
  twitter: z
    .string()
    .url({ message: 'Invalid Twitter / X URL' })
    .or(z.literal(''))
    .optional()
    .default(''),
  website: z
    .string()
    .url({ message: 'Invalid website URL' })
    .or(z.literal(''))
    .optional()
    .default(''),
});

export type SocialLinks = z.infer<typeof SocialLinksSchema>;

// ---------------------------------------------------------------------------
// Base fields shared by all roles
// ---------------------------------------------------------------------------
const BaseProfileSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(80, { message: 'Name must be 80 characters or fewer' }),
  imageUrl: z
    .string()
    .url({ message: 'Invalid image URL' })
    .or(z.literal(''))
    .optional()
    .default(''),
  socialLinks: SocialLinksSchema.optional().default({
    linkedin: '',
    github: '',
    twitter: '',
    website: '',
  }),
});

// ---------------------------------------------------------------------------
// Freelancer-specific profile schema
// ---------------------------------------------------------------------------
export const FreelancerProfileFormSchema = BaseProfileSchema.extend({
  role: z.literal('FREELANCER'),
  title: z
    .string()
    .min(3, { message: 'Professional title must be at least 3 characters' })
    .max(100, { message: 'Title must be 100 characters or fewer' }),
  bio: z
    .string()
    .min(10, { message: 'Bio must be at least 10 characters' })
    .max(2000, { message: 'Bio must be 2000 characters or fewer' }),
  skills: z
    .string()
    .min(2, { message: 'Add at least one skill' }),
  hourlyRate: z.coerce
    .number()
    .positive({ message: 'Hourly rate must be a positive number' })
    .max(1000, { message: 'Hourly rate seems too high — max $1000' })
    .optional()
    .or(z.literal(0).transform(() => undefined)),
  resumeUrl: z
    .string()
    .url({ message: 'Invalid resume URL' })
    .or(z.literal(''))
    .optional()
    .default(''),
});

// ---------------------------------------------------------------------------
// Client-specific profile schema
// ---------------------------------------------------------------------------
export const ClientProfileFormSchema = BaseProfileSchema.extend({
  role: z.literal('CLIENT'),
  companyName: z
    .string()
    .min(2, { message: 'Company name must be at least 2 characters' })
    .max(120, { message: 'Company name must be 120 characters or fewer' }),
  companyLogo: z
    .string()
    .url({ message: 'Invalid logo URL' })
    .or(z.literal(''))
    .optional()
    .default(''),
});

// ---------------------------------------------------------------------------
// Discriminated union — the form picks the right branch based on `role`
// ---------------------------------------------------------------------------
export const ProfileFormSchema = z.discriminatedUnion('role', [
  FreelancerProfileFormSchema,
  ClientProfileFormSchema,
]);

export type ProfileFormValues = z.infer<typeof ProfileFormSchema>;
export type FreelancerFormValues = z.infer<typeof FreelancerProfileFormSchema>;
export type ClientFormValues = z.infer<typeof ClientProfileFormSchema>;
