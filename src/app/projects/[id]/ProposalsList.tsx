'use client';

import { useState } from 'react';
import { updateProposalStatus } from '@/lib/actions/proposals';
import { CheckCircle, XCircle, DollarSign, Clock, Loader2, Filter } from 'lucide-react';

interface Proposal {
  id: string;
  bidAmount: number;
  coverLetter: string;
  durationDays: number;
  status: string;
  createdAt: Date;
  freelancer: {
    id: string;
    name: string;
    profile: {
      title?: string | null;
      skills?: string | null;
      imageUrl?: string | null;
      hourlyRate?: number | null;
    } | null;
  };
}

export default function ProposalsList({
  proposals,
  clientId,
  projectId,
}: {
  proposals: Proposal[];
  clientId: string;
  projectId: string;
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('ALL');

  async function decide(proposalId: string, decision: 'ACCEPTED' | 'REJECTED') {
    setLoadingId(proposalId);
    const result = await updateProposalStatus(proposalId, decision);
    if (result.success) {
      setStatuses((prev) => ({ ...prev, [proposalId]: decision }));
    }
    setLoadingId(null);
  }

  const filteredProposals = proposals.filter((p) => {
    const status = statuses[p.id] || p.status;
    if (filter === 'ALL') return true;
    return status === filter;
  });

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-5">
      {/* Header & Status Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <h2 className="text-base font-bold text-slate-100">
          Proposals ({proposals.length})
        </h2>
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
          {(['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filter === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {filteredProposals.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">
          {filter === 'ALL'
            ? 'No proposals submitted yet. Share your project to receive bids.'
            : `No ${filter.toLowerCase()} proposals found.`}
        </p>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((p) => {
            const currentStatus = statuses[p.id] || p.status;

            return (
              <div key={p.id} className="bg-slate-800/30 border border-slate-800/80 rounded-xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {p.freelancer.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-200 text-sm">{p.freelancer.name}</p>
                      <p className="text-xs text-slate-400">{p.freelancer.profile?.title || 'Freelancer'}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                      currentStatus === 'PENDING'
                        ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                        : currentStatus === 'ACCEPTED'
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : 'text-red-400 bg-red-500/10 border-red-500/20'
                    }`}
                  >
                    {currentStatus}
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-xs">
                  <div className="flex items-center space-x-1 text-emerald-400 font-bold">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>${p.bidAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{p.durationDays} days</span>
                  </div>
                  {p.freelancer.profile?.hourlyRate && (
                    <div className="text-slate-500">
                      Rate: <span className="text-slate-300 font-semibold">${p.freelancer.profile.hourlyRate}/hr</span>
                    </div>
                  )}
                </div>

                {p.freelancer.profile?.skills && (
                  <div className="flex flex-wrap gap-1">
                    {p.freelancer.profile.skills
                      .split(',')
                      .slice(0, 5)
                      .map((skill) => (
                        <span
                          key={skill}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                  </div>
                )}

                <div className="pt-1">
                  <p className="text-xs font-semibold text-slate-400 mb-1">Cover Letter:</p>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900/50 p-3 rounded-lg border border-slate-800/60">
                    {p.coverLetter}
                  </p>
                </div>

                {currentStatus === 'PENDING' && (
                  <div className="flex gap-2 pt-2 border-t border-slate-800/40">
                    <button
                      onClick={() => decide(p.id, 'ACCEPTED')}
                      disabled={!!loadingId}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-semibold transition-all disabled:opacity-50"
                    >
                      {loadingId === p.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5" />
                      )}
                      <span>Accept Proposal</span>
                    </button>
                    <button
                      onClick={() => decide(p.id, 'REJECTED')}
                      disabled={!!loadingId}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold transition-all disabled:opacity-50"
                    >
                      {loadingId === p.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
