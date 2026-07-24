import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import ProjectForm from '@/components/projects/ProjectForm';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const project = await db.project.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!project) notFound();

  // Guard: Only project owner or ADMIN can edit
  if (project.clientId !== userId && role !== 'ADMIN') {
    redirect('/projects');
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header title="Edit Project" subtitle={`Update details for "${project.title}"`} />
      <main className="container mx-auto px-6 py-10 flex-1">
        <ProjectForm
          mode="edit"
          initialData={{
            id: project.id,
            title: project.title,
            description: project.description,
            category: project.category,
            experienceLevel: project.experienceLevel,
            budget: project.budget,
            deadline: project.deadline,
            skills: project.skills,
            attachments: project.attachments,
            status: project.status,
          }}
        />
      </main>
    </div>
  );
}
