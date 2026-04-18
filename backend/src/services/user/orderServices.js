import { calculateBestDiscount } from "../../../../frontend/src/utils/helpers.js";
import logger from "../../config/logger.js";
import Address from "../../models/address.model.js";
import Cart from "../../models/cartModel.js";
import Coupon from "../../models/couponModel.js";
import Order from "../../models/orderModel.js";
import Product from "../../models/product.model.js";
import Wallet from "../../models/walletModel.js";
import { AppError } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";
import { creditWallet, debitWallet } from "../../utils/walletHelper.js";
import { getCartWithSummary } from "./cartServices.js";

export const createOrder = async (userId, orderData) => {
  const { addressId, paymentMethod, pickupDate, pickupTimeSlot, useWallet } =
    orderData;
  const { cart, summary } = await getCartWithSummary(userId);
  if (!cart || cart.items.length === 0) {
    throw new AppError("Cart is empty", STATUS_CODES.BAD_REQUEST);
  }

  for (const item of cart.items) {
    if (item.productId && item.productId.type === "store") {
      if (item.quantity > item.productId.stock) {
        throw new AppError(
          `Insufficient stock for ${item.name}. Only ${item.productId.stock} left.`,
          STATUS_CODES.BAD_REQUEST,
        );
      }
    }
  }

  let isPickupRequired = false;

  for (const item of cart.items) {
    if (
      item.productId &&
      (item.productId.type === "recyclable" || item.productId.type === "junk")
    ) {
      isPickupRequired = true;
      break;
    }
  }

  let finalPickupDate = pickupDate;
  let finalPickupTimeSlot = pickupTimeSlot;

  if (isPickupRequired) {
    if (!pickupDate || !pickupTimeSlot) {
      throw new AppError(
        "Pickup date and time are required for recycling/junk pickup.",
        STATUS_CODES.BAD_REQUEST,
      );
    }
  } else {
    if (!finalPickupDate) {
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 3);
      finalPickupDate = deliveryDate;
    }
    if (!finalPickupTimeSlot) {
      finalPickupDate = new Date();
    }
  }

  const address = await Address.findById(addressId);
  if (!address) {
    throw new AppError("Address not found", STATUS_CODES.NOT_FOUND);
  }

  let amountToPayOnline = summary ? summary.totalAmount : 0;
  let walletMoneyDeducted = 0;
  let finalPaymentMethod = paymentMethod;

  if (useWallet && paymentMethod !== "COD") {
    const wallet = await Wallet.findOne({ user: userId });
    const currentBalance = wallet ? wallet.balance : 0;

    if (currentBalance > 0) {
      if (currentBalance >= amountToPayOnline) {
        walletMoneyDeducted = amountToPayOnline;
        amountToPayOnline = 0;

        await debitWallet(
          userId,
          walletMoneyDeducted,
          "ORDER_PURCHASE",
          "Paid fully using Wallet",
        );
        finalPaymentMethod = "Wallet";
      } else {
        walletMoneyDeducted = currentBalance;
        amountToPayOnline -= currentBalance;

        await debitWallet(
          userId,
          walletMoneyDeducted,
          "ORDER_PURCHASE",
          "Partial payment for Order",
        );
        finalPaymentMethod = "Wallet_and_Online";
      }
    }
  }

  if (summary) {
    summary.walletAmountUsed = walletMoneyDeducted;
    summary.amountToPayOnline = amountToPayOnline;
  }

  let appliedCouponCode = null;
  if (cart.appliedCoupon && summary.couponDiscount > 0) {
    const coupon = await Coupon.findById(cart.appliedCoupon);
    if (coupon) {
      coupon.usedCount += 1;
      await coupon.save();

      appliedCouponCode = coupon.code;
    }
  }

  const newOrder = new Order({
    userId,
    orderId: `#ORD-${Date.now().toString().slice(-6)}`,
    couponCode: appliedCouponCode,
    items: cart.items.map((item) => {
      const product = item.productId;
      const category = product?.categoryId;
      let itemDiscount = 0;

      if (product?.type === "store") {
        itemDiscount = calculateBestDiscount(
          item.price,
          product.offer,
          category?.offer,
        );
      }
      return {
        productId: product,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        offerDiscount: itemDiscount,
        image: product.image[0],
        selectionType: item.selectionType,
        selectionName: item.selectionName,
        userUploadedImages: item.userUploadedImages || [],
      };
    }),
    pricing: summary || {
      subtotal: 0,
      platformFee: 0,
      offerDiscount: 0,
      couponDiscount: 0,
      totalAmount: 0,
      storeItems: 0,
      pickupServices: 0,
      earnings: 0,
      walletAmountUsed: 0,
      amountToPayOnline: 0,
    },
    pickupAddress: {
      name: address.name,
      phone: address.phone,
      street: `${address.flat}, ${address.street}, ${address.locality}`,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    },
    pickupDate: finalPickupDate,
    pickupTimeSlot: finalPickupTimeSlot,
    paymentMethod: finalPaymentMethod,
    paymentStatus: finalPaymentMethod !== "COD" ? "Completed" : "Pending",
    status: "Placed",
  });

  await newOrder.save();

  for (const item of cart.items) {
    if (item.productId && item.productId.type === "store") {
      await Product.findByIdAndUpdate(item.productId._id, {
        $inc: { stock: -item.quantity },
      });
    }
  }
  cart.items = [];
  cart.summary = {
    subtotal: 0,
    earning: 0,
    platformFee: 0,
    total: 0,
    storeItems: 0,
    pickupServices: 0,
    earnings: 0,
  };

  await cart.save();

  logger.info(
    `Order created successfully for user ${userId}. Order ID: ${newOrder.orderId}`,
  );

  return newOrder;
};

