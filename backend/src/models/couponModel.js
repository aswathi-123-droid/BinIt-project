import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: { 
        type: String, 
        required: true, 
        unique: true, 
        uppercase: true, 
        trim: true 
    },
    description: { type: String },
    discountType: { 
        type: String, 
        enum: ["flat", "percent"], 
        required: true 
    },
    discountValue: { type: Number, required: true },
    minPurchaseAmount: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number, default: 0 }, 
    startDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, default: null }, 
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Coupon", couponSchema);
