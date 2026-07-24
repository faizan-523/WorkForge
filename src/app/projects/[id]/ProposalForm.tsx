'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProposalFormSchema, type ProposalFormValues } from '@/lib/validations/proposal';
import { submitProposal, type ProposalActionResult } from '@/lib/actions/proposals';
import { Loader2, AlertCircle, CheckCircle2, DollarSign, Clock, FileText } from 'lucide-react';

interface ProposalFormProps {
  projectId: string;
  freelancerId?: string;
  onSuccess?: () => void;
}

const inputClass =
  'w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200';

const labelClass = 'text-xs font-semibold text-slate-400';
const errorTextClass = 'text-xs text-red-400 mt-1';

export default function ProposalForm({ projectId, onSuccess }: ProposalFormProps) {
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProposalFormValues>({
    resolver: zodResolver(ProposalFormSchema),
    defaultValues: {
      bidAmount: 500,
      durationDays: 7,
      coverLetter: '',
    },
  });

  async function onSubmit(data: ProposalFormValues) {
    setServerError('');
    setSuccessMsg('');

    const result: ProposalActionResult = await submitProposal(projectId, data);

    if (result.success) {
      setSuccessMsg('Proposal submitted successfully!');
      if (onSuccess) onSuccess();
    } else {
      setServerError(result.error || 'Failed to submit proposal.');
    }
  }

  if (successMsg) {
    return (
      <div className="flex items-center space-x-2 text-sm text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 animate-in fade-in duration-200">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        <p>{successMsg}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="flex items-center space-x-2 text-xs text-red-400 bg-red-500/5 border border-red-500/10 rounded-xl p-3">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <p>{serverError}</p>
        </div>
      )}

      {/* Bid Amount */}
      <div className="space-y-1.5">
        <label className={labelClass}>
          <span className="flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-emerald-400" />
            Your Bid Amount (USD $)
          </span>
        </label>
        <input
          type="number"
          step="1"
          {...register('bidAmount', { valueAsNumber: true })}
          placeholder="e.g. 1500"
          className={inputClass}
        />
        {errors.bidAmount && <p className={errorTextClass}>{errors.bidAmount.message}</p>}
      </div>

      {/* Duration */}
      <div className="space-y-1.5">
        <label className={labelClass}>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            Estimated Delivery (Days)
          </span>
        </label>
        <input
          type="number"
          step="1"
          {...register('durationDays', { valueAsNumber: true })}
          placeholder="e.g. 14"
          className={inputClass}
        />
        {errors.durationDays && <p className={errorTextClass}>{errors.durationDays.message}</p>}
      </div>

      {/* Cover Letter */}
      <div className="space-y-1.5">
        <label className={labelClass}>
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3 text-indigo-400" />
            Cover Letter
          </span>
        </label>
        <textarea
          {...register('coverLetter')}
          rows={4}
          placeholder="Detail your relevant experience, approach to this project, and why you are the best fit..."
          className={`${inputClass} resize-none`}
        />
        {errors.coverLetter && <p className={errorTextClass}>{errors.coverLetter.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        <span>{isSubmitting ? 'Submitting Proposal...' : 'Submit Proposal'}</span>
      </button>
    </form>
  );
}
