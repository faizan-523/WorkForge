'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteProject } from '@/lib/actions/projects';
import { Edit, Trash2, Loader2 } from 'lucide-react';

interface ProjectOwnerActionsProps {
  projectId: string;
  currentStatus: string;
}

export default function ProjectOwnerActions({ projectId }: ProjectOwnerActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    setError('');

    const res = await deleteProject(projectId);
    if (res.success) {
      router.push('/projects');
      router.refresh();
    } else {
      setError(res.error || 'Failed to delete project');
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col items-end space-y-2">
      <div className="flex items-center space-x-2">
        <Link
          href={`/projects/${projectId}/edit`}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700/60 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
        >
          <Edit className="w-3.5 h-3.5" />
          Edit
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-3.5 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-60"
        >
          {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          Delete
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
