import { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnProtectedRoute = nextUrl.pathname.startsWith('/api/generate')
      
      if (isOnProtectedRoute) {
        if (isLoggedIn) return true
        return false
      }
      
      return true
    },
    async session({ session }) {
      return session
    },
    async jwt({ token }) {
      return token
    },
  },
}