import { NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { users } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

const CURRENT_USER_UID = 'current_user';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid') || CURRENT_USER_UID;

    const existingUsers = await db.select().from(users).where(eq(users.uid, uid));

    if (existingUsers && existingUsers.length > 0) {
      const u = existingUsers[0];
      return NextResponse.json({
        success: true,
        user: {
          uid: u.uid,
          displayName: u.displayName,
          username: u.username,
          email: u.email,
          phoneNumber: u.phoneNumber || '+1 415 555 0199',
          avatarUrl: u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          bio: u.bio || '',
          isOnline: true,
        },
      });
    }

    // If not found in DB, create initial record
    const initialUser = {
      uid,
      displayName: 'You',
      username: 'current_user',
      email: 'you@telegram.me',
      phoneNumber: '+1 415 555 0199',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      bio: 'Telegram Web user',
      isOnline: true,
    };

    await db.insert(users).values(initialUser).onConflictDoNothing();

    return NextResponse.json({ success: true, user: initialUser });
  } catch (error: any) {
    console.error('Failed to get profile from Cloud SQL:', error);
    return NextResponse.json({
      success: true,
      user: {
        uid: CURRENT_USER_UID,
        displayName: 'You',
        username: 'current_user',
        email: 'you@telegram.me',
        phoneNumber: '+1 415 555 0199',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        bio: 'Telegram Web user',
        isOnline: true,
      },
    });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const {
      uid = CURRENT_USER_UID,
      displayName,
      username,
      bio,
      phoneNumber,
      avatarUrl,
    } = body;

    const updates: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (displayName !== undefined) updates.displayName = displayName.trim();
    if (username !== undefined) updates.username = username.trim().replace(/^@/, '');
    if (bio !== undefined) updates.bio = bio.trim();
    if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber.trim();
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

    // Check if user exists
    const existing = await db.select().from(users).where(eq(users.uid, uid));

    if (existing.length > 0) {
      await db.update(users).set(updates).where(eq(users.uid, uid));
    } else {
      await db.insert(users).values({
        uid,
        email: `${updates.username || 'user'}@telegram.me`,
        displayName: updates.displayName || 'You',
        username: updates.username || 'current_user',
        bio: updates.bio || '',
        phoneNumber: updates.phoneNumber || '+1 415 555 0199',
        avatarUrl: updates.avatarUrl || '',
        isOnline: true,
      });
    }

    const updated = await db.select().from(users).where(eq(users.uid, uid));

    return NextResponse.json({
      success: true,
      user: updated[0] || updates,
    });
  } catch (error: any) {
    console.error('Failed to update profile in Cloud SQL:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
