'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ProfileFormSchema,
  FreelancerProfileFormSchema,
  ClientProfileFormSchema,
  type ProfileFormValues,
  type SocialLinks,
} from '@/lib/validations/profile';
import { updateProfile, type ProfileActionResult } from '@/lib/actions/profiles';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  Linkedin,
  Github,
  Twitter,
  Globe,
  DollarSign,
  Briefcase,
  User as UserIcon,
  FileText,
  Image as ImageIcon,
  Building2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface UserWithProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  profile: {
    title?: string | null;
    bio?: string | null;
    skills?: string | null;
    hourlyRate?: number | null;
    resumeUrl?: string | null;
    imageUrl?: string | null;
    companyName?: string | null;
    companyLogo?: string | null;
    socialLinks?: string | null;
  } | null;
}

interface ProfileFormProps {
  user: UserWithProfile;
  role: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseSocialLinks(raw?: string | null): SocialLinks {
  if (!raw) return { linkedin: '', github: '', twitter: '', website: '' };
  try {
    const parsed = JSON.parse(raw);
    return {
      linkedin: parsed.linkedin || '',
      github: parsed.github || '',
      twitter: parsed.twitter || '',
      website: parsed.website || '',
    };
  } catch {
    return { linkedin: '', github: '', twitter: '', website: '' };
  }
}

// ---------------------------------------------------------------------------
// Shared input classes
// ---------------------------------------------------------------------------
const inputClass =
  'w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200';

const labelClass = 'text-sm font-semibold text-slate-300';

const errorTextClass = 'text-xs text-red-400 mt-1';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ProfileForm({ user, role }: ProfileFormProps) {
  const profile = user.profile;
  const socialLinks = parseSocialLinks(profile?.socialLinks);

  // Pick the right schema branch based on role
  const schema = role === 'FREELANCER' ? FreelancerProfileFormSchema : ClientProfileFormSchema;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues:
      role === 'FREELANCER'
        ? {
            role: 'FREELANCER' as const,
            name: user.name,
            imageUrl: profile?.imageUrl || '',
            title: profile?.title || '',
            bio: profile?.bio || '',
            skills: profile?.skills || '',
            hourlyRate: profile?.hourlyRate ?? 0,
            resumeUrl: profile?.resumeUrl || '',
            socialLinks,
          }
        : {
            role: 'CLIENT' as const,
            name: user.name,
            imageUrl: profile?.imageUrl || '',
            companyName: profile?.companyName || '',
            companyLogo: profile?.companyLogo || '',
            socialLinks,
          },
  });

  // ------ Skills tag input state (freelancer only) ------
  const [skillInput, setSkillInput] = useState('');
  const currentSkills = watch('role') === 'FREELANCER' ? (watch as any)('skills') as string : '';
  const skillTags = currentSkills
    ? currentSkills
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
    : [];

  const addSkill = useCallback(() => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    // Avoid duplicates (case-insensitive)
    if (skillTags.some((s: string) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkillInput('');
      return;
    }
    const updated = [...skillTags, trimmed].join(', ');
    setValue('skills' as any, updated, { shouldValidate: true });
    setSkillInput('');
  }, [skillInput, skillTags, setValue]);

  const removeSkill = useCallback(
    (index: number) => {
      const updated = skillTags.filter((_: string, i: number) => i !== index).join(', ');
      setValue('skills' as any, updated, { shouldValidate: true });
    },
    [skillTags, setValue]
  );

  // ------ Social links toggle ------
  const [showSocials, setShowSocials] = useState(() => {
    return !!(socialLinks.linkedin || socialLinks.github || socialLinks.twitter || socialLinks.website);
  });

  // ------ Submit state ------
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  // Auto-dismiss success toast
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(false), 4000);
    return () => clearTimeout(t);
  }, [success]);

  async function onSubmit(data: ProfileFormValues) {
    setServerError('');
    setSuccess(false);

    const result: ProfileActionResult = await updateProfile(data);

    if (result.success) {
      setSuccess(true);
    } else {
      setServerError(result.error || 'Something went wrong.');
    }
  }

  // ------ Render helpers ------
  function fieldError(name: string) {
    // Navigate nested errors (e.g. "socialLinks.linkedin")
    const parts = name.split('.');
    let err: any = errors;
    for (const p of parts) {
      err = err?.[p];
    }
    if (!err?.message) return null;
    return <p className={errorTextClass}>{err.message as string}</p>;
  }

  return (
    <div className="glass-panel-glow rounded-2xl p-8 space-y-6">
      {/* ---------- Avatar & user info ---------- */}
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-indigo-600/20">
          {user.name[0]?.toUpperCase() ?? 'U'}
        </div>
        <div>
          <p className="text-lg font-bold text-slate-100">{user.name}</p>
          <p className="text-sm text-slate-400">{user.email}</p>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {role}
          </span>
        </div>
      </div>

      {/* ---------- Alerts ---------- */}
      {serverError && (
        <div className="flex items-center space-x-2 text-sm text-red-400 bg-red-500/5 border border-red-500/10 rounded-xl p-3 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{serverError}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center space-x-2 text-sm text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <p>Profile updated successfully!</p>
        </div>
      )}

      {/* ---------- Form ---------- */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Hidden role field */}
        <input type="hidden" {...register('role')} />

        {/* ====== Shared: Name ====== */}
        <div className="space-y-2">
          <label className={labelClass}>
            <span className="flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-slate-400" />
              Full Name
            </span>
          </label>
          <input
            {...register('name')}
            placeholder="Your full name"
            className={inputClass}
          />
          {fieldError('name')}
        </div>

        {/* ====== Shared: Profile Image URL ====== */}
        <div className="space-y-2">
          <label className={labelClass}>
            <span className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
              Profile Image URL
            </span>
          </label>
          <input
            {...register('imageUrl')}
            placeholder="https://example.com/avatar.jpg"
            className={inputClass}
          />
          {fieldError('imageUrl')}
        </div>

        {/* ====== Freelancer-specific fields ====== */}
        {role === 'FREELANCER' && (
          <>
            {/* Professional Title */}
            <div className="space-y-2">
              <label className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  Professional Title
                </span>
              </label>
              <input
                {...register('title' as any)}
                placeholder="e.g. Full-Stack Developer"
                className={inputClass}
              />
              {fieldError('title')}
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Professional Bio
                </span>
              </label>
              <textarea
                {...register('bio' as any)}
                rows={4}
                placeholder="Tell clients about your experience, strengths, and what you're passionate about..."
                className={`${inputClass} resize-none`}
              />
              {fieldError('bio')}
            </div>

            {/* Skills — tag input */}
            <div className="space-y-2">
              <label className={labelClass}>Skills</label>
              {/* Tag display */}
              {skillTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {skillTags.map((skill: string, idx: number) => (
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
              {/* Input row */}
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
                  placeholder="Type a skill and press Enter..."
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
              {/* Hidden field that stores comma-separated skills */}
              <input type="hidden" {...register('skills' as any)} />
              {fieldError('skills')}
            </div>

            {/* Hourly Rate & Resume URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClass}>
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    Hourly Rate (USD)
                  </span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('hourlyRate' as any, { valueAsNumber: true })}
                  placeholder="e.g. 75"
                  className={inputClass}
                />
                {fieldError('hourlyRate')}
              </div>
              <div className="space-y-2">
                <label className={labelClass}>
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    Resume URL
                  </span>
                </label>
                <input
                  {...register('resumeUrl' as any)}
                  placeholder="https://..."
                  className={inputClass}
                />
                {fieldError('resumeUrl')}
              </div>
            </div>
          </>
        )}

        {/* ====== Client-specific fields ====== */}
        {role === 'CLIENT' && (
          <>
            <div className="space-y-2">
              <label className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  Company Name
                </span>
              </label>
              <input
                {...register('companyName' as any)}
                placeholder="e.g. Acme Corporation"
                className={inputClass}
              />
              {fieldError('companyName')}
            </div>
            <div className="space-y-2">
              <label className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                  Company Logo URL
                </span>
              </label>
              <input
                {...register('companyLogo' as any)}
                placeholder="https://..."
                className={inputClass}
              />
              {fieldError('companyLogo')}
            </div>
          </>
        )}

        {/* ====== Social Links (collapsible) ====== */}
        <div className="border border-slate-800/80 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowSocials((p) => !p)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors duration-150"
          >
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400" />
              Social Links
            </span>
            {showSocials ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {showSocials && (
            <div className="px-4 pb-4 space-y-3 border-t border-slate-800/60 pt-3">
              {/* LinkedIn */}
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register('socialLinks.linkedin' as any)}
                  placeholder="https://linkedin.com/in/username"
                  className={`${inputClass} pl-10`}
                />
                {fieldError('socialLinks.linkedin')}
              </div>
              {/* GitHub */}
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register('socialLinks.github' as any)}
                  placeholder="https://github.com/username"
                  className={`${inputClass} pl-10`}
                />
                {fieldError('socialLinks.github')}
              </div>
              {/* Twitter */}
              <div className="relative">
                <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register('socialLinks.twitter' as any)}
                  placeholder="https://x.com/username"
                  className={`${inputClass} pl-10`}
                />
                {fieldError('socialLinks.twitter')}
              </div>
              {/* Website */}
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register('socialLinks.website' as any)}
                  placeholder="https://yourwebsite.com"
                  className={`${inputClass} pl-10`}
                />
                {fieldError('socialLinks.website')}
              </div>
            </div>
          )}
        </div>

        {/* ====== Submit ====== */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{isSubmitting ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </form>
    </div>
  );
}
