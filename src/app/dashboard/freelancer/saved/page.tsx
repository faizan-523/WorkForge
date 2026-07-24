import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import Link from 'next/link';
import { Bookmark, Briefcase, DollarSign, Clock, ChevronRight } from 'lucide-react';

export default async function FreelancerSavedJobsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  if (role !== 'FREELANCER' && role !== 'ADMIN') redirect('/dashboard');

  const savedProjects = await db.savedProject.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      project: {
        include: {
          client: { select: { name: true, profile: { select: { companyName: true } } } },
          _count: { select: { proposals: true } },
        },
      },
    },
  });

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Saved Jobs" subtitle="Bookmarks and saved project opportunities" />

      <main className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-slate-400 text-sm">
            Total Saved: <span className="text-white font-bold">{savedProjects.length}</span>
          </p>
          <Link
            href="/projects"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Briefcase className="w-4 h-4" />
            Browse Open Jobs
          </Link>
        </div>

        {savedProjects.length === 0 ? (
          <div className="glass-panel rounded-2xl p-16 text-center text-slate-500 space-y-4">
            <Bookmark className="w-12 h-12 mx-auto opacity-30" />
            <p className="text-base font-medium text-slate-300">No saved projects found</p>
            <p className="text-xs text-slate-500">Bookmark interesting jobs while browsing to review them later</p>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all"
            >
              <Briefcase className="w-4 h-4" />
              Explore Projects
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {savedProjects.map(({ project }) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="glass-panel rounded-2xl p-6 space-y-4 group hover:border-indigo-500/30 transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-slate-100 text-base group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {project.title}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {project.client.profile?.companyName || project.client.name}
                      </p>
                    </div>
                    <Bookmark className="w-4 h-4 text-indigo-400 shrink-0 fill-current" />
                  </div>

                  <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {project.skills
                      .split(',')
                      .slice(0, 3)
                      .map((skill) => (
                        <span
                          key={skill}
                          className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800/60 mt-2">
                  <div className="flex items-center space-x-1 text-emerald-400">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span className="font-bold text-sm">${project.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-500">
                    <span className="text-xs">{project._count.proposals} proposals</span>
                    <ChevronRight className="w-3 h-3 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
