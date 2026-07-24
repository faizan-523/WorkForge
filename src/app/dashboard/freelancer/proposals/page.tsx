import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import Link from 'next/link';
import { FileText, Briefcase, DollarSign, Clock, ExternalLink } from 'lucide-react';
import WithdrawButton from './WithdrawButton';

export default async function FreelancerProposalsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  if (role !== 'FREELANCER' && role !== 'ADMIN') redirect('/dashboard');

  const proposals = await db.proposal.findMany({
    where: { freelancerId: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      project: {
        include: {
          client: { select: { name: true, profile: { select: { companyName: true } } } },
        },
      },
    },
  });

  const statusColors: Record<string, string> = {
    PENDING: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    ACCEPTED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    REJECTED: 'text-red-400 bg-red-500/10 border-red-500/20',
    WITHDRAWN: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="My Proposals" subtitle="Track submitted applications and response statuses" />

      <main className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-slate-400 text-sm">
            Total Submitted: <span className="text-white font-bold">{proposals.length}</span>
          </p>
          <Link
            href="/projects"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Briefcase className="w-4 h-4" />
            Browse Open Jobs
          </Link>
        </div>

        {proposals.length === 0 ? (
          <div className="glass-panel rounded-2xl p-16 text-center text-slate-500 space-y-4">
            <FileText className="w-12 h-12 mx-auto opacity-30" />
            <p className="text-base font-medium text-slate-300">You haven't submitted any proposals yet</p>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all"
            >
              <Briefcase className="w-4 h-4" />
              Explore Jobs & Apply
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {proposals.map((proposal) => (
              <div
                key={proposal.id}
                className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-all duration-200"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        statusColors[proposal.status] || 'text-slate-400'
                      }`}
                    >
                      {proposal.status}
                    </span>
                    <span className="text-xs text-slate-500">{proposal.project.category}</span>
                  </div>

                  <Link href={`/projects/${proposal.project.id}`}>
                    <h2 className="text-base font-bold text-slate-100 hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                      {proposal.project.title}
                      <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                    </h2>
                  </Link>

                  <p className="text-xs text-slate-400">
                    Client:{' '}
                    <span className="text-slate-300 font-medium">
                      {proposal.project.client.profile?.companyName || proposal.project.client.name}
                    </span>
                  </p>

                  <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/60 mt-2">
                    <p className="text-xs font-semibold text-slate-400 mb-1">Cover Letter Snippet:</p>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {proposal.coverLetter}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 text-xs pt-1">
                    <div className="flex items-center space-x-1 text-emerald-400 font-bold">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Your Bid: ${proposal.bidAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Delivery: {proposal.durationDays} Days</span>
                    </div>
                    <div className="text-slate-500">
                      Submitted {new Date(proposal.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                  {proposal.status === 'PENDING' && (
                    <WithdrawButton proposalId={proposal.id} />
                  )}
                  <Link
                    href={`/projects/${proposal.project.id}`}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
                  >
                    View Project
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
