import { z } from 'zod';

export const NOTIFICATION_TYPES = [
  'NEW_APPLICATION',
  'PROJECT_ACCEPTED',
  'PROJECT_REJECTED',
  'INFO',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const CreateNotificationSchema = z.object({
  userId: z.string().min(1, { message: 'Target user ID is required' }),
  title: z.string().min(1, { message: 'Title is required' }),
  content: z.string().min(1, { message: 'Content is required' }),
  type: z.enum(NOTIFICATION_TYPES).optional().default('INFO'),
  link: z.string().optional(),
});

export type CreateNotificationValues = z.infer<typeof CreateNotificationSchema>;
