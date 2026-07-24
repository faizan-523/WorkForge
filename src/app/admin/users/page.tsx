import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import AdminUserActions from './AdminUserActions';
import { Users, ShieldAlert, ShieldCheck } from 'lucide-react';

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== 'ADMIN') redirect('/dashboard');

  const adminId = (session!.user as any).id;

  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      profile: { select: { companyName: true, title: true } },
      _count: { select: { projects: true, proposals: true } },
    },
  });

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="User Management" subtitle={`${users.length} total accounts on the platform`} />
      <main className="p-8 space-y-6">
        <div className="glass-panel rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Activity</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                        {user.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      user.role === 'ADMIN' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                      user.role === 'CLIENT' ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' :
                      'text-purple-400 bg-purple-500/10 border-purple-500/20'
                    }`}>{user.role}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {user.role === 'CLIENT' && <span>{user._count.projects} projects</span>}
                    {user.role === 'FREELANCER' && <span>{user._count.proposals} proposals</span>}
                    {user.role === 'ADMIN' && <span>—</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center space-x-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
                      user.status === 'ACTIVE'
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : 'text-red-400 bg-red-500/10 border-red-500/20'
                    }`}>
                      {user.status === 'ACTIVE' ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                      <span>{user.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.role !== 'ADMIN' && (
                      <AdminUserActions userId={user.id} currentStatus={user.status} adminId={adminId} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
