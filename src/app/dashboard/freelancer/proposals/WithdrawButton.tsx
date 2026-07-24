'use client';

import { useState } from 'react';
import { withdrawProposal } from '@/lib/actions/proposals';
import { Loader2, XCircle } from 'lucide-react';

export default function WithdrawButton({ proposalId }: { proposalId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleWithdraw() {
    if (!window.confirm('Are you sure you want to withdraw this proposal?')) return;
    setIsLoading(true);
    setError('');

    const res = await withdrawProposal(proposalId);
    if (!res.success) {
      setError(res.error || 'Failed to withdraw');
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end space-y-1">
      <button
        type="button"
        onClick={handleWithdraw}
        disabled={isLoading}
        className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
        <span>Withdraw</span>
      </button>
      {error && <p className="text-[10px] text-red-400">{error}</p>}
    </div>
  );
}
