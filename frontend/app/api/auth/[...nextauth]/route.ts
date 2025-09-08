// next-auth 비활성화
// import NextAuth from 'next-auth';
// import { authOptions } from '@/lib/auth';
// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };

// 임시 빈 핸들러
export async function GET() {
  return new Response('Auth disabled', { status: 200 })
}

export async function POST() {
  return new Response('Auth disabled', { status: 200 })
}