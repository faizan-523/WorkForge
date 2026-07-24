'use server';

export {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
  type NotificationItem,
  type NotificationActionResult,
} from '@/lib/actions/notifications';
