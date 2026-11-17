import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true }, // যেমন: "Fashion", "Electronics", "Sports", "Bags", "Watches", "Shoes", "Cosmetics", "Jewelry"
    gender: { type: String, default: "" },      // শুধু Fashion-এর জন্য: "Male" বা "Female"
    subCategory: { type: String, default: "" }, // ফ্যাশনের সাব-আইটেম: "Shirt", "Pant", "Saree", "Kurti" ইত্যাদি
    sizes: [{ type: String }],                  // 👕 নতুন যুক্ত হলো: সাইজগুলোর তালিকা (যেমন: ["S", "M", "L", "XL"])
    rating: { type: String, default: "4.9" },   // ⭐ নতুন যুক্ত হলো: কাস্টম রেটিং (যেমন: "9.4" বা "4.9")
    images: [{ type: String, required: true }], // একাধিক ছবির লিংক
    regularPrice: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 }, // কত পারসেন্ট ছাড়
    stock: { type: Number, default: 10 },
    isTrending: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);