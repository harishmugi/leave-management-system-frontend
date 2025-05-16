// app/api/cookies/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies(); // ✅ From next/headers

  const role = cookieStore.get('role')?.value || null;
  const token = cookieStore.get('auth_token')?.value || null;

  return NextResponse.json({ role, token }); // ✅ Return as JSON
}
