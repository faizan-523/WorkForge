'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ForgotPasswordSchema,
  type ForgotPasswordValues,
} from '@/lib/validations/password-reset';
import { requestPasswordReset } from '@/lib/actions/auth';
import { KeyRound, Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resetUrl, setResetUrl] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(data: ForgotPasswordValues) {
    setServerError('');
    setSuccessMsg('');
    setResetUrl('');

    const res = await requestPasswordReset(data);
    if (res.success) {
      setSuccessMsg(res.message || 'Reset link sent!');
      if (res.resetUrl) setResetUrl(res.resetUrl);
    } else {
      setServerError(res.error || 'Failed to process request.');
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-6">
        <Link href="/" className="flex items-center justify-center space-x-2">
          <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent glow-text">
            WorkForge
          </span>
        </Link>

        <div className="glass-panel-glow rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-100">Forgot Password</h1>
            <p className="text-xs text-slate-400">
              Enter your email address and we&apos;ll send you a password reset link.
            </p>
          </div>

          {serverError && (
            <div className="flex items-center space-x-2 text-xs text-red-400 bg-red-500/5 border border-red-500/10 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{serverError}</p>
            </div>
          )}

          {successMsg && (
            <div className="space-y-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 text-xs text-emerald-400">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <p>{successMsg}</p>
              </div>
              {resetUrl && (
                <div className="pt-2 border-t border-emerald-500/20 space-y-1">
                  <p className="font-semibold text-slate-300">Development Direct Link:</p>
                  <Link
                    href={resetUrl}
                    className="text-indigo-400 hover:underline break-all text-[11px]"
                  >
                    {resetUrl}
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  {...register('email')}
                  placeholder="you@example.com"
                  className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all"
                />
              </div>
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isSubmitting ? 'Sending Link...' : 'Send Reset Link'}</span>
            </button>
          </form>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
