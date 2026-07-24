'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-8 py-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center space-x-3">
          {/* Notification Dropdown */}
          <NotificationDropdown />

          {/* Avatar */}
          <Link href="/dashboard/profile" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-600/20">
              {session?.user?.name ? session.user.name[0].toUpperCase() : 'U'}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