export const getUserOrders = async (userId) => {
  const orders = await Order.find({ userId })
    .populate({
      path: "items.productId",
      select: "name type price image unit",
    })
    .sort({ createdAt: -1 });

  logger.info(`Fetched ${orders.length} orders for user ${userId}`);

  return orders;
};

export const getOrderById = async (userId, orderId) => {
  const order = await Order.findOne({
    orderId: orderId,
    userId: userId,
  }).populate({
    path: "items.productId",
    select: "name type price image unit",
  });

  if (!order) {
    logger.warn(
      `Order not found or unauthorized access attempt. User: ${userId}, Order: ${orderId}`,
    );
    throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Order not found");
  }

  logger.info(
    `Successfully fetched details for order ${orderId} by user ${userId}`,
  );

  return order;
};

export const cancelOrderService = async (
  userId,
  orderId,
  reason,
  isPickupMode,
) => {
  const order = await Order.findOne({ orderId, userId }).populate(
    "items.productId",
  );
  if (!order) {
    logger.warn(
      `Cancel failed: Order not found. User: ${userId}, Order: ${orderId}`,
    );
    throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Order not found");
  }
  const nonCancellableStatuses = [
    "Cancelled",
    isPickupMode ? "Completed" : "Delivered",
  ];
  if (
    nonCancellableStatuses.includes(
      isPickupMode ? order.pickupStatus : order.status,
    )
  ) {
    logger.warn(
      `Cancel failed: Invalid status ${order.status}. User: ${userId}, Order: ${orderId}`,
    );
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "INVALID_ACTION",
      "Cannot cancel order at this stage",
    );
  }

  if (isPickupMode) {
    order.items.forEach((item) => {
      if (
        item.productId &&
        (item.productId.type === "junk" ||
          item.productId.type === "recyclable") &&
        item.itemStatus !== "Cancelled"
      ) {
        item.itemStatus = "Cancel Pending";
      }
    });
  } else {
    order.items.forEach((item) => {
      if (
        (!item.productId || item.productId.type === "store") &&
        item.itemStatus !== "Cancelled"
      ) {
        item.itemStatus = "Cancel Pending";
      }
    });
  }

  if (isPickupMode) {
    order.pickupCancellation = {
      status: "Pending",
      reason: reason,
      timestamp: new Date(),
      cancelledBy: userId,
    };
  } else {
    order.orderCancellation = {
      status: "Pending",
      reason: reason,
      timestamp: new Date(),
      cancelledBy: userId,
    };
  }

  await order.save();
  logger.info(`Order ${orderId} cancelled successfully by user ${userId}`);
  return order;
};

