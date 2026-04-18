import logger from "../../config/logger.js";
import {
  createRazorpayOrderService,
  verifyRazorpayPaymentService,
} from "../../services/user/paymentService.js";
import { sendResponse } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";

export const createRazorpayOrderController = async (req, res) => {
  const userId = req.user._id;
  const { amount } = req.body;

  logger.info(
    `Request received: Create Razorpay order instance for user ${userId}`,
  );
  const razorpayOrder = await createRazorpayOrderService(userId, amount);

  sendResponse(
    res,
    {
      message: "Razorpay order created successfully",
      razorpayOrder,
    },
    STATUS_CODES.CREATED,
  );
};

export const verifyRazorpayPaymentController = async (req, res) => {
  const userId = req.user._id;
  const paymentData = req.body;
  logger.info(`Request received: Verify Razorpay payment for user ${userId}`);
  const result = await verifyRazorpayPaymentService(userId, paymentData);
  sendResponse(
    res,
    {
      message: "Payment successfully verified",
      result,
    },
    STATUS_CODES.OK,
  );
};
