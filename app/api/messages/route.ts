import { NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { messages, messageReactions } from '@/src/db/schema';
import { eq, asc } from 'drizzle-orm';
import { getGeminiClient, ThinkingLevel } from '@/src/lib/gemini';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const convId = searchParams.get('convId');

  if (!convId) {
    return NextResponse.json({ error: 'Missing convId' }, { status: 400 });
  }

  try {
    const dbMsgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, convId))
      .orderBy(asc(messages.createdAt));

    if (dbMsgs && dbMsgs.length > 0) {
      const formatted = dbMsgs.map((m) => ({
        id: m.msgId,
        convId: m.conversationId,
        senderId: m.senderId,
        senderName: m.senderName,
        senderAvatar: m.senderAvatar ?? undefined,
        text: m.text,
        type: m.type as any,
        mediaUrl: m.mediaUrl ?? undefined,
        mediaName: m.mediaName ?? undefined,
        mediaSize: m.mediaSize ?? undefined,
        replyToId: m.replyToId ?? undefined,
        replyPreview: m.replyPreview ?? undefined,
        forwardFrom: m.forwardFrom ?? undefined,
        isEdited: m.isEdited ?? false,
        isPinned: m.isPinned ?? false,
        timestamp: m.createdAt ? new Date(m.createdAt).toISOString() : new Date().toISOString(),
        isOutgoing: m.senderId === 'current_user',
        status: 'read' as const,
      }));

      return NextResponse.json({ success: true, messages: formatted });
    } else {
      return NextResponse.json({ success: true, messages: [] });
    }
  } catch (error) {
    console.warn('Error fetching messages from Cloud SQL:', error);
    return NextResponse.json({ success: true, messages: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      convId,
      text = '',
      type = 'text',
      mediaUrl,
      mediaName,
      mediaSize,
      replyToId,
      replyPreview,
      aiMode = 'search', // 'search' | 'thinking'
    } = body;

    const msgId = 'msg_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);

    const newMsg = {
      msgId,
      conversationId: convId,
      senderId: 'current_user',
      senderName: 'You',
      text,
      type,
      mediaUrl: mediaUrl || null,
      mediaName: mediaName || null,
      mediaSize: mediaSize || null,
      replyToId: replyToId || null,
      replyPreview: replyPreview || null,
      isEdited: false,
      isPinned: false,
    };

    try {
      await db.insert(messages).values(newMsg);
    } catch (dbErr) {
      console.warn('Could not insert into Cloud SQL:', dbErr);
    }

    const createdMessage = {
      id: msgId,
      convId,
      senderId: 'current_user',
      senderName: 'You',
      text,
      type,
      mediaUrl,
      mediaName,
      mediaSize,
      replyToId,
      replyPreview,
      timestamp: new Date().toISOString(),
      isOutgoing: true,
      status: 'read' as const,
    };

    // If sent to Telegram Assistant AI bot, trigger Gemini response
    let aiResponseMsg = null;
    if (convId === 'conv_bot_ai' && text.trim()) {
      try {
        const ai = getGeminiClient();
        let replyText = '';

        if (aiMode === 'thinking') {
          // Use gemini-4-argon with thinkingLevel: HIGH, with graceful fallback to gemini-3.8-flash
          try {
            const resp = await ai.models.generateContent({
              model: 'gemini-4-argon',
              contents: text,
              config: {
                systemInstruction:
                  'You are Telegram Assistant, an ultra-smart, concise, and helpful AI built directly into Telegram Web. Use high-reasoning thinking to provide crystal clear, well-structured answers with code or explanations when relevant.',
                thinkingConfig: {
                  thinkingLevel: ThinkingLevel.HIGH,
                },
              },
            });
            replyText = resp.text || 'Done thinking through your query.';
          } catch (argonErr) {
            console.warn('gemini-4-argon fallback to gemini-3.8-flash:', argonErr);
            const resp = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: text,
              config: {
                systemInstruction:
                  'You are Telegram Assistant, an ultra-smart, concise, and helpful AI built directly into Telegram Web.',
                thinkingConfig: {
                  thinkingLevel: ThinkingLevel.HIGH,
                },
              },
            });
            replyText = resp.text || 'Here is what I analyzed for you.';
          }
        } else {
          // Default: Google Search Grounding with gemini-3.8-flash
          try {
            const resp = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: text,
              config: {
                systemInstruction:
                  'You are Telegram Assistant with Google Search grounding. Provide accurate, up-to-date, friendly answers. Keep Telegram style formatting.',
                tools: [{ googleSearch: {} }],
              },
            });
            replyText = resp.text || 'I checked Google Search for the latest info on that.';
          } catch (searchErr) {
            console.warn('Search grounding error, falling back to standard prompt:', searchErr);
            const resp = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: text,
              config: {
                systemInstruction: 'You are Telegram Assistant built into Telegram Web.',
              },
            });
            replyText = resp.text || 'Hello from Telegram Assistant!';
          }
        }

        const botMsgId = 'msg_bot_' + Date.now().toString(36);
        const botRecord = {
          msgId: botMsgId,
          conversationId: convId,
          senderId: 'user_gemini',
          senderName: 'Telegram Assistant',
          senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
          text: replyText,
          type: 'text',
          replyToId: msgId,
          replyPreview: text.slice(0, 50),
          isEdited: false,
          isPinned: false,
        };

        try {
          await db.insert(messages).values(botRecord);
        } catch (botDbErr) {
          console.warn('Could not insert bot msg into Cloud SQL:', botDbErr);
        }

        aiResponseMsg = {
          id: botMsgId,
          convId,
          senderId: 'user_gemini',
          senderName: 'Telegram Assistant',
          senderAvatar: botRecord.senderAvatar,
          text: replyText,
          type: 'text',
          replyToId: msgId,
          replyPreview: text.slice(0, 50),
          timestamp: new Date().toISOString(),
          isOutgoing: false,
          status: 'read' as const,
        };
      } catch (geminiError: any) {
        console.error('Gemini error:', geminiError);
      }
    }

    return NextResponse.json({
      success: true,
      message: createdMessage,
      aiResponse: aiResponseMsg,
    });
  } catch (error: any) {
    console.error('Failed to post message:', error);
    return NextResponse.json({ error: error.message || 'Failed to send message' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { msgId, text, isPinned, action, emoji } = body;

    if (!msgId) {
      return NextResponse.json({ error: 'Missing msgId' }, { status: 400 });
    }

    if (action === 'edit' && text !== undefined) {
      await db.update(messages).set({ text, isEdited: true }).where(eq(messages.msgId, msgId));
      return NextResponse.json({ success: true, action: 'edit' });
    }

    if (action === 'pin' && isPinned !== undefined) {
      await db.update(messages).set({ isPinned }).where(eq(messages.msgId, msgId));
      return NextResponse.json({ success: true, action: 'pin' });
    }

    if (action === 'react' && emoji) {
      return NextResponse.json({ success: true, action: 'react', emoji });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update message:', error);
    return NextResponse.json({ error: error.message || 'Failed to update message' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const msgId = searchParams.get('msgId');
    const convId = searchParams.get('convId');

    if (convId) {
      await db.delete(messages).where(eq(messages.conversationId, convId));
      return NextResponse.json({ success: true, clearedConvId: convId });
    }

    if (!msgId) {
      return NextResponse.json({ error: 'Missing msgId or convId' }, { status: 400 });
    }

    await db.delete(messages).where(eq(messages.msgId, msgId));
    return NextResponse.json({ success: true, deletedMsgId: msgId });
  } catch (error: any) {
    console.error('Failed to delete message:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete message' }, { status: 500 });
  }
}
