import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import Link from 'next/link';
import {
  Briefcase,
  FileText,
  DollarSign,
  CheckCircle,
  PlusCircle,
  ArrowRight,
  Clock,
  Users,
  TrendingUp,
  ShieldCheck,
  Bookmark,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const { id: userId, role } = session.user as any;

  let stats: any = {};
  let recentActivity: any[] = [];

  if (role === 'CLIENT') {
    const [posted, open, completed, pendingProposals, acceptedProposals, proposalsList] =
      await Promise.all([
        db.project.count({ where: { clientId: userId } }),
        db.project.count({ where: { clientId: userId, status: 'OPEN' } }),
        db.project.count({ where: { clientId: userId, status: 'COMPLETED' } }),
        db.proposal.count({
          where: { project: { clientId: userId }, status: 'PENDING' },
        }),
        db.proposal.findMany({
          where: { project: { clientId: userId }, status: 'ACCEPTED' },
          select: { bidAmount: true },
        }),
        db.proposal.findMany({
          where: { project: { clientId: userId } },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            freelancer: { select: { name: true } },
            project: { select: { title: true } },
          },
        }),
      ]);

    const totalSpent = acceptedProposals.reduce((sum, p) => sum + p.bidAmount, 0);

    stats = {
      posted,
      open,
      completed,
      pendingProposals,
      totalSpent,
    };
    recentActivity = proposalsList;
  } else if (role === 'FREELANCER') {
    const [proposalsCount, activeContracts, completedCount, savedCount, acceptedBids, proposalsList] =
      await Promise.all([
        db.proposal.count({ where: { freelancerId: userId } }),
        db.proposal.count({ where: { freelancerId: userId, status: 'ACCEPTED' } }),
        db.proposal.count({
          where: { freelancerId: userId, project: { status: 'COMPLETED' } },
        }),
        db.savedProject.count({ where: { userId } }),
        db.proposal.findMany({
          where: { freelancerId: userId, status: 'ACCEPTED' },
          select: { bidAmount: true },
        }),
        db.proposal.findMany({
          where: { freelancerId: userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            project: { select: { id: true, title: true, budget: true, status: true } },
          },
        }),
      ]);

    const totalEarnings = acceptedBids.reduce((sum, p) => sum + p.bidAmount, 0);

    stats = {
      proposals: proposalsCount,
      active: activeContracts,
      completed: completedCount,
      saved: savedCount,
      totalEarnings,
    };
    recentActivity = proposalsList;
  } else {
    // ADMIN
    const [totalUsers, totalProjects, totalProposals, suspendedUsers, totalVolume, userList] =
      await Promise.all([
        db.user.count(),
        db.project.count(),
        db.proposal.count(),
        db.user.count({ where: { status: 'SUSPENDED' } }),
        db.project.aggregate({ _sum: { budget: true } }),
        db.user.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
          },
        }),
      ]);

    stats = {
      users: totalUsers,
      projects: totalProjects,
      proposals: totalProposals,
      suspended: suspendedUsers,
      totalVolume: totalVolume._sum.budget || 0,
    };
    recentActivity = userList;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <Header
        title={
          role === 'ADMIN'
            ? 'Admin Overview'
            : role === 'CLIENT'
            ? 'Client Dashboard'
            : 'Freelancer Dashboard'
        }
        subtitle={`Welcome back, ${session.user.name || 'User'}`}
      />

      <main className="p-8 space-y-8">
        {/* Welcome Banner */}
        <div className="glass-panel-glow rounded-2xl p-6 relative overflow-hidden flex items-center justify-between">
          <div className="space-y-1 relative z-10">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {role} ACCOUNT
            </span>
            <h2 className="text-2xl font-extrabold text-white pt-1">
              Welcome back to WorkForge, {session.user.name ? session.user.name.split(' ')[0] : 'User'}!
            </h2>
            <p className="text-sm text-slate-400">
              {role === 'CLIENT'
                ? 'Manage your job postings, review proposals, and hire skilled freelancers.'
                : role === 'FREELANCER'
                ? 'Discover new job opportunities, track your active proposals, and submit bids.'
                : 'Monitor platform activity, moderate projects, and manage user accounts.'}
            </p>
          </div>
          <Sparkles className="w-16 h-16 text-indigo-500/20 shrink-0 hidden md:block" />
        </div>

        {/* Stats Cards Grid */}
        {role === 'CLIENT' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'Jobs Posted', value: stats.posted, icon: Briefcase, color: 'from-indigo-500 to-indigo-600' },
              { label: 'Open Projects', value: stats.open, icon: TrendingUp, color: 'from-emerald-500 to-teal-600' },
              { label: 'Pending Proposals', value: stats.pendingProposals, icon: FileText, color: 'from-amber-500 to-orange-500' },
              { label: 'Total Budget Spent', value: `$${stats.totalSpent.toLocaleString()}`, icon: DollarSign, color: 'from-purple-500 to-purple-600' },
            ].map((stat) => (
              <div key={stat.label} className="glass-panel rounded-2xl p-6 hover:border-slate-700 transition-all duration-200">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {role === 'FREELANCER' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'Proposals Sent', value: stats.proposals, icon: FileText, color: 'from-indigo-500 to-indigo-600' },
              { label: 'Active Contracts', value: stats.active, icon: Briefcase, color: 'from-emerald-500 to-teal-600' },
              { label: 'Total Earnings', value: `$${stats.totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'from-purple-500 to-purple-600' },
              { label: 'Saved Jobs', value: stats.saved, icon: Bookmark, color: 'from-amber-500 to-orange-500' },
            ].map((stat) => (
              <div key={stat.label} className="glass-panel rounded-2xl p-6 hover:border-slate-700 transition-all duration-200">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {role === 'ADMIN' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'Total Users', value: stats.users, icon: Users, color: 'from-indigo-500 to-indigo-600' },
              { label: 'Total Projects', value: stats.projects, icon: Briefcase, color: 'from-emerald-500 to-teal-600' },
              { label: 'Total Proposals', value: stats.proposals, icon: FileText, color: 'from-amber-500 to-orange-500' },
              { label: 'Platform Volume', value: `$${stats.totalVolume.toLocaleString()}`, icon: DollarSign, color: 'from-purple-500 to-purple-600' },
            ].map((stat) => (
              <div key={stat.label} className="glass-panel rounded-2xl p-6 hover:border-slate-700 transition-all duration-200">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Activity & Quick Actions Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-100">
                {role === 'ADMIN' ? 'Recent Users' : 'Recent Applications / Activity'}
              </h2>
              {role === 'CLIENT' && (
                <Link
                  href="/dashboard/client/jobs"
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                >
                  <span>View My Jobs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
              {role === 'FREELANCER' && (
                <Link
                  href="/dashboard/freelancer/proposals"
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                >
                  <span>Track Proposals</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {recentActivity.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No recent activity found.</p>
            ) : (
              <ul className="space-y-3">
                {recentActivity.map((item: any) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0"
                  >
                    {role === 'CLIENT' && (
                      <>
                        <div>
                          <p className="text-sm font-medium text-slate-200">{item.freelancer?.name}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[200px]">
                            {item.project?.title}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            item.status === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : item.status === 'ACCEPTED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {item.status}
                        </span>
                      </>
                    )}

                    {role === 'FREELANCER' && (
                      <>
                        <div>
                          <Link href={`/projects/${item.project?.id}`}>
                            <p className="text-sm font-medium text-slate-200 hover:text-indigo-400 transition-colors truncate max-w-[220px]">
                              {item.project?.title}
                            </p>
                          </Link>
                          <p className="text-xs text-slate-500">
                            Bid: ${item.bidAmount?.toLocaleString()}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            item.status === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : item.status === 'ACCEPTED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : item.status === 'WITHDRAWN'
                              ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {item.status}
                        </span>
                      </>
                    )}

                    {role === 'ADMIN' && (
                      <>
                        <div>
                          <p className="text-sm font-medium text-slate-200">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.email}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-slate-400">{item.role}</span>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              item.status === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-red-500/10 text-red-400'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick Actions */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-100">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-3">
              {role === 'CLIENT' && (
                <>
                  <Link
                    href="/projects/new"
                    className="flex items-center space-x-3 p-3.5 rounded-xl bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 hover:border-indigo-500/20 transition-all group"
                  >
                    <PlusCircle className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-slate-200">Post a New Job</span>
                  </Link>
                  <Link
                    href="/dashboard/client/jobs"
                    className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 transition-all group"
                  >
                    <Briefcase className="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-slate-200">Manage My Job Postings</span>
                  </Link>
                  <Link
                    href="/messages"
                    className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 transition-all group"
                  >
                    <MessageSquare className="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-slate-200">Messages & Conversations</span>
                  </Link>
                </>
              )}

              {role === 'FREELANCER' && (
                <>
                  <Link
                    href="/projects"
                    className="flex items-center space-x-3 p-3.5 rounded-xl bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 hover:border-indigo-500/20 transition-all group"
                  >
                    <Briefcase className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-slate-200">Browse Open Jobs</span>
                  </Link>
                  <Link
                    href="/dashboard/freelancer/proposals"
                    className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 transition-all group"
                  >
                    <FileText className="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-slate-200">Track My Proposals</span>
                  </Link>
                  <Link
                    href="/dashboard/freelancer/saved"
                    className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 transition-all group"
                  >
                    <Bookmark className="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-slate-200">Saved Jobs & Bookmarks</span>
                  </Link>
                </>
              )}

              {role === 'ADMIN' && (
                <>
                  <Link
                    href="/admin/users"
                    className="flex items-center space-x-3 p-3.5 rounded-xl bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 hover:border-indigo-500/20 transition-all group"
                  >
                    <Users className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-slate-200">Manage Platform Users</span>
                  </Link>
                  <Link
                    href="/admin/projects"
                    className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 transition-all group"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-slate-200">Moderate Platform Projects</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
