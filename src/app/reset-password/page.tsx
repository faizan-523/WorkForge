import Link from 'next/link';
import ResetPasswordForm from './ResetPasswordForm';

interface SearchParams {
  token?: string;
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await searchParams;
  const token = resolvedParams.token || '';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-6">
        <Link href="/" className="flex items-center justify-center space-x-2">
          <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent glow-text">
            WorkForge
          </span>
        </Link>

        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
