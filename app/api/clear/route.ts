import { NextResponse } from 'next/server';
import { clearDb } from '@/lib/db';

export async function POST() {
  try {
    clearDb();
    return NextResponse.json({ success: true, message: 'All leaderboard data deleted' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
