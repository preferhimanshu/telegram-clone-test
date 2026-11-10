import { NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { conversations, messages } from '@/src/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function GET() {
  try {
    const dbConversations = await db.select().from(conversations);

    if (dbConversations && dbConversations.length > 0) {
      const allMessages = await db
        .select()
        .from(messages)
        .orderBy(desc(messages.createdAt));

      const enriched = dbConversations.map((c) => {
        const lastMsg = allMessages.find((m) => m.conversationId === c.convId);
        return {
          id: c.convId,
          type: c.type,
          title: c.title,
          description: c.description,
          avatarUrl: c.avatarUrl,
          isPinned: c.isPinned ?? false,
          isMuted: c.isMuted ?? false,
          isArchived: c.isArchived ?? false,
          unreadCount: 0,
          verified: c.convId === 'conv_bot_ai',
          membersCount: c.type === 'group' ? 1 : undefined,
          onlineCount: c.type === 'group' ? 1 : undefined,
          lastMessage: lastMsg
            ? {
                text: lastMsg.text || (lastMsg.type === 'image' ? '📷 Photo' : lastMsg.type === 'voice' ? '🎤 Voice message' : '📎 Attachment'),
                timestamp: lastMsg.createdAt ? new Date(lastMsg.createdAt).toISOString() : new Date().toISOString(),
                isOutgoing: lastMsg.senderId === 'current_user',
                senderName: lastMsg.senderName,
                status: 'read' as const,
              }
            : undefined,
        };
      });

      return NextResponse.json({ success: true, conversations: enriched, source: 'cloud_sql' });
    }

    return NextResponse.json({ success: true, conversations: [], source: 'cloud_sql' });
  } catch (error) {
    console.error('Database query error in /api/chats:', error);
    return NextResponse.json({ success: true, conversations: [], source: 'cloud_sql' });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, type = 'group', description = '', avatarUrl = '' } = body;
    const convId = 'conv_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);

    await db.insert(conversations).values({
      convId,
      type,
      title,
      description,
      avatarUrl,
      isPinned: false,
      isMuted: false,
      isArchived: false,
    });

    return NextResponse.json({
      success: true,
      conversation: {
        id: convId,
        convId,
        type,
        title,
        description,
        avatarUrl,
        isPinned: false,
        isMuted: false,
        isArchived: false,
        unreadCount: 0,
      },
    });
  } catch (error: any) {
    console.error('Failed to create conversation in Cloud SQL:', error);
    return NextResponse.json({ error: error.message || 'Failed to create conversation' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { convId, isPinned, isMuted, isArchived } = body;

    if (!convId) {
      return NextResponse.json({ error: 'Missing convId' }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (isPinned !== undefined) updates.isPinned = isPinned;
    if (isMuted !== undefined) updates.isMuted = isMuted;
    if (isArchived !== undefined) updates.isArchived = isArchived;

    await db.update(conversations).set(updates).where(eq(conversations.convId, convId));

    return NextResponse.json({ success: true, convId, updates });
  } catch (error: any) {
    console.error('Failed to update conversation in Cloud SQL:', error);
    return NextResponse.json({ error: error.message || 'Failed to update conversation' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const convId = searchParams.get('convId');

    if (!convId) {
      return NextResponse.json({ error: 'Missing convId' }, { status: 400 });
    }

    // Delete associated messages and conversation from Cloud SQL
    await db.delete(messages).where(eq(messages.conversationId, convId));
    await db.delete(conversations).where(eq(conversations.convId, convId));

    return NextResponse.json({ success: true, deletedConvId: convId });
  } catch (error: any) {
    console.error('Failed to delete conversation from Cloud SQL:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete conversation' }, { status: 500 });
  }
}
