"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaBoxOpen, FaShoppingCart, FaPalette, FaTrash, FaPlus, FaCheckCircle, FaCamera } from "react-icons/fa";

// আপনার এবং ভবিষ্যতে যাদের অ্যাডমিন বানাতে চান তাদের জিমেইলগুলো থাকবে
const ADMIN_EMAILS = [
  "mdjubayerislamjubo60@gmail.com",
];

// ক্যাটাগরি ও সাব-ক্যাটাগরির লিস্ট
const MAIN_CATEGORIES = [
  "Fashion",
  "Electronics",
  "Sports",
  "Jersey",
  "Bags",
  "Watches",
  "Shoes",
  "Cosmetics",
];

const MALE_ITEMS = [
  "Shirt", "Pant", "T-Shirt", "Panjabi", "Cap", "Polo Shirt", "Formal Suit", 
  "Blazer", "Hoodies", "Jacket", "Sweatshirt", "Denim Jeans", "Cargo Pant", 
  "Chinos", "Pajama", "Lungi", "Waistcoat", "Tracksuit", "Joggers", 
  "Boxer / Innerwear", "Winter Coat", "Overcoat", "Windbreaker", "Cardigan", "Kurta for Men"
];

const FEMALE_ITEMS = [
  "Saree", "Kurti", "Three-Piece", "Hijab", "Abaya", "Maxi Dress", "Lehenga", 
  "Gown", "Salwar Kameez", "Skirt", "Tops", "Tunics", "Kaftan", "Palazzo", 
  "Leggings", "Jeggings", "Crop Top", "Blouse", "Petticoat", "Oversized T-Shirt for Women", 
  "Cardigan for Women", "Shrug", "Poncho", "Nightwear / Nighty", "Burqa"
];

