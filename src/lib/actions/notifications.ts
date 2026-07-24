'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import {
  CreateNotificationSchema,
  type CreateNotificationValues,
  type NotificationType,
} from '@/lib/validations/notification';

export type NotificationItem = {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
};

export type NotificationActionResult = {
  success: boolean;
  error?: string;
  notifications?: NotificationItem[];
  unreadCount?: number;
};

// ---------------------------------------------------------------------------
// Fetch latest notifications & unread count for current logged-in user
// ---------------------------------------------------------------------------
export async function getUserNotifications(limit = 20): Promise<NotificationActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: 'Unauthenticated', notifications: [], unreadCount: 0 };
  }

  const userId = (session.user as any).id;

  try {
    const [notifications, unreadCount] = await Promise.all([
      db.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      db.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return {
      success: true,
      notifications,
      unreadCount,
    };
  } catch (error: any) {
    console.error('[getUserNotifications] Error:', error);
    return { success: false, error: error.message, notifications: [], unreadCount: 0 };
  }
}

// ---------------------------------------------------------------------------
// Mark a single notification as read
// ---------------------------------------------------------------------------
export async function markNotificationAsRead(id: string): Promise<NotificationActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: 'Unauthenticated' };
  }

  const userId = (session.user as any).id;

  try {
    const notification = await db.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== userId) {
      return { success: false, error: 'Notification not found' };
    }

    await db.notification.update({
      where: { id },
      data: { isRead: true },
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ---------------------------------------------------------------------------
// Mark ALL notifications for user as read
// ---------------------------------------------------------------------------
export async function markAllNotificationsAsRead(): Promise<NotificationActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: 'Unauthenticated' };
  }

  const userId = (session.user as any).id;

  try {
    await db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ---------------------------------------------------------------------------
// Internal Helper: Create notification for any user
// ---------------------------------------------------------------------------
export async function createNotification(data: CreateNotificationValues) {
  const parsed = CreateNotificationSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: 'Invalid notification data' };
  }

  const { userId, title, content, type, link } = parsed.data;

  try {
    const notification = await db.notification.create({
      data: {
        userId,
        title,
        content,
        type: type || 'INFO',
        link: link || null,
      },
    });

    return { success: true, notification };
  } catch (error: any) {
    console.error('[createNotification] Error:', error);
    return { success: false, error: error.message };
  }
}
