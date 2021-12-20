import NextAuth, { DefaultUser } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import clientPromise from "../../../lib/mongodb";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: DefaultUser & {
      id: string;
    };
  }
}

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    // @ts-ignore
    session: async (session, user) => {
        if (session.user && user) session.user.id = user.id;
        return Promise.resolve(session);
    },
  },
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.SECRET
})