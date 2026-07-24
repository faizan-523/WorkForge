import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import ProfileForm from './ProfileForm';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user) redirect('/login');

  // Serialize into a plain object for the client component
  const serializedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    profile: user.profile
      ? {
          title: user.profile.title,
          bio: user.profile.bio,
          skills: user.profile.skills,
          hourlyRate: user.profile.hourlyRate,
          resumeUrl: user.profile.resumeUrl,
          imageUrl: user.profile.imageUrl,
          companyName: user.profile.companyName,
          companyLogo: user.profile.companyLogo,
          socialLinks: user.profile.socialLinks,
        }
      : null,
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="My Profile" subtitle="Manage your personal and professional information" />
      <main className="p-8 max-w-3xl mx-auto">
        <ProfileForm user={serializedUser} role={role} />
      </main>
    </div>
  );
}
