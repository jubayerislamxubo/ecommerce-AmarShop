import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import clientPromise from "@/lib/mongodb";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  allowDangerousEmailAccountLinking: true,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        try {
          const client = await clientPromise;
          const db = client.db();
          
          const existingUser = await db.collection("users").findOne({ email: user.email });
          if (existingUser) {
            await db.collection("accounts").updateOne(
              { userId: existingUser._id },
              { $set: { providerAccountId: account.providerAccountId } },
              { upsert: true }
            );
          }
        } catch (error) {
          console.error("Error linking account:", error);
        }
      }
      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };