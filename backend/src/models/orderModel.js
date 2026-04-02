
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
        price: Number, 
        image: String,
        selectionType: String,
        selectionName: String,
        offerDiscount: { type: Number, default: 0 },
        userUploadedImages: [{ type: String }],
        itemStatus: {
            type: String,
            enum: ["Active", "Cancelled", "Returned","Return Pending"],
            default: "Active"
        },
        cancellationReason: {
            type: String,
            default: null
        },
        returnReason: {
        type: String,
        default: null
    }
    }],

    // Pricing Breakdown
    pricing: {
        // subtotal: Number,
        // platformFee: Number,
        // couponDiscount: Number,
        // totalAmount: Number ,
        // walletAmountUsed: { type: Number, default: 0 },
        // amountToPayOnline: { type: Number, default: 0 }, 
        // offerDiscount: { type: Number, default: 0 },
        // storeItems: Number , 
        // pickupServices: Number ,
        // earnings: Number// Final amount to be paid/received
        subtotal: { type: Number, required: true },
        storeItems: { type: Number, default: 0 },
        pickupServices: { type: Number, default: 0 },
        earnings: { type: Number, default: 0 },
        platformFee: { type: Number, default: 0 },
        offerDiscount: { type: Number, default: 0 },
        couponDiscount: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true },
        walletAmountUsed: { type: Number, default: 0 },
        amountToPayOnline: { type: Number, default: 0 }
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
    pickupDate: { type: Date },
    pickupTimeSlot: { type: String},

    // Payment Logic
    paymentMethod: {
        type: String,
        enum: ["COD", "Razorpay", "Wallet" , "Wallet_and_Razorpay","Wallet_and_Online"],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Completed", "Failed", "Refunded"],
        default: "Pending"
    },
    transactionId: String, 
    status: {
        type: String,
        enum: ["Placed", "Confirmed", "Shipped", "Delivered", "Completed", "Cancelled", "Returned"],
        default: "Placed"
    },
    pickupStatus: {
    type: String,
    enum: ["Pending", "Agent Assigned", "Out for Pickup", "Completed", "Cancelled", null],
    default: "Pending" 
    },
    cancellation: {
        reason: { type: String, default: null },
        timestamp: { type: Date, default: null },
        cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
    },
    return: {
        reason: { type: String, default: null },
        status: { 
            type: String, 
            enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
            default: 'Pending'
        },
        timestamp: { type: Date, default: null }
    },
    couponCode: { type: String, default: null },
    couponDiscount: { type: Number, default: 0 },
    // assignedAgentId: { type: mongoose.Schema.Types.ObjectId, ref: "Agent" }, 

}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;