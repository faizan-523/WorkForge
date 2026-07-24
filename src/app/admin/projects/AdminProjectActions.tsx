'use client';

import { useState } from 'react';
import { adminDeleteProject } from '@/lib/actions/misc';
import { Loader2, Trash2, Check } from 'lucide-react';

export default function AdminProjectActions({ projectId, adminId }: { projectId: string; adminId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function handleDelete() {
    if (!confirm) { setConfirm(true); return; }
    setIsLoading(true);
    const result = await adminDeleteProject(projectId, adminId);
    if (result.success) setDeleted(true);
    setIsLoading(false);
  }

  if (deleted) {
    return <p className="text-xs text-slate-500 text-center py-1">Project deleted.</p>;
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isLoading}
      className={`w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
        confirm
          ? 'bg-red-600 hover:bg-red-500 text-white'
          : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
      }`}
    >
      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      <span>{confirm ? 'Confirm Delete' : 'Delete Project'}</span>
    </button>
  );
}