// উপলব্ধ সাইজ অপশনস
const AVAILABLE_SIZES = ["S", "M", "L", "XL", "XXL", "Free Size"];

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("orders");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // অ্যাডমিন সিকিউরিটি চেক
  useEffect(() => {
    if (status === "loading") return;

    if (!session || !ADMIN_EMAILS.includes(session.user?.email)) {
      alert("দুঃখিত! আপনার অ্যাডমিন প্যানেলে প্রবেশ করার কোনো অনুমতি নেই।");
      router.push("/");
    }
  }, [session, status, router]);

  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    category: "Fashion",
    gender: "Male",
    subCategory: "Shirt",
    sizes: ["M", "L", "XL"], // ডিফল্ট সাইজ সিলেকশন
    imageUrl: "",
    regularPrice: "",
    discountPercentage: 0,
    rating: "4.9", // ডিফল্ট রেটিং
    stock: 10,
    isTrending: false,
  });

  const [settings, setSettings] = useState({
    siteName: "Amar Shop",
    primaryColor: "#0F172A",
    actionColor: "#F97316",
    bgColor: "#F8FAFC",
    bkashNumber: "",
    nagadNumber: "",
    rocketNumber: "",
    insideDhakaCharge: 60,
    outsideDhakaCharge: 120,
    whatsappNumber: "",
    messengerUsername: "",
    sliders: [{ imageUrl: "", title: "", subtitle: "" }],
  });

  useEffect(() => {
    if (session && ADMIN_EMAILS.includes(session.user?.email)) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const [prodRes, ordRes, setRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/orders"),
        fetch("/api/settings"),
      ]);
      const prodData = await prodRes.json();
      const ordData = await ordRes.json();
      const setData = await setRes.json();

      if (Array.isArray(prodData)) setProducts(prodData);
      if (Array.isArray(ordData)) setOrders(ordData);
      if (setData && !setData.error) {
        setSettings({
          ...setData,
          sliders: setData.sliders && setData.sliders.length > 0 ? setData.sliders : [{ imageUrl: "", title: "", subtitle: "" }]
        });
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    }
  };

  const handleImageFileChange = (e, callback) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // সাইজ টগল করার হ্যান্ডলার
  const handleSizeToggle = (size) => {
    const currentSizes = productForm.sizes || [];
    if (currentSizes.includes(size)) {
      setProductForm({ ...productForm, sizes: currentSizes.filter((s) => s !== size) });
    } else {
      setProductForm({ ...productForm, sizes: [...currentSizes, size] });
    }
  };

  // নিখুঁতভাবে প্রোডাক্ট সেভ করার হ্যান্ডলার
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productForm.imageUrl) {
      alert("দয়া করে প্রোডাক্টের একটি ছবি দিন বা আপলোড করুন!");
      return;
    }

    setLoading(true);

    const catTrimmed = productForm.category.trim().toLowerCase();
    const isFashionOrJersey = catTrimmed === "fashion" || catTrimmed === "jersey";

    const payload = {
      title: productForm.title,
      description: productForm.description,
      category: productForm.category,
      gender: catTrimmed === "fashion" ? productForm.gender : "",
      subCategory: catTrimmed === "fashion" ? productForm.subCategory : "",
      sizes: isFashionOrJersey ? productForm.sizes : [],
      regularPrice: Number(productForm.regularPrice),
      discountPercentage: Number(productForm.discountPercentage),
      rating: productForm.rating || "4.9", // রেটিং ডাটাবেজে পাঠানো হচ্ছে
      stock: Number(productForm.stock),
      images: [productForm.imageUrl],
      isTrending: productForm.isTrending,
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("প্রোডাক্ট সফলভাবে যোগ হয়েছে!");
        setProductForm({
          title: "",
          description: "",
          category: "Fashion",
          gender: "Male",
          subCategory: "Shirt",
          sizes: ["M", "L", "XL"],
          imageUrl: "",
          regularPrice: "",
          discountPercentage: 0,
          rating: "4.9",
          stock: 10,
          isTrending: false,
        });
        fetchData();
      } else {
        alert("প্রোডাক্ট যোগ করতে সমস্যা হয়েছে!");
      }
    } catch (err) {
      console.error("Error adding product:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("আপনি কি নিশ্চিত এই প্রোডাক্টটি ডিলিট করতে চান?")) return;
    await fetch(`/api/products?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    await fetch("/api/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, orderStatus: newStatus }),
    });
    fetchData();
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      alert("সেটিংস ও স্লাইডার সফলভাবে আপডেট হয়েছে!");
    }
    setLoading(false);
  };

  const handleAddSlider = () => {
    setSettings({
      ...settings,
      sliders: [...(settings.sliders || []), { imageUrl: "", title: "", subtitle: "" }]
    });
  };

  const handleRemoveSlider = (index) => {
    const updatedSliders = settings.sliders.filter((_, i) => i !== index);
    setSettings({ ...settings, sliders: updatedSliders.length > 0 ? updatedSliders : [{ imageUrl: "", title: "", subtitle: "" }] });
  };

  if (status === "loading" || !session || !ADMIN_EMAILS.includes(session.user?.email)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-600 font-bold animate-pulse">যাচাই করা হচ্ছে...</p>
      </div>
    );
  }

  const activeCategoryTrimmed = productForm.category.trim().toLowerCase();
  const showSizeSelectionInAdmin = activeCategoryTrimmed === "fashion" || activeCategoryTrimmed === "jersey";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header
        style={{ backgroundColor: settings.primaryColor }}
        className="text-white p-4 shadow-md flex flex-wrap justify-between items-center"
      >
        <h1 className="text-xl font-bold">{settings.siteName} Admin Panel</h1>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded font-medium flex items-center gap-2 cursor-pointer ${
              activeTab === "orders" ? "bg-white text-slate-900" : "bg-white/10 hover:bg-white/20"
            }`}
          >
            <FaShoppingCart /> Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 rounded font-medium flex items-center gap-2 cursor-pointer ${
              activeTab === "products" ? "bg-white text-slate-900" : "bg-white/10 hover:bg-white/20"
            }`}
          >
            <FaBoxOpen /> Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded font-medium flex items-center gap-2 cursor-pointer ${
              activeTab === "settings" ? "bg-white text-slate-900" : "bg-white/10 hover:bg-white/20"
            }`}
          >
            <FaPalette /> Theme & Settings
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        {activeTab === "orders" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Customer Orders & Advance Payment Verification</h2>
            {orders.length === 0 ? (
              <p className="text-slate-500">এখনো কোনো অর্ডার আসেনি।</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-200 text-sm">
                      <th className="p-3">Customer Info</th>
                      <th className="p-3">Products & Size</th>
                      <th className="p-3">Advance Delivery Pay (TrxID)</th>
                      <th className="p-3">COD Due</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} className="border-b text-sm">
                        <td className="p-3">
                          <p className="font-bold">{order.customerName}</p>
                          <p>{order.phone}</p>
                          <p className="text-xs text-slate-500">
                            {order.address}, {order.thana}, {order.district}
                          </p>
                        </td>
                        <td className="p-3">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="space-y-0.5">
                              <span className="font-semibold">{item.title}</span> (x{item.quantity})
                              {item.size && (
                                <span className="block text-xs font-bold text-orange-600">
                                  Size: {item.size}
                                </span>
                              )}
                            </div>
                          ))}
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-pink-600">{order.paymentMethod}</span> ৳{order.deliveryCharge}
                          <p className="text-xs">From: {order.senderNumber}</p>
                          <p className="text-xs font-mono bg-yellow-100 px-1 inline-block">
                            TrxID: {order.transactionId}
                          </p>
                        </td>
                        <td className="p-3 font-bold text-green-700">৳{order.productTotal}</td>
                        <td className="p-3">
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className="border rounded p-1.5 bg-slate-50 font-medium cursor-pointer"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "products" && (
          <div className="grid md:grid-cols-3 gap-6">
            <form onSubmit={handleAddProduct} className="bg-white p-6 rounded-lg shadow space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FaPlus /> Add New Product
              </h2>
              <input
                type="text"
                placeholder="Product Title"
                required
                value={productForm.title}
                onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                className="w-full border p-2 rounded text-sm"
              />
              
              {/* Main Category Selection */}
              <div>
                <label className="block text-xs font-semibold mb-1">Main Category</label>
                <select
                  value={productForm.category}
                  onChange={(e) => {
                    const newCat = e.target.value;
                    setProductForm({ 
                      ...productForm, 
                      category: newCat,
                      gender: newCat === "Fashion" ? "Male" : "",
                      subCategory: newCat === "Fashion" ? MALE_ITEMS[0] : ""
                    });
                  }}
                  className="w-full border p-2 rounded text-sm bg-white cursor-pointer"
                >
                  {MAIN_CATEGORIES.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Conditional Gender & Sub-category for Fashion */}
              {productForm.category === "Fashion" && (
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded border">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Gender</label>
                    <select
                      value={productForm.gender}
                      onChange={(e) => {
                        const newGender = e.target.value;
                        setProductForm({
                          ...productForm,
                          gender: newGender,
                          subCategory: newGender === "Male" ? MALE_ITEMS[0] : FEMALE_ITEMS[0]
                        });
                      }}
                      className="w-full border p-1.5 rounded text-xs bg-white cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Item Type</label>
                    <select
                      value={productForm.subCategory}
                      onChange={(e) => setProductForm({ ...productForm, subCategory: e.target.value })}
                      className="w-full border p-1.5 rounded text-xs bg-white cursor-pointer"
                    >
                      {productForm.gender === "Male"
                        ? MALE_ITEMS.map((item, idx) => <option key={idx} value={item}>{item}</option>)
                        : FEMALE_ITEMS.map((item, idx) => <option key={idx} value={item}>{item}</option>)
                      }
                    </select>
                  </div>
                </div>
              )}

              {/* ================= SMART SIZE SELECTION (Fashion & Jersey এর জন্য) ================= */}
              {showSizeSelectionInAdmin && (
                <div className="bg-orange-50/70 border border-orange-200 p-3 rounded-lg space-y-2">
                  <label className="block text-xs font-bold text-orange-900">
                    👕 Available Sizes (যে সাইজগুলো এভিয়েবল টিক দিন):
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SIZES.map((sz, idx) => {
                      const isChecked = productForm.sizes?.includes(sz);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSizeToggle(sz)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                            isChecked
                              ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          {isChecked ? `✓ ${sz}` : sz}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-semibold">প্রোডাক্টের ছবি</label>
                <input
                  type="url"
                  placeholder="Direct Image URL"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  className="w-full border p-2 rounded text-sm"
                />
                <label className="cursor-pointer bg-slate-100 border border-dashed border-slate-400 p-2 rounded text-center text-xs font-semibold text-slate-700 hover:bg-slate-200 flex items-center justify-center gap-1">
                  <FaCamera /> ফাইল বা ক্যামেরা থেকে দিন
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) =>
                      handleImageFileChange(e, (url) => setProductForm({ ...productForm, imageUrl: url }))
                    }
                  />
                </label>
                {productForm.imageUrl && (
                  <img src={productForm.imageUrl} alt="Preview" className="w-16 h-16 object-cover rounded border mt-1" />
                )}
              </div>

              {/* Price, Discount & Rating Inputs */}
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="Price (৳)"
                  required
                  value={productForm.regularPrice}
                  onChange={(e) => setProductForm({ ...productForm, regularPrice: e.target.value })}
                  className="w-full border p-2 rounded text-sm"
                />
                <input
                  type="number"
                  placeholder="Disc (%)"
                  min="0"
                  max="99"
                  value={productForm.discountPercentage}
                  onChange={(e) => setProductForm({ ...productForm, discountPercentage: e.target.value })}
                  className="w-full border p-2 rounded text-sm"
                />
                <input
                  type="text"
                  placeholder="Rating"
                  value={productForm.rating}
                  onChange={(e) => setProductForm({ ...productForm, rating: e.target.value })}
                  className="w-full border p-2 rounded text-sm font-semibold text-amber-600"
                />
              </div>

              <textarea
                placeholder="Product Description..."
                required
                rows="3"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                className="w-full border p-2 rounded text-sm"
              />
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={productForm.isTrending}
                  onChange={(e) => setProductForm({ ...productForm, isTrending: e.target.checked })}
                  className="cursor-pointer"
                />
                Show in Trending Products
              </label>
              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: settings.actionColor }}
                className="w-full text-white font-bold py-2.5 rounded hover:opacity-90 cursor-pointer"
              >
                {loading ? "Saving..." : "Publish Product"}
              </button>
            </form>

            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-bold mb-4">All Products ({products.length})</h2>
              <div className="space-y-3">
                {products.map((prod) => {
                  const finalPrice = Math.round(
                    prod.regularPrice - (prod.regularPrice * prod.discountPercentage) / 100
                  );
                  return (
                    <div key={prod._id} className="flex items-center justify-between border p-3 rounded">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.images?.[0] || "https://via.placeholder.com/60"}
                          alt={prod.title}
                          className="w-14 h-14 object-cover rounded"
                        />
                        <div>
                          <h3 className="font-bold">{prod.title}</h3>
                          <p className="text-xs text-slate-500">
                            {prod.category} {prod.gender ? `> ${prod.gender}` : ""} {prod.subCategory ? `> ${prod.subCategory}` : ""} | ⭐ {prod.rating || "4.9"}
                          </p>
                          {prod.sizes && prod.sizes.length > 0 && (
                            <p className="text-xs font-bold text-orange-600 mt-0.5">
                              Sizes: {prod.sizes.join(", ")}
                            </p>
                          )}
                          <p className="text-sm font-semibold">
                            ৳{finalPrice}{" "}
                            {prod.discountPercentage > 0 && (
                              <span className="line-through text-xs text-red-500 ml-1">
                                ৳{prod.regularPrice} (-{prod.discountPercentage}%)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteProduct(prod._id)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded cursor-pointer"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-lg shadow space-y-6">
            <h2 className="text-xl font-bold border-b pb-2">Website Color Theme & General Settings</h2>

            <div>
              <h3 className="font-bold text-slate-700 mb-3">🎨 Dynamic Website Color Theme</h3>
              <div className="grid sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded border">
                <div>
                  <label className="block text-sm font-medium mb-1">Primary Color (Header/Navbar)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="h-10 w-16 cursor-pointer"
                    />
                    <span className="text-xs font-mono">{settings.primaryColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Action Color (Buttons/Offers)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.actionColor}
                      onChange={(e) => setSettings({ ...settings, actionColor: e.target.value })}
                      className="h-10 w-16 cursor-pointer"
                    />
                    <span className="text-xs font-mono">{settings.actionColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Page Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.bgColor}
                      onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })}
                      className="h-10 w-16 cursor-pointer"
                    />
                    <span className="text-xs font-mono">{settings.bgColor}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Store / Website Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full border p-2 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">bKash Personal Number</label>
                <input
                  type="text"
                  value={settings.bkashNumber}
                  onChange={(e) => setSettings({ ...settings, bkashNumber: e.target.value })}
                  className="w-full border p-2 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nagad Personal Number</label>
                <input
                  type="text"
                  value={settings.nagadNumber}
                  onChange={(e) => setSettings({ ...settings, nagadNumber: e.target.value })}
                  className="w-full border p-2 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rocket Personal Number</label>
                <input
                  type="text"
                  value={settings.rocketNumber}
                  onChange={(e) => setSettings({ ...settings, rocketNumber: e.target.value })}
                  className="w-full border p-2 rounded text-sm"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Inside Dhaka Delivery Charge (৳)</label>
                <input
                  type="number"
                  value={settings.insideDhakaCharge}
                  onChange={(e) => setSettings({ ...settings, insideDhakaCharge: Number(e.target.value) })}
                  className="w-full border p-2 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Outside Dhaka Delivery Charge (৳)</label>
                <input
                  type="number"
                  value={settings.outsideDhakaCharge}
                  onChange={(e) => setSettings({ ...settings, outsideDhakaCharge: Number(e.target.value) })}
                  className="w-full border p-2 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">WhatsApp Number (with 880)</label>
                <input
                  type="text"
                  placeholder="8801700000000"
                  value={settings.whatsappNumber}
                  onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                  className="w-full border p-2 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Facebook Page Username (Messenger)</label>
                <input
                  type="text"
                  placeholder="yourpageusername"
                  value={settings.messengerUsername}
                  onChange={(e) => setSettings({ ...settings, messengerUsername: e.target.value })}
                  className="w-full border p-2 rounded text-sm"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-700">🖼️ Homepage Sliders / Banners (একাধিক যোগ করুন)</h3>
                <button
                  type="button"
                  onClick={handleAddSlider}
                  className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1 hover:bg-emerald-700 cursor-pointer"
                >
                  <FaPlus /> আরেকটি স্লাইডার যোগ করুন
                </button>
              </div>

              {settings.sliders?.map((slider, index) => (
                <div key={index} className="grid sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded border relative items-center">
                  <div className="space-y-1">
                    <input
                      type="url"
                      placeholder="Image URL"
                      value={slider.imageUrl || ""}
                      onChange={(e) => {
                        const newSliders = [...settings.sliders];
                        newSliders[index].imageUrl = e.target.value;
                        setSettings({ ...settings, sliders: newSliders });
                      }}
                      className="border p-2 rounded w-full text-sm"
                    />
                    <label className="cursor-pointer bg-white border border-dashed border-slate-400 p-1 rounded text-center text-[11px] font-semibold text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1">
                      <FaCamera /> ছবি তুলুন / গ্যালারি
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) =>
                          handleImageFileChange(e, (url) => {
                            const newSliders = [...settings.sliders];
                            newSliders[index].imageUrl = url;
                            setSettings({ ...settings, sliders: newSliders });
                          })
                        }
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="Headline"
                    value={slider.title || ""}
                    onChange={(e) => {
                      const newSliders = [...settings.sliders];
                      newSliders[index].title = e.target.value;
                      setSettings({ ...settings, sliders: newSliders });
                    }}
                    className="border p-2 rounded text-sm h-10"
                  />
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Subtitle"
                      value={slider.subtitle || ""}
                      onChange={(e) => {
                        const newSliders = [...settings.sliders];
                        newSliders[index].subtitle = e.target.value;
                        setSettings({ ...settings, sliders: newSliders });
                      }}
                      className="border p-2 rounded text-sm h-10 flex-1"
                    />
                    {settings.sliders.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSlider(index)}
                        className="text-red-600 hover:bg-red-100 p-2 rounded cursor-pointer"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: settings.primaryColor }}
              className="text-white px-6 py-3 rounded font-bold flex items-center gap-2 hover:opacity-90 cursor-pointer"
            >
              <FaCheckCircle /> {loading ? "Saving..." : "Save All Settings & Theme"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}