export const returnOrderService = async (userId, orderId, reason) => {
  const order = await Order.findOne({ orderId, userId });
  if (!order) {
    logger.warn(
      `Return failed: Order not found. User: ${userId}, Order: ${orderId}`,
    );
    throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Order not found");
  }

  const returnableStatuses = ["Delivered"];

  if (!returnableStatuses.includes(order.status)) {
    logger.warn(
      `Return failed: Order not completed. Status: ${order.status}. User: ${userId}`,
    );
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "INVALID_ACTION",
      "Only completed orders can be returned",
    );
  }

  if (order.return && order.return.timestamp) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "INVALID_ACTION",
      "Return request already exists",
    );
  }

  order.return = {
    reason,
    status: "Pending",
    timestamp: new Date(),
  };
  await order.save();
  logger.info(
    `Return request submitted for order ${orderId} by user ${userId}`,
  );
  return order;
};

export const cancelOrderItemService = async (
  userId,
  orderId,
  itemId,
  reason,
  isPickupMode,
) => {
  const order = await Order.findOne({ orderId, userId }).populate(
    "items.productId",
  );

  if (!order) {
    logger.warn(
      `Cancel item failed: Order not found. User: ${userId}, Order: ${orderId}`,
    );
    throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Order not found");
  }

  const nonCancellableStatuses = [
    "Cancelled",
    isPickupMode ? "Completed" : "Delivered",
  ];

  if (
    nonCancellableStatuses.includes(
      isPickupMode ? order.pickupStatus : order.status,
    )
  ) {
    logger.warn(
      `Cancel item failed: Invalid status ${order.status}. User: ${userId}, Order: ${orderId}`,
    );
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "INVALID_ACTION",
      "Cannot cancel an item at this order stage",
    );
  }

  const item = order.items.find((item) => item._id.toString() === itemId);

  if (!item) {
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "NOT_FOUND",
      "Item not found in this order",
    );
  }

  if (item.itemStatus === "Cancelled" || item.itemStatus === "Cancel Pending") {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "BAD_REQUEST",
      "Item is already cancelled or pending",
    );
  }

  item.itemStatus = "Cancel Pending";
  item.cancellationReason = reason;

  await order.save();

  logger.info(
    `Item ${itemId} from order ${orderId} marked as Cancelled by user ${userId}`,
  );

  return order;
};

export const returnOrderItemService = async (
  userId,
  orderId,
  itemId,
  reason,
) => {
  const order = await Order.findOne({ orderId, userId }).populate(
    "items.productId",
  );

  if (!order) {
    logger.warn(
      `Return item failed: Order not found. User: ${userId}, Order: ${orderId}`,
    );
    throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Order not found");
  }

  const returnableStatuses = ["Delivered"];
  if (!returnableStatuses.includes(order.status)) {
    logger.warn(
      `Return item failed: Order not delivered. Status: ${order.status}. User: ${userId}`,
    );
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "INVALID_ACTION",
      "Items can only be returned after the order is Delivered",
    );
  }

  const item = order.items.find((item) => item._id.toString() === itemId);

  if (!item) {
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "NOT_FOUND",
      "Item not found in this order",
    );
  }

  if (
    item.itemStatus === "Cancelled" ||
    item.itemStatus === "Returned" ||
    item.itemStatus === "Return Pending"
  ) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "BAD_REQUEST",
      `Cannot return this item because its status is already: ${item.itemStatus}`,
    );
  }

  if (!item.productId || item.productId.type !== "store") {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "INVALID_ACTION",
      "Only store purchases can be returned. Scrap/Junk pickups cannot be returned.",
    );
  }

  item.itemStatus = "Return Pending";

  item.returnReason = reason;

  await order.save();

  logger.info(
    `Item ${itemId} from order ${orderId} marked as Return Pending by user ${userId}`,
  );

  return order;
};
