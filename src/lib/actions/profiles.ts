'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ProfileFormSchema, type ProfileFormValues, type SocialLinks } from '@/lib/validations/profile';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// ---------------------------------------------------------------------------
// Return type for the server action
// ---------------------------------------------------------------------------
export type ProfileActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

// ---------------------------------------------------------------------------
// Unified profile update — authenticates, validates, transacts
// ---------------------------------------------------------------------------
export async function updateProfile(
  data: ProfileFormValues
): Promise<ProfileActionResult> {
  // 1. Authenticate
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: 'You must be signed in to update your profile.' };
  }

  const userId = (session.user as any).id;
  const sessionRole = (session.user as any).role as string;

  // Prevent role spoofing — the submitted role must match the session role
  if (data.role !== sessionRole) {
    return { success: false, error: 'Role mismatch — you cannot update a profile for a different role.' };
  }

  // 2. Validate
  const parsed = ProfileFormSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.');
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return { success: false, error: 'Validation failed.', fieldErrors };
  }

  const validated = parsed.data;

  // 3. Transact — update User.name + upsert Profile atomically
  try {
    await db.$transaction(async (tx) => {
      // Update user name
      await tx.user.update({
        where: { id: userId },
        data: { name: validated.name },
      });

      // Build profile payload depending on role
      const socialLinksJson = validated.socialLinks
        ? JSON.stringify(validated.socialLinks)
        : null;

      if (validated.role === 'FREELANCER') {
        await tx.profile.upsert({
          where: { userId },
          update: {
            title: validated.title,
            bio: validated.bio,
            skills: validated.skills,
            hourlyRate: validated.hourlyRate ?? null,
            resumeUrl: validated.resumeUrl || null,
            imageUrl: validated.imageUrl || null,
            socialLinks: socialLinksJson,
          },
          create: {
            userId,
            title: validated.title,
            bio: validated.bio,
            skills: validated.skills,
            hourlyRate: validated.hourlyRate ?? null,
            resumeUrl: validated.resumeUrl || null,
            imageUrl: validated.imageUrl || null,
            socialLinks: socialLinksJson,
          },
        });
      } else {
        // CLIENT
        await tx.profile.upsert({
          where: { userId },
          update: {
            companyName: validated.companyName,
            companyLogo: validated.companyLogo || null,
            imageUrl: validated.imageUrl || null,
            socialLinks: socialLinksJson,
          },
          create: {
            userId,
            companyName: validated.companyName,
            companyLogo: validated.companyLogo || null,
            imageUrl: validated.imageUrl || null,
            socialLinks: socialLinksJson,
          },
        });
      }
    });

    // 4. Revalidate relevant paths
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/profile');

    return { success: true };
  } catch (error: any) {
    console.error('[updateProfile] Transaction failed:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while saving your profile. Please try again.',
    };
  }
}
