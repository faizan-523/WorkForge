'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type NotificationItem,
} from '@/lib/actions/notifications';
import {
  Bell,
  CheckCircle,
  XCircle,
  FileText,
  CheckCheck,
  Loader2,
  Info,
  Clock,
} from 'lucide-react';

export default function NotificationDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    const res = await getUserNotifications(15);
    if (res.success && res.notifications) {
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount || 0);
    }
  }, []);

  // Initial fetch and auto-refresh polling interval (every 15s)
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleMarkAsRead(id: string, link: string | null) {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    await markNotificationAsRead(id);

    if (link) {
      setIsOpen(false);
      router.push(link);
    }
  }

  async function handleMarkAllAsRead() {
    setIsLoading(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    await markAllNotificationsAsRead();
    setIsLoading(false);
  }

  function renderIcon(type: string) {
    switch (type) {
      case 'NEW_APPLICATION':
        return <FileText className="w-4 h-4 text-indigo-400 shrink-0" />;
      case 'PROJECT_ACCEPTED':
        return <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'PROJECT_REJECTED':
        return <XCircle className="w-4 h-4 text-red-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-amber-400 shrink-0" />;
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
        className="relative p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all duration-200"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-md animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl glass-panel-glow border border-slate-800 shadow-2xl z-50 p-4 space-y-3 animate-in fade-in duration-150">
          {/* Panel Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-slate-100">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={isLoading}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-slate-500 space-y-1">
              <Bell className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs font-medium">No notifications yet</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleMarkAsRead(item.id, item.link)}
                  className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer flex items-start space-x-3 ${
                    item.isRead
                      ? 'bg-slate-900/40 border-slate-800/40 opacity-70 hover:opacity-100 hover:bg-slate-800/40'
                      : 'bg-slate-800/60 border-indigo-500/20 hover:border-indigo-500/40'
                  }`}
                >
                  <div className="mt-0.5">{renderIcon(item.type)}</div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-semibold ${item.isRead ? 'text-slate-300' : 'text-slate-100'}`}>
                        {item.title}
                      </p>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.content}
                    </p>
                    <p className="text-[10px] text-slate-500 pt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
