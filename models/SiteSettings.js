import mongoose from "mongoose";

const SiteSettingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: "Amar Shop" },
    // ডাইনামিক কালার থিম (অ্যাডমিন চাইলে পরিবর্তন করতে পারবে)
    primaryColor: { type: String, default: "#0F172A" }, // Trust Navy Blue
    actionColor: { type: String, default: "#F97316" },  // Vibrant Orange
    bgColor: { type: String, default: "#F8FAFC" },      // Clean Background

    // হোমপেজ স্লাইডার ইমেজসমূহ
    sliders: [
      {
        imageUrl: String,
        title: String,
        subtitle: String,
      },
    ],

    // পেমেন্ট অ্যাকাউন্ট নম্বরসমূহ
    bkashNumber: { type: String, default: "01700000000" },
    nagadNumber: { type: String, default: "01700000000" },
    rocketNumber: { type: String, default: "01700000000" },

    // ডেলিভারি চার্জ
    insideDhakaCharge: { type: Number, default: 60 },
    outsideDhakaCharge: { type: Number, default: 120 },

    // হোয়াটসঅ্যাপ ও মেসেঞ্জার কন্টাক্ট
    whatsappNumber: { type: String, default: "8801700000000" },
    messengerUsername: { type: String, default: "yourpageusername" },
  },
  { timestamps: true }
);

export default mongoose.models.SiteSettings || mongoose.model("SiteSettings", SiteSettingsSchema);