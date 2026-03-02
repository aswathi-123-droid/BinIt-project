
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    orderId: {
        type: String,
        unique: true,
        required: true
    },
    
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        quantity: Number,
        price: Number, // Price at the time of purchase
        image: String,
        selectionType: String, // 'variation', 'estimation', etc.
        selectionName: String,
        userUploadedImages: [{ type: String }],
        itemStatus: {
            type: String,
            enum: ["Active", "Cancelled", "Returned"],
            default: "Active"
        }
    }],

    // Pricing Breakdown
    pricing: {
        subtotal: Number,
        platformFee: Number,
        couponDiscount: Number,
        totalAmount: Number ,
        storeItems: Number , 
        pickupServices: Number ,
        earnings: Number// Final amount to be paid/received
    },

    // SNAPSHOT of Address
    pickupAddress: {
        name: String,
        phone: String,
        street: String,
        locality: String,
        city: String,
        state: String,
        pincode: String,
        coordinates: { lat: Number, lng: Number } // Optional: for map routing
    },

    // Scheduling
    pickupDate: { type: Date, required: true },
    pickupTimeSlot: { type: String, required: true },

    // Payment Logic
    paymentMethod: {
        type: String,
        enum: ["COD", "Razorpay", "Wallet"],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Completed", "Failed", "Refunded"],
        default: "Pending"
    },
    transactionId: String, // For Razorpay/Online payments

     status: {
        type: String,
        enum: ["Placed", "Confirmed", "Shipped", "Delivered", "Completed", "Cancelled", "Returned"],
        default: "Placed"
    },
       cancellation: {
        reason: { type: String, default: null },
        timestamp: { type: Date, default: null },
        cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Optional: to track if user or admin cancelled
    },
    return: {
        reason: { type: String, default: null },
        status: { 
            type: String, 
            enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
            default: 'Pending'
        },
        timestamp: { type: Date, default: null }
    }
    
    // assignedAgentId: { type: mongoose.Schema.Types.ObjectId, ref: "Agent" }, 

}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;