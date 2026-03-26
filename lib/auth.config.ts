import type { NextAuthConfig } from "next-auth";

// Lightweight config for middleware (no Prisma/bcrypt — Edge-compatible)
export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isProtected = ["/dashboard", "/study", "/decks", "/onboarding"].some(
        (p) => request.nextUrl.pathname.startsWith(p)
      );
      if (isProtected && !auth) return false;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.assessedLevel = (user as any).assessedLevel;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).assessedLevel = token.assessedLevel;
      }
      return session;
    },
  },
};
