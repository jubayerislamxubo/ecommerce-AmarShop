import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

// সব অর্ডার দেখার জন্য (অ্যাডমিন প্যানেলের জন্য)
export async function GET() {
  try {
    await connectDB();
    const orders = await Order.find().sort({ createdAt: -1 });
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("GET Orders Error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// নতুন অর্ডার তৈরি করার জন্য (চেকআউট ফর্ম থেকে)
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    // ডুপ্লিকেট TrxID চেক করা (সিকিউরিটি)
    if (body.transactionId) {
      const existingTrx = await Order.findOne({ transactionId: body.transactionId.trim() });
      if (existingTrx) {
        return NextResponse.json(
          { error: "এই Transaction ID টি ইতিপূর্বে ব্যবহৃত হয়েছে! সঠিক TrxID দিন।" },
          { status: 400 }
        );
      }
    }

    const newOrder = await Order.create(body);
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("POST Order Error Details:", error); // এটি আপনার টার্মিনালে আসল এরর প্রিন্ট করবে
    return NextResponse.json({ error: error.message || "অর্ডার সাবমিট করতে সমস্যা হয়েছে।" }, { status: 500 });
  }
}

// অর্ডার স্ট্যাটাস আপডেট করার জন্য (Pending -> Confirmed / Shipped)
export async function PUT(req) {
  try {
    await connectDB();
    const { orderId, orderStatus } = await req.json();
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true }
    );
    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.error("PUT Order Error:", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}