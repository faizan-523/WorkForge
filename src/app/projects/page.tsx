import { db } from '@/lib/db';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import ProjectDeleteButton from '@/components/projects/ProjectDeleteButton';
import {
  Briefcase,
  DollarSign,
  Clock,
  ChevronRight,
  Search,
  Bookmark,
  ChevronLeft,
  Filter,
  PlusCircle,
} from 'lucide-react';

interface SearchParams {
  q?: string;
  category?: string;
  level?: string;
  minBudget?: string;
  maxBudget?: string;
  page?: string;
}

const PAGE_SIZE = 9;

export const dynamic = 'force-dynamic';

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  const resolvedParams = (await searchParams) || {};
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;

  const page = Math.max(1, parseInt(resolvedParams.page || '1', 10)) || 1;

  // Build Prisma filter clause
  const where: any = { status: 'OPEN' };

  if (resolvedParams.q) {
    where.OR = [
      { title: { contains: resolvedParams.q } },
      { description: { contains: resolvedParams.q } },
      { skills: { contains: resolvedParams.q } },
    ];
  }

  if (resolvedParams.category) {
    where.category = resolvedParams.category;
  }

  if (resolvedParams.level) {
    where.experienceLevel = resolvedParams.level;
  }

  const minB = resolvedParams.minBudget ? parseFloat(resolvedParams.minBudget) : NaN;
  const maxB = resolvedParams.maxBudget ? parseFloat(resolvedParams.maxBudget) : NaN;
  if (!isNaN(minB) || !isNaN(maxB)) {
    where.budget = {};
    if (!isNaN(minB)) where.budget.gte = minB;
    if (!isNaN(maxB)) where.budget.lte = maxB;
  }

  // Fetch total count & paginated projects concurrently
  let totalProjects = 0;
  let projects: any[] = [];

  try {
    const [countResult, projectsResult] = await Promise.all([
      db.project.count({ where }),
      db.project.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          client: { select: { name: true, profile: { select: { companyName: true } } } },
          _count: { select: { proposals: true } },
        },
      }),
    ]);
    totalProjects = countResult;
    projects = projectsResult;
  } catch (error) {
    console.error('Failed to load projects:', error);
  }

  const totalPages = Math.max(1, Math.ceil(totalProjects / PAGE_SIZE));

  // User's bookmarked project IDs
  let savedIds = new Set<string>();
  if (userId) {
    try {
      const savedProjects = await db.savedProject.findMany({ where: { userId }, select: { projectId: true } });
      savedIds = new Set(savedProjects.map((s) => s.projectId));
    } catch {
      // ignore
    }
  }

  const categories = ['Development', 'Design', 'Writing', 'Marketing', 'Data Science', 'DevOps', 'Mobile'];

  const levelColors: Record<string, string> = {
    ENTRY: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    INTERMEDIATE: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    EXPERT: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  };

  // Helper to build page URL retaining active filters
  function getPageUrl(targetPage: number) {
    const params = new URLSearchParams();
    if (resolvedParams.q) params.set('q', resolvedParams.q);
    if (resolvedParams.category) params.set('category', resolvedParams.category);
    if (resolvedParams.level) params.set('level', resolvedParams.level);
    if (resolvedParams.minBudget) params.set('minBudget', resolvedParams.minBudget);
    if (resolvedParams.maxBudget) params.set('maxBudget', resolvedParams.maxBudget);
    params.set('page', targetPage.toString());
    return `/projects?${params.toString()}`;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-900 bg-slate-950/90 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent glow-text"
          >
            WorkForge
          </Link>
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Link
                  href="/projects/new"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Post Project
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Dashboard →
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 space-y-8 flex-1">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Browse Projects</h1>
            <p className="text-slate-400 mt-1">
              Showing {projects.length} of {totalProjects} open project opportunities
            </p>
          </div>
          {session ? (
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all self-start md:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              Post a Project
            </Link>
          ) : null}
        </div>

        {/* Search & Filter Bar */}
        <form method="GET" className="glass-panel rounded-2xl p-5 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              name="q"
              defaultValue={resolvedParams.q}
              placeholder="Search jobs by keyword, title, or skill..."
              className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>
          <select
            name="category"
            defaultValue={resolvedParams.category || ''}
            className="bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c} className="bg-slate-900">
                {c}
              </option>
            ))}
          </select>
          <select
            name="level"
            defaultValue={resolvedParams.level || ''}
            className="bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50"
          >
            <option value="">All Levels</option>
            <option value="ENTRY" className="bg-slate-900">Entry</option>
            <option value="INTERMEDIATE" className="bg-slate-900">Intermediate</option>
            <option value="EXPERT" className="bg-slate-900">Expert</option>
          </select>
          <div className="flex gap-2">
            <input
              type="number"
              name="minBudget"
              defaultValue={resolvedParams.minBudget}
              placeholder="Min $"
              className="w-24 bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50"
            />
            <input
              type="number"
              name="maxBudget"
              defaultValue={resolvedParams.maxBudget}
              placeholder="Max $"
              className="w-24 bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </form>

        {/* Project Grid */}
        {projects.length === 0 ? (
          <div className="glass-panel rounded-2xl p-20 text-center text-slate-500">
            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium text-slate-300">No projects found</p>
            <p className="text-sm mt-1 text-slate-500">Try adjusting your filters or search keywords</p>
            {(resolvedParams.q || resolvedParams.category || resolvedParams.level) && (
              <Link
                href="/projects"
                className="inline-block mt-4 text-sm font-medium text-indigo-400 hover:text-indigo-300"
              >
                Clear all filters
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {projects.map((project) => (
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
                        {project.client?.profile?.companyName || project.client?.name || 'Client'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {userId && (project.clientId === userId || role === 'ADMIN') && (
                        <ProjectDeleteButton projectId={project.id} />
                      )}
                      {savedIds.has(project.id) && (
                        <Bookmark className="w-4 h-4 text-indigo-400 shrink-0 fill-current" />
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {(project.skills || '')
                      .split(',')
                      .filter(Boolean)
                      .slice(0, 4)
                      .map((skill: string) => (
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
                    <span className="font-bold text-sm">${project.budget ? Number(project.budget).toLocaleString() : '0'}</span>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                      levelColors[project.experienceLevel] || 'text-slate-400'
                    }`}
                  >
                    {project.experienceLevel}
                  </span>
                  <div className="flex items-center space-x-1 text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : ''}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-500">
                    <span className="text-xs">{project._count?.proposals ?? 0} proposals</span>
                    <ChevronRight className="w-3 h-3 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Server-Side Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-slate-900">
            <p className="text-xs text-slate-500">
              Page <span className="text-slate-300 font-semibold">{page}</span> of{' '}
              <span className="text-slate-300 font-semibold">{totalPages}</span>
            </p>

            <div className="flex items-center space-x-2">
              {page > 1 ? (
                <Link
                  href={getPageUrl(page - 1)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-semibold transition-all flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Previous
                </Link>
              ) : (
                <span className="px-3.5 py-2 rounded-xl bg-slate-900/50 border border-slate-900 text-slate-600 text-xs font-semibold cursor-not-allowed flex items-center gap-1">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Previous
                </span>
              )}

              {page < totalPages ? (
                <Link
                  href={getPageUrl(page + 1)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-semibold transition-all flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <span className="px-3.5 py-2 rounded-xl bg-slate-900/50 border border-slate-900 text-slate-600 text-xs font-semibold cursor-not-allowed flex items-center gap-1">
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
