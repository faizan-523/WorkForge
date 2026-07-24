import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import MessagesClient from './MessagesClient';

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ with?: string }> }) {
  const resolvedParams = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const userId = (session.user as any).id;

  // Get all unique conversation partners
  const sentTo = await db.message.findMany({
    where: { senderId: userId },
    select: { receiverId: true },
    distinct: ['receiverId'],
  });
  const receivedFrom = await db.message.findMany({
    where: { receiverId: userId },
    select: { senderId: true },
    distinct: ['senderId'],
  });

  const contactIds = [...new Set([...sentTo.map(m => m.receiverId), ...receivedFrom.map(m => m.senderId)])];

  const contacts = await db.user.findMany({
    where: { id: { in: contactIds } },
    select: { id: true, name: true, role: true, profile: { select: { title: true, companyName: true } } },
  });

  const activeContactId = resolvedParams.with || contactIds[0] || null;

  let messages: any[] = [];
  if (activeContactId) {
    messages = await db.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: activeContactId },
          { senderId: activeContactId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <Header title="Messages" subtitle="Direct communication with your contacts" />
      <MessagesClient
        userId={userId}
        contacts={contacts}
        activeContactId={activeContactId}
        initialMessages={messages}
      />
    </div>
  );
}
