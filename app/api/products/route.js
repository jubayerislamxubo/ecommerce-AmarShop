import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

// সব প্রোডাক্ট দেখার জন্য (GET)
export async function GET() {
  try {
    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 });
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// নতুন প্রোডাক্ট যোগ করার জন্য (POST)
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    // অ্যাডমিন প্যানেল থেকে আসা ডেটার সাথে রেটিং নিশ্চিত করা (যদি না থাকে তবে ডিফল্ট "4.9" থাকবে)
    const productData = {
      ...body,
      rating: body.rating || "4.9",
    };

    const newProduct = await Product.create(productData);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Add Product Error:", error);
    return NextResponse.json({ error: "Failed to add product" }, { status: 500 });
  }
}

// প্রোডাক্ট ডিলিট করার জন্য (DELETE)
export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    await Product.findByIdAndDelete(id);
    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE Product Error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}