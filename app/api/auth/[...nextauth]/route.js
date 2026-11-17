import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/mongodb";
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
          
          // ১. চেক করি এই ইমেইলে কোনো ইউজার আগে থেকেই আছে কি না
          let existingUser = await db.collection("users").findOne({ email: user.email });

          let userId;

          if (!existingUser) {
            // যদি ইউজার না থাকে, তবে গুগল সাইন-ইন দিয়ে নতুন ইউজার বানিয়ে নেব
            // যেহেতু পাসওয়ার্ড নেই, তাই এখানে পাসওয়ার্ড ফিল্ড ফাকা বা ডামি রাখা যায় অথবা স্কিমা বাইপাস করে ইনসার্ট করা যায়
            const newUser = await db.collection("users").insertOne({
              name: user.name || profile?.name || "Google User",
              email: user.email,
              phone: "N/A", // গুগল সাইন-ইনে ফোন থাকে না, তাই ডিফল্ট মান
              password: "",  // গুগল ইউজারের জন্য পাসওয়ার্ড ফাকা
              role: "user",
              createdAt: new Date(),
              updatedAt: new Date()
            });
            userId = newUser.insertedId;
          } else {
            userId = existingUser._id;
          }

          // ২. এখন accounts কালেকশনে প্রোভাডার লিংক বা আপডেট করে দেব
          await db.collection("accounts").updateOne(
            { provider: account.provider, providerAccountId: account.providerAccountId },
            { 
              $set: { 
                userId: userId,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                expires_at: account.expires_at,
                id_token: account.id_token,
                token_type: account.token_type,
                scope: account.scope
              } 
            },
            { upsert: true }
          );

        } catch (error) {
          console.error("Error during Google sign in account linking:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        await connectDB();
        const db = mongoose.connection.db;
        const dbUser = await db.collection("users").findOne({ email: session.user.email });
        if (dbUser) {
          session.user.id = dbUser._id.toString();
          session.user.role = dbUser.role;
        }
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };