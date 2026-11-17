"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FaWhatsapp, FaFacebookMessenger, FaShieldAlt, FaTruck, FaStar, FaCheckCircle } from "react-icons/fa";

export default function ProductDetails({ params }) {
  // Next.js এর সর্বশেষ ভার্সন বা Suspense এরর এড়াতে নিরাপদ হ্যান্ডেলিং
  const [productId, setProductId] = useState(null);

  const [product, setProduct] = useState(null);
  const [settings, setSettings] = useState({
    siteName: "Amar Shop",
    primaryColor: "#0F172A",
    actionColor: "#F97316",
    bgColor: "#F8FAFC",
    bkashNumber: "01700000000",
    nagadNumber: "01800000000",
    rocketNumber: "01900000000",
    insideDhakaCharge: 60,
    outsideDhakaCharge: 120,
    whatsappNumber: "8801700000000",
  });
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ name: "", text: "", rating: 5 });

  // সাইজ ও কোয়ান্টিটি স্টেট (ডিফল্ট সাইজ M সেট করা হলো)
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);

  // অর্ডার ফর্ম স্টেট
  const [orderForm, setOrderForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    thana: "",
    district: "Dhaka",
    deliveryArea: "inside_dhaka", 
    paymentMethod: "bKash",
    senderNumber: "",
    transactionId: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Unwrapping params safely for Next.js App Router
  useEffect(() => {
    async function resolveParams() {
      const resolvedParams = await params;
      if (resolvedParams?.id) {
        setProductId(resolvedParams.id);
      }
    }
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
      fetchComments();
      fetchSettings();
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (Array.isArray(data)) {
        const found = data.find((p) => p._id === productId);
        if (found) {
          setProduct(found);
          const cat = found.category?.trim().toLowerCase();
          if (cat === "fashion" || cat === "jersey") {
            const availableSizes = found.sizes && found.sizes.length > 0 ? found.sizes : ["S", "M", "L", "XL", "XXL"];
            setSelectedSize(availableSizes[0]);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching product:", err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?productId=${productId}`);
      const data = await res.json();
      if (Array.isArray(data)) setComments(data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data && !data.error) setSettings(data);
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  };

  // কমেন্ট সাবমিট
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          userName: newComment.name,
          commentText: newComment.text,
          rating: newComment.rating,
        }),
      });
      if (res.ok) {
        setNewComment({ name: "", text: "", rating: 5 });
        fetchComments();
      } else {
        alert("কমেন্ট প্রকাশ করতে সমস্যা হয়েছে।");
      }
    } catch (err) {
      console.error("Error submitting comment:", err);
    }
  };

  // অর্ডার সাবমিট (সাইজ ও কোয়ান্টিটি সহ)
  const handleOrderSubmit = async (e) => {
    e.preventDefault();

    const cat = product.category?.trim().toLowerCase();
    const isFashionOrJersey = cat === "fashion" || cat === "jersey";

    if (isFashionOrJersey && !selectedSize) {
      alert("দয়া করে প্রডাক্টের সাইজ সিলেক্ট করুন।");
      return;
    }

    setSubmitting(true);

    const finalPrice = Math.round(
      product.regularPrice - (product.regularPrice * product.discountPercentage) / 100
    );
    const deliveryCharge =
      orderForm.deliveryArea === "inside_dhaka" ? settings.insideDhakaCharge : settings.outsideDhakaCharge;

    const orderPayload = {
      items: [{ 
        productId: product._id, 
        title: product.title, 
        price: finalPrice, 
        quantity,
        size: isFashionOrJersey ? selectedSize : null 
      }],
      productTotal: finalPrice * quantity,
      deliveryCharge,
      totalAmount: finalPrice * quantity + deliveryCharge,
      customerName: orderForm.customerName,
      phone: orderForm.phone,
      address: orderForm.address,
      thana: orderForm.thana,
      district: orderForm.district,
      deliveryArea: orderForm.deliveryArea, 
      paymentMethod: orderForm.paymentMethod,
      senderNumber: orderForm.senderNumber,
      transactionId: orderForm.transactionId,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (res.ok) {
        setOrderSuccess(true);
      } else {
        alert(data.error || "অর্ডার করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
      }
    } catch (err) {
      console.error("Order submit error:", err);
      alert("সার্ভার কানেকশনে সমস্যা হয়েছে।");
    }
    setSubmitting(false);
  };

  if (!product) {
    return <div className="text-center py-24 text-slate-500 font-medium">লোড হচ্ছে...</div>;
  }

  const finalPrice = Math.round(
    product.regularPrice - (product.regularPrice * product.discountPercentage) / 100
  );
  const activeDeliveryCharge =
    orderForm.deliveryArea === "inside_dhaka" ? settings.insideDhakaCharge : settings.outsideDhakaCharge;

  const categoryLower = product.category?.trim().toLowerCase();
  
  // স্মার্ট কন্ডিশন: ফ্যাশন বা জার্সি হলেই সাইজ বক্স দেখাবে। ডাটাবেজে সাইজ না থাকলেও ডিফল্ট S, M, L, XL দেখাবে।
  const showSizeSelector = categoryLower === "fashion" || categoryLower === "jersey";
  const productSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ["S", "M", "L", "XL", "XXL"];

  return (
    <div style={{ backgroundColor: settings.bgColor }} className="min-h-screen text-slate-800 pb-20">
      {/* Navbar Header */}
      <nav className="bg-white shadow-sm px-4 py-3 flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/" className="text-xl font-black" style={{ color: settings.primaryColor }}>
          {settings.siteName}
        </Link>
        <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
          ← হোমপেজে ফিরে যান
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto p-4 sm:p-6 grid md:grid-cols-2 gap-8 mt-4">
        {/* Product Image & Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border p-4">
            <img
              src={product.images?.[0] || "https://via.placeholder.com/400"}
              alt={product.title}
              className="w-full h-80 sm:h-96 object-cover rounded-xl"
            />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border space-y-4">
            <h1 className="text-2xl font-extrabold">{product.title}</h1>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-slate-900">৳{finalPrice}</span>
              {product.discountPercentage > 0 && (
                <span className="line-through text-slate-400 font-medium">৳{product.regularPrice}</span>
              )}
            </div>

            {/* ================= SIZE SELECTOR (শুধুমাত্র Fashion & Jersey এর জন্য) ================= */}
            {showSizeSelector && (
              <div className="space-y-2 pt-2 border-t">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  সাইজ নির্বাচন করুন (Size): <span className="text-orange-600 font-extrabold">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {productSizes.map((sz, idx) => {
                    const isSelected = selectedSize === sz;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        style={{
                          borderColor: isSelected ? settings.actionColor : "#cbd5e1",
                          backgroundColor: isSelected ? settings.actionColor : "#ffffff",
                          color: isSelected ? "#ffffff" : "#334155",
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold border-2 transition shadow-sm cursor-pointer hover:scale-105"
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= QUANTITY COUNTER (সকল পণ্যের জন্য) ================= */}
            <div className="space-y-2 pt-2 border-t">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">পরিমাণ (Quantity):</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-lg flex items-center justify-center transition cursor-pointer shadow-sm"
                >
                  -
                </button>
                <span className="text-base font-black px-4 py-2 bg-slate-50 border rounded-xl min-w-[50px] text-center shadow-inner">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-lg flex items-center justify-center transition cursor-pointer shadow-sm"
                >
                  +
                </button>
              </div>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line pt-2">{product.description}</p>
          </div>
        </div>

        {/* Order & Payment Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border space-y-6">
          {orderSuccess ? (
            <div className="text-center py-12 space-y-4">
              <FaCheckCircle className="text-green-500 text-6xl mx-auto" />
              <h2 className="text-2xl font-bold">অর্ডার সফলভাবে গৃহীত হয়েছে!</h2>
              <p className="text-slate-600 text-sm">
                আপনার ট্রানজেকশন আইডি যাচাই করে শীঘ্রই পণ্যটি কুরিয়ারে পাঠিয়ে দেওয়া হবে। ধন্যবাদ!
              </p>
              <Link
                href="/"
                style={{ backgroundColor: settings.primaryColor }}
                className="inline-block text-white font-bold px-6 py-2.5 rounded-lg"
              >
                আরো কেনাকাটা করুন
              </Link>
            </div>
          ) : (
            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <h2 className="text-lg font-bold border-b pb-2">🛒 পণ্য অর্ডার করুন (Cash on Delivery)</h2>

              {/* সিলেক্ট করা সাইজ ও কোয়ান্টিটি সামারি */}
              {showSizeSelector && (
                <div className="bg-orange-50 border border-orange-200 px-3 py-2 rounded-lg text-xs font-bold text-orange-800 flex justify-between items-center">
                  <span>নির্বাচিত সাইজ: <strong className="text-slate-900">{selectedSize}</strong></span>
                  <span>পরিমাণ: <strong className="text-slate-900">{quantity} পিস</strong></span>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">আপনার নাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="আপনার নাম"
                    value={orderForm.customerName}
                    onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                    className="w-full border p-2.5 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="text"
                    required
                    placeholder="017XXXXXXXX"
                    value={orderForm.phone}
                    onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                    className="w-full border p-2.5 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">পূর্ণ ঠিকানা (রোড, বাসা/মহল্লা) *</label>
                <textarea
                  required
                  rows="2"
                  placeholder="বাসার নম্বর, রোড, এলাকা..."
                  value={orderForm.address}
                  onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                  className="w-full border p-2.5 rounded-lg text-sm"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">থানা / উপজেলা *</label>
                  <input
                    type="text"
                    required
                    placeholder="থানা"
                    value={orderForm.thana}
                    onChange={(e) => setOrderForm({ ...orderForm, thana: e.target.value })}
                    className="w-full border p-2.5 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">জেলা *</label>
                  <select
                    value={orderForm.district}
                    onChange={(e) => setOrderForm({ ...orderForm, district: e.target.value })}
                    className="w-full border p-2.5 rounded-lg text-sm bg-white"
                  >
                    <option value="Dhaka">ঢাকা (Dhaka)</option>
                    <option value="Barguna">বরগুনা (Barguna)</option>
                    <option value="Chittagong">চট্টগ্রাম (Chittagong)</option>
                    <option value="Sylhet">সিলেট (Sylhet)</option>
                    <option value="Rajshahi">রাজশাহী (Rajshahi)</option>
                    <option value="Khulna">খুলনা (Khulna)</option>
                    <option value="Barisal">বরিশাল (Barisal)</option>
                    <option value="Other">অন্যান্য জেলা</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">ডেলিভারি এলাকা নির্বাচন করুন *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOrderForm({ ...orderForm, deliveryArea: "inside_dhaka" })}
                    className={`p-2.5 border rounded-lg text-sm font-semibold cursor-pointer ${
                      orderForm.deliveryArea === "inside_dhaka"
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "bg-slate-50"
                    }`}
                  >
                    ঢাকার ভিতরে (৳{settings.insideDhakaCharge})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderForm({ ...orderForm, deliveryArea: "outside_dhaka" })}
                    className={`p-2.5 border rounded-lg text-sm font-semibold cursor-pointer ${
                      orderForm.deliveryArea === "outside_dhaka"
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "bg-slate-50"
                    }`}
                  >
                    ঢাকার বাইরে (৳{settings.outsideDhakaCharge})
                  </button>
                </div>
              </div>

              {/* Payment Box */}
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-3">
                <h3 className="font-bold text-sm text-amber-900">
                  ⚠️ অগ্রিম ডেলিভারি চার্জ (৳{activeDeliveryCharge}) পেমেন্ট নির্দেশিকা:
                </h3>
                <p className="text-xs text-amber-800 leading-relaxed">
                  কুরিয়ার নিশ্চিত করতে অগ্রিম ডেলিভারি চার্জ বিকাশ/নগদ/রকেট পার্সোনাল নম্বরে সেন্ড মানি করুন:
                  <br />
                  <strong className="font-mono text-pink-700">
                    bKash: {settings.bkashNumber} | Nagad: {settings.nagadNumber}
                  </strong>
                </p>

                <div className="grid sm:grid-cols-3 gap-2">
                  <select
                    value={orderForm.paymentMethod}
                    onChange={(e) => setOrderForm({ ...orderForm, paymentMethod: e.target.value })}
                    className="border p-2 rounded text-xs bg-white"
                  >
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="যে নম্বর থেকে টাকা পাঠিয়েছেন"
                    value={orderForm.senderNumber}
                    onChange={(e) => setOrderForm({ ...orderForm, senderNumber: e.target.value })}
                    className="border p-2 rounded text-xs"
                  />
                  <input
                    type="text"
                    required
                    placeholder="TrxID (যেমন: 9N7A...)"
                    value={orderForm.transactionId}
                    onChange={(e) => setOrderForm({ ...orderForm, transactionId: e.target.value })}
                    className="border p-2 rounded text-xs uppercase font-mono"
                  />
                </div>
              </div>

              {/* Price Summary */}
              <div className="border-t pt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>পণ্যের মূল্য ({quantity} পিস):</span>
                  <span className="font-bold">৳{finalPrice * quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span>ডেলিভারি চার্জ (অগ্রিম প্রদানকৃত):</span>
                  <span className="font-bold">৳{activeDeliveryCharge}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold border-t pt-2 text-slate-900">
                  <span>ক্যাশ অন ডেলিভারি (বাকি মূল্য):</span>
                  <span className="text-emerald-700">৳{finalPrice * quantity}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{ backgroundColor: settings.actionColor }}
                className="w-full text-white font-bold py-3 rounded-xl shadow-md hover:opacity-95 transition cursor-pointer"
              >
                {submitting ? "অর্ডার সাবমিট হচ্ছে..." : "অর্ডার কনফার্ম করুন (Confirm Order)"}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Public Comment / Review Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-12">
        <div className="bg-white rounded-2xl p-6 shadow-sm border space-y-6">
          <h2 className="text-xl font-bold">💬 গ্রাহকদের প্রশ্ন ও রিভিউ ({comments.length})</h2>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="space-y-3 bg-slate-50 p-4 rounded-xl border">
            <h3 className="text-sm font-bold">আপনার মতামত বা প্রশ্ন লিখুন:</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="আপনার নাম"
                value={newComment.name}
                onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                className="border p-2 rounded text-sm bg-white"
              />
              <select
                value={newComment.rating}
                onChange={(e) => setNewComment({ ...newComment, rating: Number(e.target.value) })}
                className="border p-2 rounded text-sm bg-white"
              >
                <option value="5">⭐⭐⭐⭐⭐ (৫ স্টার)</option>
                <option value="4">⭐⭐⭐⭐ (৪ স্টার)</option>
                <option value="3">⭐⭐⭐ (৩ স্টার)</option>
                <option value="2">⭐⭐ (২ স্টার)</option>
                <option value="1">⭐ (১ স্টার)</option>
              </select>
            </div>
            <textarea
              required
              rows="2"
              placeholder="পণ্যটি সম্পর্কে কিছু বলুন..."
              value={newComment.text}
              onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
              className="w-full border p-2 rounded text-sm bg-white"
            />
            <button
              type="submit"
              style={{ backgroundColor: settings.primaryColor }}
              className="text-white text-xs font-bold px-5 py-2 rounded-lg hover:opacity-90 cursor-pointer"
            >
              কমেন্ট প্রকাশ করুন
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-sm text-slate-500">এখনো কোনো কমেন্ট বা রিভিউ নেই। প্রথম কমেন্টটি আপনি করুন!</p>
            ) : (
              comments.map((cmt) => (
                <div key={cmt._id} className="border-b pb-4 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm">{cmt.userName || cmt.name}</span>
                    <span className="text-xs text-amber-500 font-bold">
                      {"★".repeat(cmt.rating || 5)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{cmt.commentText || cmt.text}</p>
                  <span className="text-[10px] text-slate-400">
                    {cmt.createdAt ? new Date(cmt.createdAt).toLocaleDateString("bn-BD") : ""}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}