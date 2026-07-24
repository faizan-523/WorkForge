import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import ProjectForm from '@/components/projects/ProjectForm';

export default async function NewProjectPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const role = (session.user as any).role;
  if (role !== 'CLIENT' && role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header title="Post a New Project" subtitle="Create a project to connect with top freelancers" />
      <main className="container mx-auto px-6 py-10 flex-1">
        <ProjectForm mode="create" />
      </main>
    </div>
  );
}
