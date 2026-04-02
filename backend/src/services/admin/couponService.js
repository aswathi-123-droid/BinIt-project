import Coupon from "../../models/couponModel.js"
import { AppError } from "../../utils/appError.js";

export const createCoupon = async (couponData) => {
    const existingCoupon = await Coupon.findOne({ code: couponData.code.toUpperCase() });
    if (existingCoupon) {
        throw new AppError(400, "DUPLICATE_CODE", "A coupon with this code already exists.");
    }
    
    couponData.code = couponData.code.toUpperCase();
    
    return await Coupon.create(couponData);
};

export const updateCoupon = async (couponId, updateData) => {
    if (updateData.code) {
        const existing = await Coupon.findOne({ 
            code: updateData.code.toUpperCase(), 
            _id: { $ne: couponId } 
        });
        if (existing) {
            throw new AppError(400, "DUPLICATE_CODE", "Another coupon with this code already exists.");
        }
        updateData.code = updateData.code.toUpperCase();
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(
        couponId, 
        updateData, 
        { new: true, runValidators: true }
    );

    if (!updatedCoupon) throw new AppError(404, "NOT_FOUND", "Coupon not found");
    return updatedCoupon;
};


export const getAllCoupons = async () => {
    return await Coupon.find().sort({ createdAt: -1 });
};

export const toggleCouponStatus = async (couponId) => {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) throw new AppError(404, "NOT_FOUND", "Coupon not found");
    
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    return coupon;
};

export const deleteCoupon = async (couponId) => {
    const deleted = await Coupon.findByIdAndDelete(couponId);
    if (!deleted) throw new AppError(404, "NOT_FOUND", "Coupon not found");
    return deleted;
};
