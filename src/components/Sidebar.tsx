'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  MessageSquare,
  User,
  LogOut,
  FolderKanban,
  Bookmark,
  FileText,
  Users,
  ShieldAlert
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const clientLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/projects/new', label: 'Post a Job', icon: PlusCircle },
    { href: '/dashboard/client/jobs', label: 'My Postings', icon: FolderKanban },
    { href: '/messages', label: 'Messages', icon: MessageSquare },
    { href: '/dashboard/profile', label: 'Profile', icon: User },
  ];

  const freelancerLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/projects', label: 'Browse Jobs', icon: Briefcase },
    { href: '/dashboard/freelancer/saved', label: 'Saved Jobs', icon: Bookmark },
    { href: '/dashboard/freelancer/proposals', label: 'Proposals', icon: FileText },
    { href: '/messages', label: 'Messages', icon: MessageSquare },
    { href: '/dashboard/profile', label: 'Profile', icon: User },
  ];

  const adminLinks = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Manage Users', icon: Users },
    { href: '/admin/projects', label: 'Moderate Jobs', icon: ShieldAlert },
    { href: '/dashboard/profile', label: 'Profile', icon: User },
  ];

  const links = role === 'ADMIN' ? adminLinks : role === 'CLIENT' ? clientLinks : freelancerLinks;

  return (
    <aside className="w-64 bg-slate-900/50 border-r border-slate-800/80 backdrop-blur-md min-h-screen flex flex-col justify-between p-6">
      <div className="space-y-8">
        <div>
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent glow-text">
              WorkForge
            </span>
            {role === 'ADMIN' && (
              <span className="text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
                Admin
              </span>
            )}
          </Link>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-3 mb-2">
            Navigation
          </p>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/15'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-slate-800/60">
        {session?.user && (
          <div className="flex items-center space-x-3 px-2 py-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
              {session.user.name ? session.user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{session.user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{session.user.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
