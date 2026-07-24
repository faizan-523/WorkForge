'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ResetPasswordSchema,
  type ResetPasswordValues,
} from '@/lib/validations/password-reset';
import { resetPasswordWithToken } from '@/lib/actions/auth';
import { Lock, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      token,
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: ResetPasswordValues) {
    setServerError('');
    setSuccessMsg('');

    const res = await resetPasswordWithToken(data);
    if (res.success) {
      setSuccessMsg(res.message || 'Password reset successfully!');
      setTimeout(() => router.push('/login'), 2000);
    } else {
      setServerError(res.error || 'Failed to reset password.');
    }
  }

  if (!token) {
    return (
      <div className="glass-panel-glow rounded-2xl p-8 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-100">Invalid Reset Link</h2>
        <p className="text-xs text-slate-400">
          No password reset token was provided. Please request a new password reset link.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all"
        >
          Request Reset Link
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-panel-glow rounded-2xl p-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-100">Set New Password</h1>
        <p className="text-xs text-slate-400">Enter your new password below.</p>
      </div>

      {serverError && (
        <div className="flex items-center space-x-2 text-xs text-red-400 bg-red-500/5 border border-red-500/10 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{serverError}</p>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <p>{successMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register('token')} />

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all"
            />
          </div>
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Confirm New Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="password"
              {...register('confirmPassword')}
              placeholder="••••••••"
              className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all"
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{isSubmitting ? 'Resetting Password...' : 'Reset Password'}</span>
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
  );
}
