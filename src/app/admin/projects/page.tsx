import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import AdminProjectActions from './AdminProjectActions';
import { DollarSign, Clock, Users } from 'lucide-react';

export default async function AdminProjectsPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== 'ADMIN') redirect('/dashboard');

  const adminId = (session!.user as any).id;

  const projects = await db.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { name: true, profile: { select: { companyName: true } } } },
      _count: { select: { proposals: true } },
    },
  });

  const statusColor: Record<string, string> = {
    OPEN: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    CLOSED: 'text-red-400 bg-red-500/10 border-red-500/20',
    DRAFT: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
    COMPLETED: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Project Moderation" subtitle={`${projects.length} total projects on the platform`} />
      <main className="p-8 space-y-6">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((project) => (
            <div key={project.id} className="glass-panel rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-all">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-100 text-sm line-clamp-1">{project.title}</h3>
                  <p className="text-xs text-slate-500">{project.client.profile?.companyName || project.client.name}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border shrink-0 ${statusColor[project.status]}`}>
                  {project.status}
                </span>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{project.description}</p>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center space-x-1">
                  <DollarSign className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">${project.budget.toLocaleString()}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>{project._count.proposals} proposals</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(project.deadline).toLocaleDateString()}</span>
                </span>
              </div>

              <AdminProjectActions projectId={project.id} adminId={adminId} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
