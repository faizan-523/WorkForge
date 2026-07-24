import Link from 'next/link';
import { Briefcase, Shield, MessageSquare, Award, ArrowRight, Star } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between overflow-x-hidden">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent glow-text">
              WorkForge
            </span>
          </Link>
          <nav className="hidden md:flex space-x-8 text-sm font-medium text-slate-300">
            <Link href="/projects" className="hover:text-indigo-400 transition-colors">
              Browse Projects
            </Link>
            <Link href="/projects/new" className="hover:text-indigo-400 transition-colors">
              Post a Project
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow container mx-auto px-6 py-12 md:py-24 flex flex-col items-center text-center relative">
        {/* Dynamic Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />

        <div className="max-w-4xl space-y-6 animate-float">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-950/20 text-xs font-semibold text-indigo-400 mb-4">
            <Star className="w-3.5 h-3.5 fill-indigo-400" />
            <span>The Premier Freelance Marketplace</span>
          </div>

          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight leading-tight">
            Forge Your Career. <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent leading-none">
              Find Your Talent.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            WorkForge connects businesses looking for exceptional expertise with top freelancers worldwide. 
            Enjoy secure contracts, direct messaging, and seamless hiring.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
            <Link
              href="/register?role=CLIENT"
              className="w-full sm:w-auto px-8 py-4 text-base font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span>Hire Top Talent</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/projects"
              className="w-full sm:w-auto px-8 py-4 text-base font-semibold rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-200 hover:text-white transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Find Freelance Projects</span>
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <section className="w-full max-w-5xl mt-20 md:mt-32 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { metric: '$12M+', label: 'Total Paid to Freelancers' },
            { metric: '85k+', label: 'Active Projects Completed' },
            { metric: '120k+', label: 'Talented Professionals' },
            { metric: '99.7%', label: 'Job Success Rate' },
          ].map((stat, i) => (
            <div
              key={i}
              className="glass-panel p-6 rounded-2xl flex flex-col justify-center items-center hover:border-slate-700 transition-all duration-300"
            >
              <span className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                {stat.metric}
              </span>
              <span className="text-xs md:text-sm text-slate-400 mt-2 font-medium">
                {stat.label}
              </span>
            </div>
          ))}
        </section>

        {/* Features Grid */}
        <section className="w-full max-w-5xl mt-24 md:mt-36 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold">Why Choose WorkForge?</h2>
            <p className="text-slate-400 max-w-md mx-auto">
              Everything you need to successfully hire, collaborate, and scale your operations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="glass-panel p-8 rounded-2xl space-y-4 hover:border-indigo-500/30 transition-all duration-300">
              <div className="p-3 bg-indigo-500/10 rounded-xl w-fit border border-indigo-500/20 text-indigo-400">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100">Simple Project Flow</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Post detailed jobs with required experience levels, budgets, and categories. 
                Receive and compare proposals from verified experts.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-2xl space-y-4 hover:border-purple-500/30 transition-all duration-300">
              <div className="p-3 bg-purple-500/10 rounded-xl w-fit border border-purple-500/20 text-purple-400">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100">Secure Collaborations</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Use built-in contracts to handle agreements. Client funds are protected, 
                and payments are released when milestones are completed.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-2xl space-y-4 hover:border-indigo-500/30 transition-all duration-300">
              <div className="p-3 bg-indigo-500/10 rounded-xl w-fit border border-indigo-500/20 text-indigo-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100">Integrated Messaging</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Communicate securely in real-time. Negotiate terms, submit drafts, 
                and give project feedback right inside the platform.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-sm text-slate-500">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-semibold text-slate-400">&copy; 2026 WorkForge Inc. All rights reserved.</span>
          <div className="flex space-x-6">
            <Link href="/projects" className="hover:text-slate-300 transition-colors">
              Projects
            </Link>
            <Link href="/login" className="hover:text-slate-300 transition-colors">
              Login
            </Link>
            <Link href="/register" className="hover:text-slate-300 transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
