import { NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { userSettings } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const settings = await db.select().from(userSettings).where(eq(userSettings.userId, 'current_user'));
    if (settings && settings.length > 0) {
      return NextResponse.json({ success: true, settings: settings[0] });
    }
  } catch (e) {
    console.warn('Could not load user settings from Cloud SQL:', e);
  }

  return NextResponse.json({
    success: true,
    settings: {
      theme: 'dark',
      sendByEnter: true,
      animations: true,
      soundNotifications: true,
      textSize: 16,
      wallpaperType: 'doodle',
      wallpaperValue: 'classic',
      wallpaperColor: '#0e1621',
      wallpaperOpacity: 100,
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      theme,
      sendByEnter,
      animations,
      soundNotifications,
      textSize,
      wallpaperType,
      wallpaperValue,
      wallpaperColor,
      wallpaperOpacity,
    } = body;

    const valuesToSet = {
      theme: theme !== undefined ? theme : 'dark',
      sendByEnter: sendByEnter !== undefined ? sendByEnter : true,
      animations: animations !== undefined ? animations : true,
      soundNotifications: soundNotifications !== undefined ? soundNotifications : true,
      textSize: textSize !== undefined ? textSize : 16,
      wallpaperType: wallpaperType !== undefined ? wallpaperType : 'doodle',
      wallpaperValue: wallpaperValue !== undefined ? wallpaperValue : 'classic',
      wallpaperColor: wallpaperColor !== undefined ? wallpaperColor : '#0e1621',
      wallpaperOpacity: wallpaperOpacity !== undefined ? wallpaperOpacity : 100,
    };

    await db
      .insert(userSettings)
      .values({
        userId: 'current_user',
        ...valuesToSet,
      })
      .onConflictDoUpdate({
        target: userSettings.userId,
        set: valuesToSet,
      });

    return NextResponse.json({ success: true, settings: { ...valuesToSet, userId: 'current_user' } });
  } catch (error: any) {
    console.error('Failed to update settings in Cloud SQL:', error);
    return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 });
  }
}
