"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { FaArrowLeft, FaSignOutAlt, FaEnvelope, FaUserCheck } from "react-icons/fa";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600 font-bold animate-pulse">লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">আপনি এখনো লগইন করেননি!</h2>
        <Link href="/" className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow">
          হোমপেজে ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
        {/* Header Cover */}
        <div className="h-32 bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900 relative">
          <Link
            href="/"
            className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition"
          >
            <FaArrowLeft /> হোমপেজ
          </Link>
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-8 text-center relative">
          <div className="relative -mt-16 mb-4 inline-block">
            <img
              src={session.user?.image || "https://via.placeholder.com/150"}
              alt={session.user?.name || "User"}
              referrerPolicy="no-referrer"
              className="w-28 h-28 rounded-full border-4 border-white shadow-xl object-cover bg-white mx-auto"
            />
            <span className="absolute bottom-1 right-1 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white text-xs" title="Verified Google Account">
              <FaUserCheck />
            </span>
          </div>

          <h1 className="text-2xl font-black text-slate-900">{session.user?.name}</h1>
          <p className="text-sm text-slate-500 flex items-center justify-center gap-1.5 mt-1">
            <FaEnvelope className="text-orange-500" /> {session.user?.email}
          </p>

          <div className="mt-6 pt-6 border-t border-slate-100 flex justify-center gap-4">
            <Link
              href="/"
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow transition"
            >
              🛍️ কেনাকাটা চালিয়ে যান
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="bg-red-50 hover:bg-red-100 text-red-600 px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <FaSignOutAlt /> লগআউট
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}