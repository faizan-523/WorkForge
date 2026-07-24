'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ProposalFormSchema, type ProposalFormValues } from '@/lib/validations/proposal';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export type ProposalActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  proposalId?: string;
};

// ---------------------------------------------------------------------------
// Submit Proposal — Freelancers only
// ---------------------------------------------------------------------------
export async function submitProposal(
  projectId: string,
  data: ProposalFormValues
): Promise<ProposalActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: 'You must be signed in to submit a proposal.' };
  }

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  if (role !== 'FREELANCER' && role !== 'ADMIN') {
    return { success: false, error: 'Only freelancer accounts can submit proposals.' };
  }

  // Validate form data with Zod
  const parsed = ProposalFormSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.');
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return { success: false, error: 'Validation failed.', fieldErrors };
  }

  const { bidAmount, durationDays, coverLetter } = parsed.data;

  try {
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { clientId: true, title: true, status: true },
    });

    if (!project) {
      return { success: false, error: 'Project not found.' };
    }

    if (project.status !== 'OPEN') {
      return { success: false, error: 'This project is no longer accepting proposals.' };
    }

    if (project.clientId === userId) {
      return { success: false, error: 'You cannot submit a proposal to your own project.' };
    }

    // Check for existing proposal
    const existing = await db.proposal.findFirst({
      where: { projectId, freelancerId: userId },
    });

    if (existing) {
      return { success: false, error: 'You have already submitted a proposal for this project.' };
    }

    const proposal = await db.proposal.create({
      data: {
        projectId,
        freelancerId: userId,
        bidAmount,
        coverLetter,
        durationDays,
        status: 'PENDING',
      },
    });

    // Notify the client
    await db.notification.create({
      data: {
        userId: project.clientId,
        title: 'New Proposal Received',
        content: `A freelancer submitted a proposal ($${bidAmount}) for "${project.title}"`,
        type: 'NEW_APPLICATION',
        link: `/projects/${projectId}`,
      },
    });

    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/dashboard');

    return { success: true, proposalId: proposal.id };
  } catch (error: any) {
    console.error('[submitProposal] Error:', error);
    return { success: false, error: error.message || 'Failed to submit proposal.' };
  }
}

// ---------------------------------------------------------------------------
// Withdraw Proposal — Freelancer owner only
// ---------------------------------------------------------------------------
export async function withdrawProposal(proposalId: string): Promise<ProposalActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: 'You must be signed in to withdraw a proposal.' };
  }

  const userId = (session.user as any).id;

  try {
    const proposal = await db.proposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal || (proposal.freelancerId !== userId && (session.user as any).role !== 'ADMIN')) {
      return { success: false, error: 'Unauthorized — you cannot withdraw this proposal.' };
    }

    await db.proposal.update({
      where: { id: proposalId },
      data: { status: 'WITHDRAWN' },
    });

    revalidatePath(`/projects/${proposal.projectId}`);
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error: any) {
    console.error('[withdrawProposal] Error:', error);
    return { success: false, error: error.message || 'Failed to withdraw proposal.' };
  }
}

// ---------------------------------------------------------------------------
// Decision on Proposal (ACCEPT or REJECT) — Client project owner only
// ---------------------------------------------------------------------------
export async function updateProposalStatus(
  proposalId: string,
  decision: 'ACCEPTED' | 'REJECTED'
): Promise<ProposalActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: 'You must be signed in to update a proposal.' };
  }

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  try {
    const proposal = await db.proposal.findUnique({
      where: { id: proposalId },
      include: {
        project: {
          select: { clientId: true, title: true },
        },
      },
    });

    if (!proposal || (proposal.project.clientId !== userId && role !== 'ADMIN')) {
      return { success: false, error: 'Unauthorized — you do not own this project.' };
    }

    if (decision === 'ACCEPTED') {
      await db.$transaction(async (tx) => {
        // Accept target proposal
        await tx.proposal.update({
          where: { id: proposalId },
          data: { status: 'ACCEPTED' },
        });

        // Close the project
        await tx.project.update({
          where: { id: proposal.projectId },
          data: { status: 'CLOSED' },
        });

        // Reject other pending proposals for this project
        await tx.proposal.updateMany({
          where: {
            projectId: proposal.projectId,
            id: { not: proposalId },
            status: 'PENDING',
          },
          data: { status: 'REJECTED' },
        });

        // Notify freelancer
        await tx.notification.create({
          data: {
            userId: proposal.freelancerId,
            title: 'Proposal Accepted! 🎉',
            content: `Your proposal for "${proposal.project.title}" has been accepted!`,
            type: 'PROJECT_ACCEPTED',
            link: `/projects/${proposal.projectId}`,
          },
        });
      });
    } else {
      // REJECTED
      await db.proposal.update({
        where: { id: proposalId },
        data: { status: 'REJECTED' },
      });

      await db.notification.create({
        data: {
          userId: proposal.freelancerId,
          title: 'Proposal Update',
          content: `Your proposal for "${proposal.project.title}" was not accepted.`,
          type: 'PROJECT_REJECTED',
          link: `/projects/${proposal.projectId}`,
        },
      });
    }

    revalidatePath(`/projects/${proposal.projectId}`);
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error: any) {
    console.error('[updateProposalStatus] Error:', error);
    return { success: false, error: error.message || 'Failed to update proposal status.' };
  }
}
