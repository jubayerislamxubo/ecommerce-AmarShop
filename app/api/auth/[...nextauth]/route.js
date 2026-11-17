import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  // allowDangerousEmailAccountLinking সরিয়ে দিলাম যাতে কোনো কনফ্লিক্ট বা সিকিউরিটি ইস্যু না করে
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        try {
          await connectDB();
          
          // চেক করি এই ইমেইলের কোনো ইউজার ডাটাবেজে আছে কি না
          let existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            // যদি না থাকে, তবে নতুন ইউজার তৈরি করে নেব (পাসওয়ার্ড ছাড়া, কারণ এটি গুগল লগইন)
            await User.create({
              name: user.name || profile?.name || "Google User",
              email: user.email,
              phone: "N/A", // গুগল সাইন-ইনে ফোন থাকে না
              password: "",  // পাসওয়ার্ড ফাকা থাকবে
              role: "user",
            });
          }
          return true;
        } catch (error) {
          console.error("Error saving google user to database:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session }) {
      await connectDB();
      const dbUser = await User.findOne({ email: session.user.email });
      if (dbUser) {
        session.user.id = dbUser._id.toString();
        session.user.role = dbUser.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };