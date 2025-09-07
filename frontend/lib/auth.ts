import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Prisma는 데이터베이스가 설정된 후에 활성화
// import { PrismaAdapter } from '@auth/prisma-adapter';
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// 임시 사용자 데이터 (데이터베이스 연결 전까지 사용)
const mockUsers = [
  {
    id: '1',
    email: 'admin@monstas7.com',
    password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvwNNPie', // bcrypt hash of 'admin123'
    name: 'Admin',
    role: 'HEADQUARTERS',
    subscription: 'PLATINUM',
    isActive: true,
    lastLoginAt: new Date()
  },
  {
    id: '2',
    email: 'user@monstas7.com',
    password: '$2a$10$RBmCb7i.lCI0xEZlD1gZc.V9j5EFKfHfrR0YtpJJnRs0Q87zThkNa', // bcrypt hash of 'user123'
    name: 'Test User',
    role: 'SUBSCRIBER',
    subscription: 'GOLD',
    isActive: true,
    lastLoginAt: new Date()
  }
];

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma) as any, // 데이터베이스 연결 후 활성화
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('이메일과 비밀번호를 입력해주세요');
        }

        // 임시로 mockUsers 사용 (데이터베이스 연결 전까지)
        const user = mockUsers.find(u => u.email === credentials.email);

        /* 데이터베이스 연결 후 아래 코드 활성화
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });
        */

        if (!user || !user.password) {
          throw new Error('사용자를 찾을 수 없습니다');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('비밀번호가 올바르지 않습니다');
        }

        if (!user.isActive) {
          throw new Error('계정이 비활성화되었습니다');
        }

        // Update last login (데이터베이스 연결 후 활성화)
        /*
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });
        */

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          subscription: user.subscription,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.subscription = (user as any).subscription;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.subscription = token.subscription as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
  },
  debug: process.env.NODE_ENV === 'development',
};

// Helper functions for role-based access control
export const checkRole = (userRole: string, requiredRole: string): boolean => {
  const roleHierarchy = {
    'HEADQUARTERS': 4,
    'DISTRIBUTOR': 3,
    'AGENT': 2,
    'SUBSCRIBER': 1,
  };
  
  return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
};

export const checkSubscription = (userSubscription: string, requiredSubscription: string): boolean => {
  const subscriptionHierarchy = {
    'BLACK': 6,
    'DIAMOND': 5,
    'PLATINUM': 4,
    'GOLD': 3,
    'SILVER': 2,
    'FREE': 1,
  };
  
  return (subscriptionHierarchy[userSubscription] || 0) >= (subscriptionHierarchy[requiredSubscription] || 0);
};