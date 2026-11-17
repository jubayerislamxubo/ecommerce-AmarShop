import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Comment from "@/models/Comment";

// কমেন্ট দেখার জন্য (GET)
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    let query = {};
    if (productId) {
      query.productId = productId;
    }

    const comments = await Comment.find(query).sort({ createdAt: -1 });
    return NextResponse.json(comments, { status: 200 });
  } catch (error) {
    console.error("GET Comments Error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

// কমেন্ট বা রিভিউ যোগ করার জন্য (POST)
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    console.log("Received comment body:", body);

    const productId = body.productId;
    const name = body.userName || body.name;
    const text = body.commentText || body.text;
    const rating = Number(body.rating) || 5;

    if (!productId || !name || !text) {
      return NextResponse.json(
        { error: "Product ID, Name and Text are required fields!" },
        { status: 400 }
      );
    }

    const newComment = await Comment.create({
      productId,
      name,
      text,
      rating,
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("POST Comment Detailed Error:", error);
    return NextResponse.json({ error: error.message || "Failed to add comment" }, { status: 500 });
  }
}