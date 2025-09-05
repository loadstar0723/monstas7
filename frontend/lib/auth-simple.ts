import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

// Simple in-memory auth for development
// Will be replaced with Prisma when database is configured
export const authOptions: NextAuthOptions = {
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

        // Temporary demo users
        const demoUsers = [
          {
            id: '1',
            email: 'admin@monsta.com',
            password: await bcrypt.hash('admin123', 10),
            name: '관리자',
            role: 'HEADQUARTERS',
            subscription: 'BLACK'
          },
          {
            id: '2',
            email: 'user@monsta.com',
            password: await bcrypt.hash('user123', 10),
            name: '사용자',
            role: 'SUBSCRIBER',
            subscription: 'GOLD'
          }
        ];

        const user = demoUsers.find(u => u.email === credentials.email);
        
        if (!user) {
          throw new Error('사용자를 찾을 수 없습니다');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('비밀번호가 올바르지 않습니다');
        }

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
    secret: process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'default-secret-for-development',
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