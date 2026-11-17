import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: false }, // 👈 এখানে required: false করে দেওয়া হয়েছে
    role: { type: String, enum: ["user", "admin"], default: "user" }, // admin হলে ড্যাশবোর্ড অ্যাক্সেস পাবে
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);