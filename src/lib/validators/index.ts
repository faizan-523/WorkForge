import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

export const RegisterSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  role: z.enum(['CLIENT', 'FREELANCER'], { errorMap: () => ({ message: 'Please select a role' }) }),
});

export const ProjectSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters long' }).max(100),
  description: z.string().min(20, { message: 'Description must be at least 20 characters long' }),
  budget: z.coerce.number().positive({ message: 'Budget must be a positive number' }),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid deadline date' }),
  experienceLevel: z.enum(['ENTRY', 'INTERMEDIATE', 'EXPERT'], { errorMap: () => ({ message: 'Please select an experience level' }) }),
  category: z.string().min(2, { message: 'Please enter a category' }),
  skills: z.string().min(2, { message: 'Please enter at least one skill' }),
});

export const ProposalSchema = z.object({
  bidAmount: z.coerce.number().positive({ message: 'Bid amount must be a positive number' }),
  coverLetter: z.string().min(10, { message: 'Cover letter must be at least 10 characters long' }),
  durationDays: z.coerce.number().int().positive({ message: 'Duration must be a positive number of days' }),
});

export const ReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5, { message: 'Rating must be between 1 and 5' }),
  comment: z.string().min(5, { message: 'Comment must be at least 5 characters long' }),
});

export const FreelancerProfileSchema = z.object({
  title: z.string().min(3, { message: 'Professional title must be at least 3 characters long' }),
  bio: z.string().min(10, { message: 'Bio must be at least 10 characters long' }),
  skills: z.string().min(2, { message: 'Please list some skills (comma-separated)' }),
  experience: z.string().optional(), // Expected JSON array
  portfolioLinks: z.string().optional(), // Expected JSON array
  resumeUrl: z.string().url({ message: 'Invalid resume URL' }).or(z.literal('')),
  imageUrl: z.string().url({ message: 'Invalid profile image URL' }).or(z.literal('')),
});

export const ClientProfileSchema = z.object({
  companyName: z.string().min(2, { message: 'Company name must be at least 2 characters long' }),
  companyLogo: z.string().url({ message: 'Invalid logo URL' }).or(z.literal('')),
});
