'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sendMessage } from '@/lib/actions/misc';
import { Send, MessageSquare } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  role: string;
  profile: { title?: string | null; companyName?: string | null } | null;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: Date;
}

export default function MessagesClient({ userId, contacts, activeContactId, initialMessages }: {
  userId: string;
  contacts: Contact[];
  activeContactId: string | null;
  initialMessages: Message[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !activeContactId) return;
    setIsSending(true);

    const result = await sendMessage(userId, activeContactId, text);
    if (result.success && result.message) {
      setMessages(prev => [...prev, result.message as any]);
      setText('');
    }
    setIsSending(false);
  }

  const activeContact = contacts.find(c => c.id === activeContactId);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Contacts List */}
      <div className="w-72 border-r border-slate-800/80 flex flex-col bg-slate-900/30">
        <div className="p-4 border-b border-slate-800/60">
          <h2 className="text-sm font-bold text-slate-300">Conversations</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {contacts.length === 0 ? (
            <div className="p-6 text-center">
              <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No conversations yet.</p>
            </div>
          ) : (
            contacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => router.push(`/messages?with=${contact.id}`)}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 hover:bg-slate-800/40 transition-colors text-left ${
                  contact.id === activeContactId ? 'bg-indigo-600/10 border-r-2 border-indigo-500' : ''
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {contact.name[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-200 truncate">{contact.name}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {contact.profile?.title || contact.profile?.companyName || contact.role}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeContact ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-slate-800/60 px-6 py-4 bg-slate-900/20 flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {activeContact.name[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-slate-200 text-sm">{activeContact.name}</p>
                <p className="text-xs text-slate-500">{activeContact.profile?.title || activeContact.profile?.companyName || activeContact.role}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-slate-500">Start the conversation</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === userId;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMine
                          ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm'
                          : 'bg-slate-800 text-slate-200 rounded-bl-sm'
                      }`}>
                        {msg.content}
                        <p className={`text-[10px] mt-1 ${isMine ? 'text-indigo-200' : 'text-slate-500'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSend} className="border-t border-slate-800/60 px-6 py-4 flex items-center space-x-3">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
              <button
                type="submit"
                disabled={isSending || !text.trim()}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <MessageSquare className="w-12 h-12 text-slate-700 mx-auto" />
              <p className="text-slate-500">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
