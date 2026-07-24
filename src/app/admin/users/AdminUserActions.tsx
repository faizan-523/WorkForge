'use client';

import { useState } from 'react';
import { toggleUserStatus } from '@/lib/actions/misc';
import { Loader2, UserX, UserCheck } from 'lucide-react';

export default function AdminUserActions({ userId, currentStatus, adminId }: { userId: string; currentStatus: string; adminId: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);

  async function handleToggle() {
    setIsLoading(true);
    const result = await toggleUserStatus(userId, status, adminId);
    if (result.success && result.newStatus) {
      setStatus(result.newStatus);
    }
    setIsLoading(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
        status === 'ACTIVE'
          ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
      }`}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : status === 'ACTIVE' ? (
        <UserX className="w-3.5 h-3.5" />
      ) : (
        <UserCheck className="w-3.5 h-3.5" />
      )}
      <span>{status === 'ACTIVE' ? 'Suspend' : 'Activate'}</span>
    </button>
  );
}
