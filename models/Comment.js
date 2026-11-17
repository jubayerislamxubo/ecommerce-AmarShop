import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true }, // স্ট্রিং বা ObjectId উভয় আইডির জন্যই এটি ১০০% নিরাপদ
    name: { type: String, required: true },
    text: { type: String, required: true },
    rating: { type: Number, required: true, default: 5 },
  },
  { timestamps: true }
);

export default mongoose.models.Comment || mongoose.model("Comment", CommentSchema);