import { z } from 'zod';

export const ProposalFormSchema = z.object({
  bidAmount: z.coerce
    .number({ message: 'Bid amount must be a number' })
    .positive({ message: 'Bid amount must be a positive amount ($)' }),
  durationDays: z.coerce
    .number({ message: 'Duration must be a number' })
    .int({ message: 'Duration must be a whole number of days' })
    .positive({ message: 'Duration must be at least 1 day' })
    .max(365, { message: 'Duration cannot exceed 365 days' }),
  coverLetter: z
    .string()
    .min(10, { message: 'Cover letter must be at least 10 characters' })
    .max(3000, { message: 'Cover letter must be 3000 characters or fewer' }),
});

export type ProposalFormValues = z.infer<typeof ProposalFormSchema>;

export const UpdateProposalStatusSchema = z.object({
  proposalId: z.string().min(1, { message: 'Proposal ID is required' }),
  status: z.enum(['ACCEPTED', 'REJECTED', 'PENDING'], {
    message: 'Status must be ACCEPTED, REJECTED, or PENDING',
  }),
});

export type UpdateProposalStatusValues = z.infer<typeof UpdateProposalStatusSchema>;
