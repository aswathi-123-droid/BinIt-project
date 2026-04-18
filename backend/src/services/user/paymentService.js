import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";
import logger from "../../config/logger.js";

const razorpayInstance = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrderService = async (userId, amount) => {
  if (!amount) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "MISSING_FIELD",
      "Payment amount is required",
    );
  }

  const options = {
    amount: amount * 100,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const razorpayOrder = await razorpayInstance.orders.create(options);

    if (!razorpayOrder) {
      throw new AppError(
        STATUS_CODES.INTERNAL_SERVER_ERROR,
        "RAZORPAY_ERROR",
        "Failed to create Razorpay order instance",
      );
    }

    logger.info(
      `Razorpay order ${razorpayOrder.id} successfully created for user ${userId}`,
    );
    return razorpayOrder;
  } catch (error) {
    logger.error(
      `Error in Razorpay integration for user ${userId}: ${error.message}`,
    );
    throw new AppError(
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      "RAZORPAY_ERROR",
      "Error communicating with payment gateway",
    );
  }
};

export const verifyRazorpayPaymentService = async (userId, paymentData) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    paymentData;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "MISSING_FIELD",
      "Incomplete payment verification details",
    );
  }

  const sign = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSign = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature !== expectedSign) {
    logger.warn(
      `Invalid payment signature from user ${userId} for Razorpay order ${razorpay_order_id}`,
    );
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "INVALID_SIGNATURE",
      "Payment signature verification failed",
    );
  }

  logger.info(
    `Payment verified successfully for Razorpay order ${razorpay_order_id} (User: ${userId})`,
  );

  return { verified: true, paymentId: razorpay_payment_id };
};
