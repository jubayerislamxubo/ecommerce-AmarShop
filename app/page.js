"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  FaSearch,
  FaWhatsapp,
  FaFacebookMessenger,
  FaChevronLeft,
  FaChevronRight,
  FaFire,
  FaSignOutAlt,
  FaSpinner,
  FaTruck,
  FaShieldAlt,
  FaUndoAlt,
  FaCreditCard,
  FaStar,
  FaSortAmountDown,
  FaPlusCircle,
} from "react-icons/fa";

// অ্যাডমিন ইমেইল লিস্ট
const ADMIN_EMAILS = [
  "mdjubayerislamjubo60@gmail.com",
];

// মেইন ক্যাটাগরি লিস্ট
const MAIN_CATEGORIES = [
  "All",
  "Fashion",
  "Electronics",
  "Sports",
  "Jersey",
  "Bags",
  "Watches",
  "Shoes",
  "Cosmetics",
  
];

// Male সাব-আইটেমসমূহ
const MALE_ITEMS = [
  "All Male", "Shirt", "Pant", "T-Shirt", "Panjabi", "Cap", "Polo Shirt", "Formal Suit", 
  "Blazer", "Hoodies", "Jacket", "Sweatshirt", "Denim Jeans", "Cargo Pant", 
  "Chinos", "Pajama", "Lungi", "Waistcoat", "Tracksuit", "Joggers", 
  "Boxer / Innerwear", "Winter Coat", "Overcoat", "Windbreaker", "Cardigan", "Kurta for Men"
];

// Female সাব-আইটেমসমূহ
const FEMALE_ITEMS = [
  "All Female", "Saree", "Kurti", "Three-Piece", "Hijab", "Abaya", "Maxi Dress", "Lehenga", 
  "Gown", "Salwar Kameez", "Skirt", "Tops", "Tunics", "Kaftan", "Palazzo", 
  "Leggings", "Jeggings", "Crop Top", "Blouse", "Petticoat", "Oversized T-Shirt for Women", 
  "Cardigan for Women", "Shrug", "Poncho", "Nightwear / Nighty", "Burqa"
];

