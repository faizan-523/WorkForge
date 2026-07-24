import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProposalForm from './ProposalForm';
import ProposalsList from './ProposalsList';
import ProjectOwnerActions from './ProjectOwnerActions';
import { DollarSign, Clock, Users, ArrowLeft } from 'lucide-react';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;

  const project = await db.project.findUnique({
    where: { id: resolvedParams.id },
    include: {
      client: { include: { profile: true } },
      proposals: {
        include: { freelancer: { include: { profile: true } } },
        orderBy: { createdAt: 'desc' },
      },
      reviews: true,
    },
  });

  if (!project) notFound();

  const isOwner = userId === project.clientId || role === 'ADMIN';
  const isFreelancer = role === 'FREELANCER';

  const existingProposal = isFreelancer
    ? project.proposals.find((p) => p.freelancerId === userId)
    : null;

  const levelColor: Record<string, string> = {
    ENTRY: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    INTERMEDIATE: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    EXPERT: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  };

  const statusColor: Record<string, string> = {
    OPEN: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    CLOSED: 'text-red-400 bg-red-500/10 border-red-500/20',
    DRAFT: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
    COMPLETED: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-900 bg-slate-950/90 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/projects"
            className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </Link>
          <Link
            href="/"
            className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent glow-text"
          >
            WorkForge
          </Link>
          {session ? (
            <Link href="/dashboard" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              Dashboard →
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm font-semibold px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 grid lg:grid-cols-3 gap-8">
        {/* Left - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-8 space-y-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      statusColor[project.status] || 'text-slate-400'
                    }`}
                  >
                    {project.status}
                  </span>
                  <span className="text-xs text-slate-500">{project.category}</span>
                </div>
                <h1 className="text-2xl font-extrabold text-slate-100 leading-tight">
                  {project.title}
                </h1>
                <p className="text-sm text-slate-400">
                  Posted by{' '}
                  <span className="text-slate-300 font-medium">
                    {project.client.profile?.companyName || project.client.name}
                  </span>{' '}
                  &bull; {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Owner Action Buttons (Edit / Delete) */}
              {isOwner && (
                <ProjectOwnerActions projectId={project.id} currentStatus={project.status} />
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-800/60">
              <div className="text-center">
                <DollarSign className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">${project.budget.toLocaleString()}</p>
                <p className="text-xs text-slate-500">Budget</p>
              </div>
              <div className="text-center">
                <Clock className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <p className="text-sm font-bold text-white">
                  {new Date(project.deadline).toLocaleDateString()}
                </p>
                <p className="text-xs text-slate-500">Deadline</p>
              </div>
              <div className="text-center">
                <Users className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{project.proposals.length}</p>
                <p className="text-xs text-slate-500">Proposals</p>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-3">
                Project Description
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </div>

            {project.attachments && (
              <div>
                <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-2">
                  Attachment / Link
                </h2>
                <a
                  href={project.attachments}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-400 hover:underline break-all"
                >
                  {project.attachments}
                </a>
              </div>
            )}

            <div>
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-3">
                Required Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.skills.split(',').map((skill) => (
                  <span
                    key={skill}
                    className="text-sm px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  levelColor[project.experienceLevel] || 'text-slate-400'
                }`}
              >
                {project.experienceLevel} Level Required
              </span>
            </div>
          </div>

          {/* Proposals Section (for client owner) */}
          {isOwner && (
            <ProposalsList proposals={project.proposals} clientId={userId} projectId={project.id} />
          )}
        </div>

        {/* Right - Sidebar */}
        <div className="space-y-5">
          {/* Freelancer - Submit Proposal */}
          {isFreelancer && project.status === 'OPEN' && (
            <div className="glass-panel-glow rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-slate-100">
                {existingProposal ? 'Your Proposal' : 'Submit a Proposal'}
              </h3>
              {existingProposal ? (
                <div className="space-y-3">
                  <div
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border w-fit ${
                      existingProposal.status === 'PENDING'
                        ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                        : existingProposal.status === 'ACCEPTED'
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : 'text-red-400 bg-red-500/10 border-red-500/20'
                    }`}
                  >
                    {existingProposal.status}
                  </div>
                  <p className="text-sm text-slate-400">
                    Bid: <span className="text-white font-bold">${existingProposal.bidAmount}</span>
                  </p>
                  <p className="text-sm text-slate-400">
                    Duration: <span className="text-white">{existingProposal.durationDays} days</span>
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {existingProposal.coverLetter}
                  </p>
                </div>
              ) : (
                <ProposalForm projectId={project.id} freelancerId={userId} />
              )}
            </div>
          )}

          {/* Not logged in prompt */}
          {!session && project.status === 'OPEN' && (
            <div className="glass-panel rounded-2xl p-6 text-center space-y-3">
              <p className="text-sm text-slate-400">Sign in as a freelancer to submit a proposal</p>
              <Link
                href="/login"
                className="block w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* About Client */}
          <div className="glass-panel rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wide">About the Client</h3>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                {(project.client.profile?.companyName || project.client.name)[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  {project.client.profile?.companyName || project.client.name}
                </p>
                <p className="text-xs text-slate-500">
                  Member since {new Date(project.client.createdAt).getFullYear()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
