'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/lib/actions/auth';
import { Loader2, AlertCircle, CheckCircle2, Briefcase, Code } from 'lucide-react';

type Role = 'CLIENT' | 'FREELANCER';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('FREELANCER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const result = await registerUser({ email, name, role, password });

    if (result.success) {
      setSuccess(result.message || 'Account created!');
      setTimeout(() => router.push('/login'), 1800);
    } else {
      setError(result.error || 'Registration failed.');
    }
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden py-12">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] rounded-full bg-purple-600/8 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <Link href="/" className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent glow-text">
            WorkForge
          </Link>
          <h2 className="text-2xl font-bold text-slate-100 mt-4">Create your account</h2>
          <p className="text-slate-400 text-sm">Join thousands of professionals worldwide</p>
        </div>

        <div className="glass-panel-glow rounded-2xl p-8 space-y-6">
          {/* Role Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">I want to...</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('FREELANCER')}
                className={`flex flex-col items-center space-y-2 p-4 rounded-xl border transition-all duration-200 ${
                  role === 'FREELANCER'
                    ? 'border-indigo-500/60 bg-indigo-600/10 text-indigo-400'
                    : 'border-slate-700 bg-slate-800/30 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Code className="w-6 h-6" />
                <span className="text-xs font-semibold">Work as Freelancer</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('CLIENT')}
                className={`flex flex-col items-center space-y-2 p-4 rounded-xl border transition-all duration-200 ${
                  role === 'CLIENT'
                    ? 'border-purple-500/60 bg-purple-600/10 text-purple-400'
                    : 'border-slate-700 bg-slate-800/30 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Briefcase className="w-6 h-6" />
                <span className="text-xs font-semibold">Hire Freelancers</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-sm text-red-400 bg-red-500/5 border border-red-500/10 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center space-x-2 text-sm text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <p>{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Jane Smith"
                className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Email Address</label>
              <input
                type="email"
                id="reg-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <input
                type="password"
                id="reg-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="At least 6 characters"
                className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>

            <button
              type="submit"
              id="register-btn"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all duration-200 disabled:opacity-60 flex items-center justify-center space-x-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>{isLoading ? 'Creating account...' : `Join as ${role === 'CLIENT' ? 'Client' : 'Freelancer'}`}</span>
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
