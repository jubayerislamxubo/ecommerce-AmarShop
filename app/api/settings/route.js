import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";

// সেটিংস ডাটা আনার জন্য (GET)
export async function GET() {
  try {
    await connectDB();
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({}); // প্রথমবার ডিফল্ট সেটিংস তৈরি হবে
    }
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// অ্যাডমিন থেকে সেটিংস আপডেট করার জন্য (PUT)
export async function PUT(req) {
  try {
    await connectDB();
    const data = await req.json();
    let settings = await SiteSettings.findOne();

    if (!settings) {
      settings = await SiteSettings.create(data);
    } else {
      settings = await SiteSettings.findByIdAndUpdate(settings._id, data, { new: true });
    }
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}