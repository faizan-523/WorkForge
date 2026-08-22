'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteProject } from '@/lib/actions/projects';
import { Trash2, Loader2 } from 'lucide-react';

interface ProjectDeleteButtonProps {
  projectId: string;
  className?: string;
  onDeleted?: () => void;
}

export default function ProjectDeleteButton({
  projectId,
  className,
  onDeleted,
}: ProjectDeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await deleteProject(projectId);
      if (res.success) {
        if (onDeleted) {
          onDeleted();
        } else {
          router.refresh();
        }
      } else {
        alert(res.error || 'Failed to delete project');
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      title="Delete Project"
      className={
        className ||
        'px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-60'
      }
    >
      {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      <span>Delete</span>
    </button>
  );
}
