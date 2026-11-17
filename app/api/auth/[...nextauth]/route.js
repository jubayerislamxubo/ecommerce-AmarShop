import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

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
          await connectDB();
          const db = mongoose.connection.db;
          
          const existingUser = await db.collection("users").findOne({ email: user.email });
          if (existingUser) {
            await db.collection("accounts").updateOne(
              { userId: existingUser._id },
              { 
                $set: { 
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  type: account.type,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  id_token: account.id_token,
                  token_type: account.token_type,
                  scope: account.scope
                } 
              },
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