export default function Home() {
  const { data: session } = useSession();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  // ফিল্টারিং, সর্টিং ও পেজিনেশন স্টেট
  const [selectedMainCategory, setSelectedMainCategory] = useState("All");
  const [selectedGender, setSelectedGender] = useState(""); 
  const [selectedSubCategory, setSelectedSubCategory] = useState(""); 
  const [sortOrder, setSortOrder] = useState("default");
  
  // লোড মোর স্টেট (প্রথমে ১২টি দেখাবে)
  const [visibleCount, setVisibleCount] = useState(12);
  const [loadingMore, setLoadingMore] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState({
    siteName: "Amar Shop",
    primaryColor: "#0F172A",
    actionColor: "#F97316",
    bgColor: "#F8FAFC",
    whatsappNumber: "8801321901053",
    messengerUsername: "md.jubayer.islam.xubo",
    sliders: [
      {
        imageUrl: "",
        title: "আপনার পছন্দের সেরা প্রিমিয়াম পণ্য",
        subtitle: "সাশ্রয়ী মূল্যে সেরা মানের পণ্য এখন আপনার দোরগোড়ায়।",
      },
    ],
  });

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const slidersList = settings.sliders || [];
    if (slidersList.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidersList.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [settings.sliders]);

  const fetchData = async () => {
    try {
      const cachedSettings = localStorage.getItem("site_settings");
      if (cachedSettings) {
        const parsed = JSON.parse(cachedSettings);
        setSettings((prev) => ({
          ...prev,
          ...parsed,
          whatsappNumber: parsed.whatsappNumber || "8801321901053",
          messengerUsername: parsed.messengerUsername || "md.jubayer.islam.xubo",
        }));
      }

      setLoading(true);
      const [prodRes, setRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/settings"),
      ]);
      const prodData = await prodRes.json();
      const setData = await setRes.json();

      if (Array.isArray(prodData)) {
        setProducts(prodData);
        setFilteredProducts(prodData);
      }

      if (setData && !setData.error) {
        const updatedSettings = {
          ...setData,
          whatsappNumber: setData.whatsappNumber || "8801321901053",
          messengerUsername: setData.messengerUsername || "md.jubayer.islam.xubo",
        };
        setSettings(updatedSettings);
        localStorage.setItem("site_settings", JSON.stringify(updatedSettings));
      }
    } catch (err) {
      console.error("Error fetching home data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ফাইনাল প্রাইস হিসাব করার হেল্পার ফাংশন
  const getFinalPrice = (prod) => {
    return Math.round(prod.regularPrice - (prod.regularPrice * (prod.discountPercentage || 0)) / 100);
  };

  // ১০০% নিখুঁত ও স্মার্ট ফিল্টারিং + সর্টিং লজিক
  const applyFilters = (mainCat, gender, subCat, searchTxt = searchQuery, currentSort = sortOrder) => {
    let result = [...products];

    // ১. মেইন ক্যাটাগরি ফিল্টার
    if (mainCat !== "All") {
      result = result.filter((p) => p.category?.trim().toLowerCase() === mainCat.trim().toLowerCase());
      
      // ২. ফ্যাশন ক্যাটাগরি হলে জেন্ডার ও সাব-ক্যাটাগরি ফিল্টার
      if (mainCat === "Fashion") {
        if (gender) {
          result = result.filter((p) => p.gender?.trim().toLowerCase() === gender.trim().toLowerCase());
        }
        if (subCat && subCat !== "All Male" && subCat !== "All Female") {
          result = result.filter((p) => p.subCategory?.trim().toLowerCase() === subCat.trim().toLowerCase());
        }
      }
    }

    // ৩. সার্চ কিওয়ার্ড ফিল্টার
    if (searchTxt) {
      const q = searchTxt.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.subCategory?.toLowerCase().includes(q)
      );
    }

    // ৪. প্রাইস সর্টিং লজিক
    if (currentSort === "low-to-high") {
      result.sort((a, b) => getFinalPrice(a) - getFinalPrice(b));
    } else if (currentSort === "high-to-low") {
      result.sort((a, b) => getFinalPrice(b) - getFinalPrice(a));
    }

    setFilteredProducts(result);
    setVisibleCount(12); // ক্যাটাগরি বা সার্চ পরিবর্তন হলে আবার প্রথম ১২টা দেখাবে
  };

  const handleMainCategoryClick = (cat) => {
    setSelectedMainCategory(cat);
    if (cat === "Fashion") {
      setSelectedGender("Male");
      setSelectedSubCategory("All Male");
      applyFilters("Fashion", "Male", "All Male", searchQuery, sortOrder);
    } else {
      setSelectedGender("");
      setSelectedSubCategory("");
      applyFilters(cat, "", "", searchQuery, sortOrder);
    }
  };

  const handleFooterCategoryClick = (cat) => {
    handleMainCategoryClick(cat);
    window.scrollTo({ top: 380, behavior: "smooth" });
  };

  const handleGenderClick = (gender) => {
    setSelectedGender(gender);
    const defaultSub = gender === "Male" ? "All Male" : "All Female";
    setSelectedSubCategory(defaultSub);
    applyFilters("Fashion", gender, defaultSub, searchQuery, sortOrder);
  };

  const handleSubCategoryClick = (subCat) => {
    setSelectedSubCategory(subCat);
    applyFilters("Fashion", selectedGender, subCat, searchQuery, sortOrder);
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters(selectedMainCategory, selectedGender, selectedSubCategory, query, sortOrder);
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortOrder(newSort);
    applyFilters(selectedMainCategory, selectedGender, selectedSubCategory, searchQuery, newSort);
  };

  // আরও ১২টি প্রোডাক্ট লোড করার হ্যান্ডলার (Load More)
  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 12);
      setLoadingMore(false);
    }, 500); // আধ সেকেন্ডের প্রিমিয়াম লোডিং ফিল
  };

  // ট্রেন্ডিং প্রোডাক্ট ফিল্টার
  const trendingProducts = products.filter((p) => p.isTrending === true);

  const activeSliders = settings.sliders && settings.sliders.length > 0 ? settings.sliders : [{ title: "আপনার পছন্দের সেরা পণ্য", subtitle: "সাশ্রয়ী মূল্যে সেরা মানের পণ্য।", imageUrl: "" }];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % activeSliders.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + activeSliders.length) % activeSliders.length);

  const isAdmin = session && ADMIN_EMAILS.includes(session.user?.email);

  const formattedWhatsapp = settings.whatsappNumber
    ? settings.whatsappNumber.startsWith("88")
      ? settings.whatsappNumber
      : `88${settings.whatsappNumber.replace(/^0+/, "0")}`
    : "";

  const cleanMessengerId = settings.messengerUsername
    ? settings.messengerUsername.replace(/^https?:\/\/(www\.)?(facebook\.com|m\.me)\//, "").replace(/\/$/, "")
    : "";

  // প্রোডাক্ট কার্ড রেন্ডারার
  const renderProductCard = (prod, isTrendingCard = false) => {
    const finalPrice = getFinalPrice(prod);
    const savedAmount = prod.regularPrice - finalPrice;
    const inStock = prod.stock === undefined || prod.stock > 0;

    return (
      <Link
        href={`/product/${prod._id}`}
        key={prod._id}
        className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between cursor-pointer"
      >
        <div>
          <div className="relative w-full h-32 sm:h-52 overflow-hidden bg-slate-100">
            <Image
              src={prod.images?.[0] || "https://via.placeholder.com/300"}
              alt={prod.title}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover object-top group-hover:scale-110 transition duration-500"
            />
            {prod.discountPercentage > 0 && (
              <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-600 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg shadow-md uppercase tracking-wider z-10">
                -{prod.discountPercentage}% OFF
              </span>
            )}
            {isTrendingCard && (
              <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-amber-500 text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg shadow-md flex items-center gap-1 z-10">
                <FaFire /> HOT
              </span>
            )}
            <span
              className={`absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 rounded-md shadow-sm backdrop-blur-md z-10 ${
                inStock
                  ? "bg-emerald-500/90 text-white"
                  : "bg-slate-800/90 text-slate-200"
              }`}
            >
              {inStock ? "✓ In Stock" : "Out of Stock"}
            </span>
          </div>

          <div className="p-2.5 sm:p-4 space-y-1 sm:space-y-2">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 sm:px-2 rounded truncate max-w-[70%]">
                {prod.category} {prod.subCategory ? `> ${prod.subCategory}` : ""}
              </span>
              <span className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-bold text-amber-500">
                <FaStar size={10} className="sm:w-[11px] sm:h-[11px]" /> {prod.rating || "4.9"}
              </span>
            </div>

            <h3 className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-1 group-hover:text-orange-600 transition-colors">
              {prod.title}
            </h3>

            <div className="flex flex-wrap items-baseline justify-between gap-1 pt-0.5 sm:pt-1">
              <div className="flex items-baseline gap-1.5 sm:gap-2">
                <span className="text-sm sm:text-lg font-black text-slate-900">৳{finalPrice}</span>
                {prod.discountPercentage > 0 && (
                  <span className="line-through text-[10px] sm:text-xs font-semibold text-slate-400">৳{prod.regularPrice}</span>
                )}
              </div>
              {savedAmount > 0 && (
                <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                  Save ৳{savedAmount}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-2.5 sm:p-4 pt-0 sm:pt-0">
          <span
            style={{ backgroundColor: settings.actionColor }}
            className="block w-full text-center text-white text-[11px] sm:text-xs font-bold py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl shadow-sm group-hover:shadow-md group-hover:opacity-95 transition cursor-pointer"
          >
            🛍️ এখনই অর্ডার করুন
          </span>
        </div>
      </Link>
    );
  };

  return (
    <div style={{ backgroundColor: settings.bgColor }} className="min-h-screen text-slate-800 selection:bg-orange-500 selection:text-white flex flex-col justify-between">
      <div>
        {/* Top Notice Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900 text-white text-xs py-2 px-4 text-center font-medium tracking-wide shadow-sm">
          🚚 ক্যাশ অন ডেলিভারি এবং অগ্রিম ডেলিভারি চার্জ প্রযোজ্য! যেকোনো প্রয়োজনে কল করুন: <span className="font-bold underline">01321901053</span>
        </div>

        {/* Navbar Header */}
        <nav className="bg-white/95 backdrop-blur-md shadow-sm px-3 sm:px-6 py-3 sm:py-3.5 sticky top-0 z-50 border-b border-slate-100">
          <div className="max-w-7xl mx-auto flex flex-wrap md:flex-nowrap justify-between items-center gap-2.5 sm:gap-4">
            <Link
              href="/"
              className="text-lg sm:text-2xl font-black tracking-tight cursor-pointer flex items-center gap-2 shrink-0"
              style={{ color: settings.primaryColor }}
            >
              <span className="bg-slate-900 text-white p-1.5 rounded-lg text-base sm:text-lg">
                🛍️
              </span>
              <span>{settings.siteName}</span>
            </Link>

            {/* Right Actions (Mobile-friendly order) */}
            <div className="flex items-center gap-2 sm:gap-3 order-2 md:order-3 shrink-0">
              {session ? (
                <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 hover:bg-slate-200/70 px-2.5 sm:px-3 py-1.5 rounded-full border border-slate-200 transition">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 cursor-pointer"
                    title="View Profile"
                  >
                    <img
                      src={session.user?.image || "/default-avatar.png"}
                      alt={session.user?.name || "Profile"}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-orange-500 object-cover bg-white shrink-0"
                    />
                    <span className="text-xs font-bold text-slate-700 hidden md:inline hover:text-orange-600 transition max-w-[110px] truncate">
                      {session.user?.name}
                    </span>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full cursor-pointer transition"
                    title="Logout"
                  >
                    <FaSignOutAlt size={13} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signIn("google")}
                  className="text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-sm border border-slate-200 cursor-pointer transition flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>🌐</span>
                  <span>Google Login</span>
                </button>
              )}

              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 hover:scale-105 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-md cursor-pointer transition flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>⚙️</span>
                  <span>Admin</span>
                </Link>
              )}
            </div>

            {/* Search Box */}
            <div className="w-full md:flex-1 md:max-w-lg relative order-3 md:order-2">
              <input
                type="text"
                placeholder={`Search In ${settings.siteName || "AmarShop"}...`}
                value={searchQuery}
                onChange={handleSearch}
                className="w-full border border-slate-200 bg-slate-50/70 rounded-full py-2 sm:py-2.5 pl-4 sm:pl-5 pr-11 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all shadow-inner"
              />
              <button
                type="button"
                aria-label="Search"
                className="absolute right-1 top-1 bottom-1 px-3.5 sm:px-4 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition cursor-pointer flex items-center justify-center"
              >
                <FaSearch size={13} />
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 space-y-8">
      {/* ================= BANNER SLIDER ================= */}
          <div className="space-y-3">
            {/* Top Professional Header Bar */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-5 bg-orange-500 rounded-full"></span>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>✨</span>
                  <span>Featured Banner</span>
                </h2>
              </div>

              {/* Slide Counter Indicator */}
              {activeSliders.length > 1 && (
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                  {currentSlide + 1} / {activeSliders.length}
                </span>
              )}
            </div>

            {/* Mobile Compact & Light Overlay | Laptop/PC Kept Exactly As Before */}
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg sm:shadow-xl text-white h-[175px] sm:h-auto sm:min-h-[340px] flex items-center justify-center sm:justify-start bg-[#070b14] sm:bg-gradient-to-r sm:from-slate-900 sm:to-emerald-950">
              {activeSliders[currentSlide]?.imageUrl ? (
                <>
                  <img
                    key={activeSliders[currentSlide]?.imageUrl || currentSlide}
                    src={activeSliders[currentSlide].imageUrl}
                    alt={activeSliders[currentSlide]?.title || "Featured Banner"}
                    className="w-full h-full sm:absolute sm:inset-0 object-contain sm:object-cover object-center opacity-100 sm:opacity-85 sm:scale-105 animate-fadeIn transition-all duration-700 ease-out pointer-events-none select-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent sm:hidden pointer-events-none" />
                </>
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-800/40 via-transparent to-black/60 pointer-events-none" />
              )}

              {/* Text Layer: Mobile Compact Left | Laptop/PC Original */}
              <div className="absolute inset-y-0 left-0 sm:relative flex items-center sm:block pl-11 pr-6 sm:p-14 max-w-[78%] sm:max-w-2xl z-10 pointer-events-none">
                <div
                  key={`text-${currentSlide}`}
                  className="space-y-1 sm:space-y-4 transition-all duration-500 ease-out"
                >
                  <h1 className="text-lg sm:text-5xl font-extrabold sm:font-black tracking-tight leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] line-clamp-2 sm:line-clamp-none">
                    {activeSliders[currentSlide]?.title}
                  </h1>
                  <p className="text-[11px] sm:text-base text-slate-100 sm:text-slate-200 font-medium leading-snug sm:leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)] line-clamp-2 sm:line-clamp-none">
                    {activeSliders[currentSlide]?.subtitle}
                  </p>
                </div>
              </div>

              {/* Prev / Next Controls: Mobile Compact | Laptop/PC Original */}
              {activeSliders.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-2 sm:p-4 pointer-events-none z-30">
                  <button
                    type="button"
                    onClick={prevSlide}
                    aria-label="Previous slide"
                    className="bg-black/45 sm:bg-black/40 hover:bg-orange-500 sm:hover:bg-black/80 active:scale-95 text-white p-1.5 sm:p-3.5 rounded-full cursor-pointer transition-all duration-200 shadow-lg sm:shadow-xl pointer-events-auto"
                  >
                    <FaChevronLeft size={12} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                  <button
                    type="button"
                    onClick={nextSlide}
                    aria-label="Next slide"
                    className="bg-black/45 sm:bg-black/40 hover:bg-orange-500 sm:hover:bg-black/80 active:scale-95 text-white p-1.5 sm:p-3.5 rounded-full cursor-pointer transition-all duration-200 shadow-lg sm:shadow-xl pointer-events-auto"
                  >
                    <FaChevronRight size={12} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                </div>
              )}
            </div>
          </div>

         {/* ================= PREMIUM TRUST & FEATURE BAR ================= */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            <div className="relative h-full overflow-hidden bg-gradient-to-br from-white via-white to-orange-50/70 p-4 sm:p-6 rounded-2xl border border-orange-100/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col sm:flex-row items-center text-center sm:text-left gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white p-3 sm:p-4 rounded-2xl shadow-md shadow-orange-500/20 group-hover:scale-110 transition-transform duration-300 shrink-0">
                <FaTruck size={20} className="sm:w-[26px] sm:h-[26px]" />
              </div>
              <div className="relative z-10">
                <h4 className="text-xs sm:text-base font-extrabold text-slate-800 group-hover:text-orange-600 transition-colors">
                  Fast Home Delivery
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1 leading-snug">
                  2–3 days delivery across Bangladesh
                </p>
              </div>
              <FaTruck className="absolute -right-3 -bottom-3 text-orange-500/5 text-6xl sm:text-7xl pointer-events-none group-hover:scale-110 transition-transform" />
            </div>

            <div className="relative h-full overflow-hidden bg-gradient-to-br from-white via-white to-emerald-50/70 p-4 sm:p-6 rounded-2xl border border-emerald-100/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col sm:flex-row items-center text-center sm:text-left gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-3 sm:p-4 rounded-2xl shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300 shrink-0">
                <FaShieldAlt size={20} className="sm:w-[26px] sm:h-[26px]" />
              </div>
              <div className="relative z-10">
                <h4 className="text-xs sm:text-base font-extrabold text-slate-800 group-hover:text-emerald-600 transition-colors">
                  100% Original
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1 leading-snug">
                  Guaranteed quality & authenticity
                </p>
              </div>
              <FaShieldAlt className="absolute -right-3 -bottom-3 text-emerald-500/5 text-6xl sm:text-7xl pointer-events-none group-hover:scale-110 transition-transform" />
            </div>

            <div className="relative h-full overflow-hidden bg-gradient-to-br from-white via-white to-blue-50/70 p-4 sm:p-6 rounded-2xl border border-blue-100/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col sm:flex-row items-center text-center sm:text-left gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-3 sm:p-4 rounded-2xl shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300 shrink-0">
                <FaUndoAlt size={20} className="sm:w-[26px] sm:h-[26px]" />
              </div>
              <div className="relative z-10">
                <h4 className="text-xs sm:text-base font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">
                  Easy Return
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1 leading-snug">
                  7-day hassle-free replacement
                </p>
              </div>
              <FaUndoAlt className="absolute -right-3 -bottom-3 text-blue-500/5 text-6xl sm:text-7xl pointer-events-none group-hover:scale-110 transition-transform" />
            </div>

            <div className="relative h-full overflow-hidden bg-gradient-to-br from-white via-white to-purple-50/70 p-4 sm:p-6 rounded-2xl border border-purple-100/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col sm:flex-row items-center text-center sm:text-left gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white p-3 sm:p-4 rounded-2xl shadow-md shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300 shrink-0">
                <FaCreditCard size={20} className="sm:w-[26px] sm:h-[26px]" />
              </div>
              <div className="relative z-10">
                <h4 className="text-xs sm:text-base font-extrabold text-slate-800 group-hover:text-purple-600 transition-colors">
                  Secure Payment
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1 leading-snug">
                  bKash, Nagad & Cash on Delivery
                </p>
              </div>
              <FaCreditCard className="absolute -right-3 -bottom-3 text-purple-500/5 text-6xl sm:text-7xl pointer-events-none group-hover:scale-110 transition-transform" />
            </div>
          </div>

          {/* ================= TRENDING / HOT DEALS SECTION ================= */}
          {trendingProducts.length > 0 && selectedMainCategory === "All" && !searchQuery && (
            <section className="bg-gradient-to-br from-orange-50 via-amber-50/40 to-white p-5 sm:p-6 rounded-3xl border border-orange-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="bg-orange-500 text-white p-2 rounded-xl shadow-md animate-pulse">
                    <FaFire size={18} />
                  </span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900">ট্রেন্ডিং ও সেরা ডিল</h2>
                    <p className="text-xs text-slate-500">ক্রেتهای সবচেয়ে পছন্দের কালেকশন</p>
                  </div>
                </div>
                <span className="text-xs font-bold bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                  {trendingProducts.length} Items
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
                {trendingProducts.slice(0, 4).map((prod) => renderProductCard(prod, true))}
              </div>
            </section>
          )}

          {/* ================= MULTI-LEVEL CATEGORY NAVIGATION ================= */}
          <div className="space-y-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none items-center">
              {MAIN_CATEGORIES.map((cat, idx) => {
                const isSelected = selectedMainCategory === cat;
                return (
                  <button
                    key={idx}
                    onClick={() => handleMainCategoryClick(cat)}
                    style={{
                      backgroundColor: isSelected ? settings.actionColor : "#f1f5f9",
                      color: isSelected ? "#ffffff" : "#334155",
                    }}
                    className={`px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-sm whitespace-nowrap cursor-pointer transition-all duration-300 hover:scale-105 flex items-center gap-1.5 ${
                      isSelected ? "shadow-md" : "hover:bg-slate-200"
                    }`}
                  >
                    <span>{cat === "All" ? "🔥 সকল ক্যাটাগরি" : cat}</span>
                  </button>
                );
              })}
            </div>

            {selectedMainCategory === "Fashion" && (
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex gap-2 items-center">
                  <span className="text-xs font-bold text-slate-500 mr-2">বিভাগ:</span>
                  <button
                    onClick={() => handleGenderClick("Male")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                      selectedGender === "Male" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    👨 Male (পুরুষ)
                  </button>
                  <button
                    onClick={() => handleGenderClick("Female")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                      selectedGender === "Female" ? "bg-pink-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    👩 Female (নারী)
                  </button>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {selectedGender === "Male" &&
                    MALE_ITEMS.map((item, idx) => {
                      const isSubSelected = selectedSubCategory === item;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSubCategoryClick(item)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition ${
                            isSubSelected ? "bg-orange-500 text-white shadow" : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}

                  {selectedGender === "Female" &&
                    FEMALE_ITEMS.map((item, idx) => {
                      const isSubSelected = selectedSubCategory === item;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSubCategoryClick(item)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition ${
                            isSubSelected ? "bg-pink-500 text-white shadow" : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* ================= PRODUCTS SECTION WITH LOAD MORE ================= */}
          <section className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 border-l-4 pl-3 border-orange-500 flex items-center gap-2">
                পণ্যসমূহ <span className="text-xs bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full">({filteredProducts.length})</span>
              </h2>

              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
                <FaSortAmountDown className="text-slate-400" size={13} />
                <select
                  value={sortOrder}
                  onChange={handleSortChange}
                  className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="default">Default </option>
                  <option value="low-to-high">Low to High</option>
                  <option value="high-to-low">High to Low</option>
                </select>
              </div>
            </div>

            {loading && products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100 space-y-3">
                <FaSpinner className="animate-spin text-orange-500" size={32} />
                <p className="text-sm font-semibold text-slate-500">পণ্যগুলো লোড হচ্ছে...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm space-y-3">
                <span className="text-4xl">🔍</span>
                <p className="text-slate-500 text-sm font-medium">এই ক্যাটাগরিতে এই মুহূর্তে কোনো পণ্য পাওয়া যায়নি।</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                  {filteredProducts.slice(0, visibleCount).map((prod) => renderProductCard(prod, false))}
                </div>

                {/* LOAD MORE BUTTON SECTION */}
                {visibleCount < filteredProducts.length && (
                  <div className="flex justify-center pt-8 pb-4">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      style={{ borderColor: settings.actionColor, color: settings.actionColor }}
                      className="bg-white hover:bg-orange-50 font-black text-xs uppercase tracking-wider px-8 py-3.5 rounded-2xl shadow-sm border-2 transition-all duration-300 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
                    >
                      {loadingMore ? (
                        <>
                          <FaSpinner className="animate-spin" size={15} /> লোড হচ্ছে...
                        </>
                      ) : (
                        <>
                          <FaPlusCircle size={15} /> Load More ({filteredProducts.length - visibleCount} বাকি)
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </main>
      </div>

      {/* ================= PROFESSIONAL FOOTER SECTION ================= */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span className="bg-orange-500 text-white p-1.5 rounded-lg text-lg">🛍️</span> {settings.siteName}
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              আপনার আস্থার অনলাইন শপ। সাশ্রয়ী মূল্যে সেরা মানের প্রিমিয়াম পণ্য এখন আপনার দোরগোড়ায়। শতভাগ ক্যাশ অন ডেলিভারি সুবিধা!
            </p>
            <div className="pt-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">সহায়তা ও হটলাইন:</p>
              <a href={`tel:${settings.whatsappNumber}`} className="text-orange-400 font-extrabold text-base hover:underline">
                📞 01321901053
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-bold text-base tracking-wide border-l-2 border-orange-500 pl-3">
              গুরুত্বপূর্ণ লিংক
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-orange-400 transition flex items-center gap-2">👉 Home</Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-orange-400 transition flex items-center gap-2">👉 User Profile</Link>
              </li>
              {isAdmin && (
                <li>
                  <Link href="/admin" className="hover:text-orange-400 transition flex items-center gap-2">⚙️ Admin Dashboard</Link>
                </li>
              )}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-bold text-base tracking-wide border-l-2 border-orange-500 pl-3">
              জনপ্রিয় ক্যাটাগরি
            </h3>
            <ul className="space-y-2.5 text-sm grid grid-cols-2">
              {["Fashion", "Electronics", "Sports", "Watches", "Shoes", "Bags"].map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => handleFooterCategoryClick(cat)}
                    className="hover:text-orange-400 transition cursor-pointer text-left"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-bold text-base tracking-wide border-l-2 border-orange-500 pl-3">
              নিরাপদ লেনদেন ও পেমেন্ট
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              আমরা দিচ্ছি বিকাশ, নগদ, রকেটের মাধ্যমে নিরাপদ অগ্রিম ডেলিভারি চার্জ প্রদান এবং বাকি টাকা ক্যাশ অন ডেলিভারি (COD) সুবিধা।
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="bg-slate-800 text-pink-500 font-bold text-xs px-3 py-1.5 rounded border border-slate-700">bKash</span>
              <span className="bg-slate-800 text-orange-500 font-bold text-xs px-3 py-1.5 rounded border border-slate-700">Nagad</span>
              <span className="bg-slate-800 text-purple-500 font-bold text-xs px-3 py-1.5 rounded border border-slate-700">Rocket</span>
              <span className="bg-slate-800 text-emerald-400 font-bold text-xs px-3 py-1.5 rounded border border-slate-700">COD</span>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} <span className="text-white font-semibold">{settings.siteName}</span>. সর্বস্বত্ব সংরক্ষিত।</p>
          
          <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 shadow-inner">
            <span className="text-slate-400">Developed by</span>
            <a 
              href="https://portfolio-jse5.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-orange-400 font-bold hover:underline flex items-center gap-1 transition-all hover:text-orange-300"
            >
              MD. JUBAYER <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded">MERN Stack Developer ↗</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Floating Chat Icons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        {formattedWhatsapp && (
          <a
            href={`https://wa.me/${formattedWhatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            title="WhatsApp-এ মেসেজ দিন"
            className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all cursor-pointer flex items-center justify-center"
          >
            <FaWhatsapp size={24} />
          </a>
        )}
        {cleanMessengerId && (
          <a
            href={`https://m.me/${cleanMessengerId}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Messenger-A মেসেজ দিন"
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all cursor-pointer flex items-center justify-center"
          >
            <FaFacebookMessenger size={24} />
          </a>
        )}
      </div>
    </div>
  );
}