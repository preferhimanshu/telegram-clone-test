import { NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { users } from '@/src/db/schema';
import { ne } from 'drizzle-orm';

export async function GET() {
  try {
    // Return all registered contacts except current user
    const dbUsers = await db.select().from(users).where(ne(users.uid, 'current_user'));
    return NextResponse.json({ success: true, contacts: dbUsers || [] });
  } catch (error) {
    console.error('Could not read contacts from Cloud SQL:', error);
    return NextResponse.json({ success: true, contacts: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { displayName, username, phoneNumber, bio = '', avatarUrl = '' } = body;
    const uid = 'user_' + Date.now().toString(36);

    const newUser = {
      uid,
      email: `${username || 'user'}@telegram.me`,
      displayName,
      username: username || `user_${Date.now().toString(36).slice(-4)}`,
      phoneNumber: phoneNumber || '',
      bio,
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      isOnline: true,
    };

    await db.insert(users).values(newUser);

    return NextResponse.json({ success: true, contact: newUser });
  } catch (error: any) {
    console.error('Failed to add contact in Cloud SQL:', error);
    return NextResponse.json({ error: error.message || 'Failed to add contact' }, { status: 500 });
  }
}
