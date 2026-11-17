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
  // অ্যাকাউন্ট লিংকিং সংক্রান্ত সিকিউরিটি ব্লক চিরতরে বন্ধ করার জন্য
  allowDangerousEmailAccountLinking: true,
  
  session: {
    strategy: "jwt",
  },
  
  callbacks: {
    async signIn({ user }) {
      try {
        await connectDB();
        
        let existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          await User.create({
            name: user.name || "Google User",
            email: user.email,
            phone: "N/A",
            password: "",
            role: "user",
          });
        }
        return true;
      } catch (error) {
        console.error("SignIn Error:", error);
        return true;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        await connectDB();
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };