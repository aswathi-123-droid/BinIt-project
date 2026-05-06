import * as couponService from "../../services/admin/couponService.js";
import { sendResponse } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";

export const createCouponController = async (req, res) => {
  const newCoupon = await couponService.createCoupon(req.body);
  sendResponse(
    res,
    { message: "Coupon created successfully", data: newCoupon },
    STATUS_CODES.CREATED,
  );
};

export const updateCouponController = async (req, res, next) => {
  const { id } = req.params;
  const updatedCoupon = await couponService.updateCoupon(id, req.body);
  sendResponse(
    res,
    { message: "Coupon updated successfully", data: updatedCoupon },
    STATUS_CODES.OK,
  );
};

export const getAllCouponsController = async (req, res) => {
  const coupons = await couponService.getAllCoupons();
  sendResponse(res, { data: coupons }, STATUS_CODES.OK);
};

export const toggleCouponStatusController = async (req, res) => {
  const { id } = req.params;
  const updatedCoupon = await couponService.toggleCouponStatus(id);
  sendResponse(
    res,
    {
      message: `Coupon ${updatedCoupon.isActive ? "activated" : "deactivated"} successfully`,
      data: updatedCoupon,
    },
    STATUS_CODES.OK,
  );
};

export const deleteCouponController = async (req, res) => {
  const { id } = req.params;
  await couponService.deleteCoupon(id);
  sendResponse(
    res,
    { message: "Coupon deleted successfully" },
    STATUS_CODES.OK,
  );
};
