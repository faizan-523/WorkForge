'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  ProjectFormSchema,
  PROJECT_CATEGORIES,
  EXPERIENCE_LEVELS,
  type ProjectFormValues,
} from '@/lib/validations/project';
import { createProject, updateProject, type ProjectActionResult } from '@/lib/actions/projects';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  DollarSign,
  Calendar,
  Layers,
  X,
  Plus,
  FileText,
  Paperclip,
  Award,
} from 'lucide-react';

interface ProjectFormProps {
  initialData?: {
    id: string;
    title: string;
    description: string;
    category: string;
    experienceLevel: 'ENTRY' | 'INTERMEDIATE' | 'EXPERT' | string;
    budget: number;
    deadline: string | Date;
    skills: string;
    attachments?: string | null;
    status?: string;
  };
  mode?: 'create' | 'edit';
}

const inputClass =
  'w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200';

const labelClass = 'text-sm font-semibold text-slate-300';
const errorTextClass = 'text-xs text-red-400 mt-1';

export default function ProjectForm({ initialData, mode = 'create' }: ProjectFormProps) {
  const router = useRouter();

  // Format initial deadline date to YYYY-MM-DD for date input
  const defaultDeadline = initialData?.deadline
    ? new Date(initialData.deadline).toISOString().split('T')[0]
    : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(ProjectFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || PROJECT_CATEGORIES[0],
      experienceLevel: (initialData?.experienceLevel as any) || 'INTERMEDIATE',
      budget: initialData?.budget || 1000,
      deadline: defaultDeadline,
      skills: initialData?.skills || '',
      attachments: initialData?.attachments || '',
    },
  });

  // ------ Skills Tag Input Management ------
  const [skillInput, setSkillInput] = useState('');
  const currentSkills = watch('skills') || '';
  const skillTags = currentSkills
    ? currentSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const addSkill = useCallback(() => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skillTags.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkillInput('');
      return;
    }
    const updated = [...skillTags, trimmed].join(', ');
    setValue('skills', updated, { shouldValidate: true });
    setSkillInput('');
  }, [skillInput, skillTags, setValue]);

  const removeSkill = useCallback(
    (index: number) => {
      const updated = skillTags.filter((_, i) => i !== index).join(', ');
      setValue('skills', updated, { shouldValidate: true });
    },
    [skillTags, setValue]
  );

  // ------ Server Error / Success state ------
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  async function onSubmit(data: ProjectFormValues) {
    setServerError('');
    setSuccess(false);

    let result: ProjectActionResult;

    if (mode === 'edit' && initialData?.id) {
      result = await updateProject(initialData.id, data);
    } else {
      result = await createProject(data);
    }

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        if (result.projectId) {
          router.push(`/projects/${result.projectId}`);
        } else {
          router.push('/projects');
        }
      }, 1000);
    } else {
      setServerError(result.error || 'Failed to save project.');
    }
  }

  function fieldError(name: keyof ProjectFormValues) {
    const err = errors[name];
    if (!err?.message) return null;
    return <p className={errorTextClass}>{err.message as string}</p>;
  }

  return (
    <div className="glass-panel-glow rounded-2xl p-8 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
          <Briefcase className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">
            {mode === 'edit' ? 'Edit Project' : 'Post a New Project'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'edit'
              ? 'Update project details, scope, or budget'
              : 'Connect with expert freelancers across development, design, and more'}
          </p>
        </div>
      </div>

      {serverError && (
        <div className="flex items-center space-x-2 text-sm text-red-400 bg-red-500/5 border border-red-500/10 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{serverError}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-2 text-sm text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <p>{mode === 'edit' ? 'Project updated successfully!' : 'Project created! Redirecting...'}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Project Title */}
        <div className="space-y-2">
          <label className={labelClass}>
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Project Title
            </span>
          </label>
          <input
            {...register('title')}
            placeholder="e.g., Build a Modern Next.js E-Commerce Web App"
            className={inputClass}
          />
          {fieldError('title')}
        </div>

        {/* Category & Experience Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={labelClass}>
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Category
              </span>
            </label>
            <select {...register('category')} className={inputClass}>
              {PROJECT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900 text-slate-100">
                  {cat}
                </option>
              ))}
            </select>
            {fieldError('category')}
          </div>

          <div className="space-y-2">
            <label className={labelClass}>
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-slate-400" />
                Experience Level
              </span>
            </label>
            <select {...register('experienceLevel')} className={inputClass}>
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level} value={level} className="bg-slate-900 text-slate-100">
                  {level.charAt(0) + level.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            {fieldError('experienceLevel')}
          </div>
        </div>

        {/* Budget & Deadline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={labelClass}>
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                Project Budget (USD $)
              </span>
            </label>
            <input
              type="number"
              step="1"
              {...register('budget', { valueAsNumber: true })}
              placeholder="e.g. 1500"
              className={inputClass}
            />
            {fieldError('budget')}
          </div>

          <div className="space-y-2">
            <label className={labelClass}>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Deadline
              </span>
            </label>
            <input type="date" {...register('deadline')} className={inputClass} />
            {fieldError('deadline')}
          </div>
        </div>

        {/* Required Skills */}
        <div className="space-y-2">
          <label className={labelClass}>Required Skills</label>
          {skillTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {skillTags.map((skill, idx) => (
                <span
                  key={`${skill}-${idx}`}
                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 group hover:border-red-500/30 hover:bg-red-500/5 transition-colors duration-150 cursor-pointer"
                  onClick={() => removeSkill(idx)}
                >
                  {skill}
                  <X className="w-3 h-3 opacity-50 group-hover:opacity-100 group-hover:text-red-400 transition-opacity" />
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="Add skill (e.g. React, Tailwind) and press Enter..."
              className={`${inputClass} flex-1`}
            />
            <button
              type="button"
              onClick={addSkill}
              className="shrink-0 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white hover:border-indigo-500/40 transition-all duration-150"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <input type="hidden" {...register('skills')} />
          {fieldError('skills')}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className={labelClass}>
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Detailed Description
            </span>
          </label>
          <textarea
            {...register('description')}
            rows={6}
            placeholder="Describe the project scope, key deliverables, technologies involved, and expectations..."
            className={`${inputClass} resize-none`}
          />
          {fieldError('description')}
        </div>

        {/* Optional Attachments / Links */}
        <div className="space-y-2">
          <label className={labelClass}>
            <span className="flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-slate-400" />
              Attachment URL / Reference Link (Optional)
            </span>
          </label>
          <input
            {...register('attachments')}
            placeholder="https://figma.com/... or https://drive.google.com/..."
            className={inputClass}
          />
          {fieldError('attachments')}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update Project' : 'Publish Project'}</span>
        </button>
      </form>
    </div>
  );
}
