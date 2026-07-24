import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import Link from 'next/link';
import { Briefcase, PlusCircle, Clock, DollarSign, Users, ChevronRight, Edit } from 'lucide-react';

export default async function ClientJobsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  if (role !== 'CLIENT' && role !== 'ADMIN') redirect('/dashboard');

  const projects = await db.project.findMany({
    where: { clientId: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { proposals: true } },
    },
  });

  const statusColors: Record<string, string> = {
    OPEN: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    CLOSED: 'text-red-400 bg-red-500/10 border-red-500/20',
    COMPLETED: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    DRAFT: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="My Job Postings" subtitle="Manage your posted projects and applicant proposals" />

      <main className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-slate-400 text-sm">
            Total Postings: <span className="text-white font-bold">{projects.length}</span>
          </p>
          <Link
            href="/projects/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Post a New Job
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="glass-panel rounded-2xl p-16 text-center text-slate-500 space-y-4">
            <Briefcase className="w-12 h-12 mx-auto opacity-30" />
            <p className="text-base font-medium text-slate-300">You haven't posted any jobs yet</p>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Create Your First Job Listing
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-all duration-200"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        statusColors[project.status] || 'text-slate-400'
                      }`}
                    >
                      {project.status}
                    </span>
                    <span className="text-xs text-slate-500">{project.category}</span>
                  </div>

                  <Link href={`/projects/${project.id}`}>
                    <h2 className="text-base font-bold text-slate-100 hover:text-indigo-400 transition-colors">
                      {project.title}
                    </h2>
                  </Link>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="flex items-center space-x-4 text-xs pt-1">
                    <div className="flex items-center space-x-1 text-emerald-400 font-bold">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>${project.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-slate-400">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{project._count.proposals} Proposals</span>
                    </div>
                    <div className="flex items-center space-x-1 text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Posted {new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                  <Link
                    href={`/projects/${project.id}/edit`}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700/60 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                  <Link
                    href={`/projects/${project.id}`}
                    className="px-4 py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <span>View Proposals</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
