import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    altPhone: { type: String },
    district: { type: String, required: true },
    thana: { type: String, required: true },
    address: { type: String, required: true },
    deliveryArea: { 
      type: String, 
      enum: ["inside", "outside", "inside_dhaka", "outside_dhaka", "Inside Dhaka", "Outside Dhaka"], 
      required: true 
    },
    
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        title: String,
        price: Number,
        quantity: Number,
        size: String, // 👈 এখানে সাইজ ফিল্ড যুক্ত করে দেওয়া হয়েছে
        image: String,
      },
    ],

    productTotal: { type: Number, required: true }, 
    deliveryCharge: { type: Number, required: true }, 

    paymentMethod: { type: String, enum: ["bKash", "Nagad", "Rocket"], required: true },
    senderNumber: { type: String, required: true },
    transactionId: { type: String, required: true, unique: true }, 

    orderStatus: {
      type: String,
      enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);