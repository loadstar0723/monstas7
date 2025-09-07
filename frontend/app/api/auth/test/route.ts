import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Auth API is working',
    nextauth_url: process.env.NEXTAUTH_URL,
    has_secret: !!process.env.NEXTAUTH_SECRET
  });
}