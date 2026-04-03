import { NextResponse } from 'next/server';
import { resetDb } from '@/lib/db';

export async function POST() {
  try {
    resetDb();
    return NextResponse.json({ success: true, message: 'Database reset to defaults' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
