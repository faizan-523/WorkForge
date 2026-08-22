'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ProjectFormSchema, type ProjectFormValues } from '@/lib/validations/project';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export type ProjectActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  projectId?: string;
};

// ---------------------------------------------------------------------------
// Create Project — Client only
// ---------------------------------------------------------------------------
export async function createProject(
  data: ProjectFormValues
): Promise<ProjectActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: 'You must be signed in to post a project.' };
  }

  const userId = (session.user as any).id;

  const parsed = ProjectFormSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.');
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return { success: false, error: 'Validation failed.', fieldErrors };
  }

  const { title, description, budget, deadline, experienceLevel, category, skills, attachments } =
    parsed.data;

  try {
    const project = await db.project.create({
      data: {
        clientId: userId,
        title,
        description,
        budget,
        deadline: new Date(deadline),
        experienceLevel,
        category,
        skills,
        attachments: attachments || null,
        status: 'OPEN',
      },
    });

    revalidatePath('/projects');
    revalidatePath('/dashboard');

    return { success: true, projectId: project.id };
  } catch (error: any) {
    console.error('[createProject] Error:', error);
    return { success: false, error: error.message || 'Failed to create project' };
  }
}

// ---------------------------------------------------------------------------
// Update Project — Owner / Admin only
// ---------------------------------------------------------------------------
export async function updateProject(
  projectId: string,
  data: ProjectFormValues & { status?: string }
): Promise<ProjectActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: 'You must be signed in to edit a project.' };
  }

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return { success: false, error: 'Project not found' };
  }

  if (project.clientId !== userId && role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized — you do not own this project' };
  }

  const parsed = ProjectFormSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.');
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return { success: false, error: 'Validation failed.', fieldErrors };
  }

  const { title, description, budget, deadline, experienceLevel, category, skills, attachments } =
    parsed.data;

  try {
    await db.project.update({
      where: { id: projectId },
      data: {
        title,
        description,
        budget,
        deadline: new Date(deadline),
        experienceLevel,
        category,
        skills,
        attachments: attachments || null,
        ...(data.status ? { status: data.status } : {}),
      },
    });

    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/projects');
    revalidatePath('/dashboard');

    return { success: true, projectId };
  } catch (error: any) {
    console.error('[updateProject] Error:', error);
    return { success: false, error: error.message || 'Failed to update project' };
  }
}

// ---------------------------------------------------------------------------
// Delete Project — Owner / Admin only
// ---------------------------------------------------------------------------
export async function deleteProject(projectId: string): Promise<ProjectActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: 'You must be signed in to delete a project.' };
  }

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return { success: false, error: 'Project not found' };
  }

  if (project.clientId !== userId && role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized — you do not own this project' };
  }

  try {
    await db.project.delete({ where: { id: projectId } });

    revalidatePath('/projects');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error: any) {
    console.error('[deleteProject] Error:', error);
    return { success: false, error: error.message || 'Failed to delete project' };
  }
}

// ---------------------------------------------------------------------------
// Toggle Save Project Bookmark
// ---------------------------------------------------------------------------
export async function toggleSaveProject(projectId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: 'You must be signed in to bookmark projects.' };
  }

  const userId = (session.user as any).id;

  try {
    const existing = await db.savedProject.findUnique({
      where: {
        userId_projectId: { userId, projectId },
      },
    });

    if (existing) {
      await db.savedProject.delete({
        where: {
          userId_projectId: { userId, projectId },
        },
      });
      revalidatePath('/projects');
      revalidatePath(`/projects/${projectId}`);
      return { success: true, saved: false };
    } else {
      await db.savedProject.create({
        data: { userId, projectId },
      });
      revalidatePath('/projects');
      revalidatePath(`/projects/${projectId}`);
      return { success: true, saved: true };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ---------------------------------------------------------------------------
// Toggle Save Freelancer
// ---------------------------------------------------------------------------
export async function toggleSaveFreelancer(freelancerId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: 'You must be signed in to save freelancers.' };
  }

  const clientId = (session.user as any).id;

  try {
    const existing = await db.savedFreelancer.findUnique({
      where: {
        clientId_freelancerId: { clientId, freelancerId },
      },
    });

    if (existing) {
      await db.savedFreelancer.delete({
        where: {
          clientId_freelancerId: { clientId, freelancerId },
        },
      });
      return { success: true, saved: false };
    } else {
      await db.savedFreelancer.create({
        data: { clientId, freelancerId },
      });
      return { success: true, saved: true };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
