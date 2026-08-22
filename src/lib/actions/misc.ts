'use server';

import { ReviewSchema } from '@/lib/validators';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// --- Reviews ---
export async function leaveReview(
  projectId: string,
  reviewerId: string,
  revieweeId: string,
  formData: {
    rating: number;
    comment: string;
  }
) {
  const validated = ReviewSchema.safeParse(formData);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message };
  }

  try {
    const review = await db.review.create({
      data: {
        projectId,
        reviewerId,
        revieweeId,
        rating: formData.rating,
        comment: formData.comment,
      },
    });

    // Mark project as Completed
    await db.project.update({
      where: { id: projectId },
      data: { status: 'COMPLETED' },
    });

    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/dashboard');

    return { success: true, reviewId: review.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- Messages ---
export async function sendMessage(senderId: string, receiverId: string, content: string) {
  if (!content || content.trim() === '') {
    return { success: false, error: 'Message cannot be empty.' };
  }

  try {
    const message = await db.message.create({
      data: {
        senderId,
        receiverId,
        content: content.trim(),
      },
    });

    revalidatePath('/messages');

    return { success: true, message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- Admin Actions ---
export async function toggleUserStatus(userId: string, currentStatus: string, adminId: string) {
  try {
    const adminUser = await db.user.findUnique({ where: { id: adminId } });
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized. Admin access required.' };
    }

    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await db.user.update({
      where: { id: userId },
      data: { status: newStatus },
    });

    if (newStatus === 'SUSPENDED') {
      await db.session.deleteMany({ where: { userId } });
    }

    revalidatePath('/dashboard');
    return { success: true, newStatus };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminDeleteProject(projectId: string, adminId: string) {
  try {
    const adminUser = await db.user.findUnique({ where: { id: adminId } });
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized.' };
    }

    await db.project.delete({ where: { id: projectId } });

    revalidatePath('/projects');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- Notifications ---
export async function getNotifications(userId: string) {
  try {
    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    return { success: true, notifications };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markNotificationRead(notificationId: string) {
  try {
    await db.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
