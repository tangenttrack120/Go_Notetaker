import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
  ],
  // You can add Google, Discord, or Apple providers right here later!
});

// Next.js App Router requires us to export the handler as both GET and POST
export { handler as GET, handler as POST };
