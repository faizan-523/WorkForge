'use client';

import { useState } from 'react';
import ProposalForm from '@/app/projects/[id]/ProposalForm';
import { Send, X, Briefcase } from 'lucide-react';

interface ApplyModalProps {
  projectId: string;
  projectTitle: string;
  budget: number;
}

export default function ApplyModal({ projectId, projectTitle, budget }: ApplyModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all duration-200 flex items-center justify-center gap-2"
      >
        <Send className="w-4 h-4" />
        <span>Apply for this Job</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel-glow rounded-2xl p-6 w-full max-w-lg space-y-5 relative max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-base line-clamp-1">{projectTitle}</h3>
                <p className="text-xs text-slate-400">
                  Client Budget: <span className="text-emerald-400 font-bold">${budget.toLocaleString()}</span>
                </p>
              </div>
            </div>

            <ProposalForm projectId={projectId} onSuccess={() => setTimeout(() => setIsOpen(false), 1500)} />
          </div>
        </div>
      )}
    </>
  );
}
