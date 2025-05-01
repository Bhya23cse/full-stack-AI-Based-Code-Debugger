import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  debug: true, // Enable debug mode
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('Authorization attempt with credentials:', credentials);
        
        // Add your authentication logic here
        if (credentials?.email === "test@example.com" && credentials?.password === "password") {
          console.log('Authentication successful');
          return {
            id: "1",
            email: credentials.email,
            name: "Test User"
          };
        }
        console.log('Authentication failed');
        return null;
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log('JWT callback:', { token, user });
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      console.log('Session callback:', { session, token });
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  events: {
    async signIn({ user }) {
      console.log('User signed in:', user);
    },
    async signOut() {
      console.log('User signed out');
    }
  }
});

export { handler as GET, handler as POST }; 