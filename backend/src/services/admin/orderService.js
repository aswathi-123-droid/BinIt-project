import logger from "../../config/logger.js";
import Coupon from "../../models/couponModel.js";
import Order from "../../models/orderModel.js";
import Product from "../../models/product.model.js";
import User from "../../models/user.model.js";
import {
  AppError,
  buildOrderQuery,
  getOrderSortOption,
  getPagination,
} from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";
import { creditWallet } from "../../utils/walletHelper.js";

export const getAllOrders = async (queryParams, isPickup = false) => {
  const {
    page,
    limit,
    statusFilter,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = queryParams;

  const { pageSize, skip, pageNumber } = getPagination(page, limit);

  const basePipeline = buildOrderQuery({ search, statusFilter }, isPickup);
  const sort = getOrderSortOption(sortBy);

  try {
    const itemsPipeline = [
      ...basePipeline,
      { $sort: sort },
      { $skip: skip },
      { $limit: pageSize },
    ];

    const countPipeline = [...basePipeline, { $count: "totalCount" }];

    const statsPipeline = [
      ...basePipeline,
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          placed: { $sum: { $cond: [{ $eq: [isPickup? "$pickupStatus" : "$status", isPickup ? "Pending" : "Placed"] }, 1, 0] } },
          inTransit: {
            $sum: { $cond: [{ $eq: [isPickup ? "$pickupStatus" : "$status", isPickup ? "Out for Pickup" : "Shipped"] }, 1, 0] },
          },
          delivered: {
            $sum: {
              $cond: [{ $in:  [
                isPickup ? "$pickupStatus" : "$status", 
                isPickup ? ["Completed"] : ["Delivered", "Completed"]
              ]  }, 1, 0],
            },
          },
        },
      },
    ];

    const [items, countResult, statsResult] = await Promise.all([
      Order.aggregate(itemsPipeline),
      Order.aggregate(countPipeline),
      Order.aggregate(statsPipeline),
    ]);
    console.log(statsResult)

    const totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;
    const stats =
      statsResult.length > 0
        ? statsResult[0]
        : { totalOrders: 0, placed: 0, inTransit: 0, delivered: 0 };

    if (stats._id === null) delete stats._id;

    logger.info(
      `Fetched admin ${isPickup ? "pickups" : "orders"} successfully. Page: ${pageNumber}`,
    );

    return {
      items,
      stats: {
        totalCount: stats.totalOrders,
        placedCount: stats.placed,
        inTransitCount: stats.inTransit,
        deliveredCount: stats.delivered,
      },
      pagination: {
        totalCount,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCount / pageSize),
        pageSize,
      },
    };
  } catch (error) {
    logger.error(
      `Error fetching admin ${isPickup ? "pickups" : "orders"}: ${error.message}`,
    );
    throw new AppError(
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      "DB_ERROR",
      "Failed to fetch orders",
    );
  }
};

export const getOrderById = async (orderId) => {
  const order = await Order.findOne({
    $or: [{ _id: orderId }, { orderId: orderId }],
  })
    .populate("userId", "name email phone")
    .populate({
      path: "items.productId",
      select: "name type price image unit",
    });

  if (!order) {
    logger.warn(`Admin attempt to view non-existent order. Order: ${orderId}`);
    throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Order not found");
  }

  logger.info(`Successfully fetched details for order ${orderId} by Admin`);

  return order;
};

export const updateOrderStatusService = async (
  orderId,
  newStatus,
  isPickupUpdate = false,
) => {
  let validStatuses;

  if (isPickupUpdate) {
    validStatuses = [
      "Pending",
      "Agent Assigned",
      "Out for Pickup",
      "Completed",
      "Cancelled",
    ];
  } else {
    validStatuses = [
      "Placed",
      "Confirmed",
      "Shipped",
      "Delivered",
      "Cancelled",
      "Returned",
    ];
  }

  if (!validStatuses.includes(newStatus)) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "INVALID_STATUS",
      "Invalid order status",
    );
  }

  const order = await Order.findOne({
    $or: [{ _id: orderId }, { orderId: orderId }],
  });

  if (!order) {
    throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Order not found");
  }

  if (isPickupUpdate) {
    order.pickupStatus = newStatus;
  } else {
    order.status = newStatus;
    if (newStatus === "Cancelled" || newStatus === "Returned") {
      order.items.forEach((item) => {
        if (item.productId?.type === "store" || !item.productId?.type) {
          item.itemStatus = newStatus;
        }
      });
    }
  }

  await order.save();

    if (isPickupUpdate && newStatus === "Completed") {
    
    const trueBalance = 
      (order.pricing.subtotal || 0) - 
      (order.pricing.offerDiscount || 0) - 
      (order.pricing.couponDiscount || 0) + 
      (order.pricing.platformFee || 0) - 
      (order.pricing.earnings || 0);
    if (trueBalance < 0 && order.paymentStatus !== "Refunded") {
      const amountToCredit = Math.abs(trueBalance);
      console.log(amountToCredit,"refund recycle")
      await creditWallet(
        order.userId,
        amountToCredit,
        "ORDER_PURCHASE", 
        `Scrap earnings credited for completed pickup in order ${order.orderId}`,
        order._id
      );

      order.paymentStatus = "Completed";
      await order.save();
    }
  }

  if (newStatus === "Delivered" || newStatus === "Completed") {
    const user = await User.findOneAndUpdate(
      {
        _id: order.userId,
        hasMadeFirstPurchase: false,
        referredBy: { $exists: true, $ne: null },
      },
      {
        $set: { hasMadeFirstPurchase: true },
      },
    );

    if (user) {
      await creditWallet(
        user.referredBy,
        50,
        "REFERRAL_BONUS",
        `Your friend ${user.name} completed their first order!`,
      );
      await creditWallet(
        user._id,
        50,
        "WELCOME_BONUS",
        `Welcome to BinIt! Here is your reward for completing your first order.`,
      );
    }
  }
  logger.info(
    `Admin updated order ${orderId} ${isPickupUpdate ? "pickup" : "delivery"} status to ${newStatus}`,
  );
  return order;
};

export const updateReturnStatusService = async (orderId, newReturnStatus) => {
  const order = await Order.findById(orderId).populate("items.productId");
  if (!order) {
    throw new AppError("Order not found", STATUS_CODES.NOT_FOUND);
  }

  if (!order.return || !order.return.status) {
    throw new AppError(
      "This order does not have an active return request",
      STATUS_CODES.BAD_REQUEST,
    );
  }

  if (
    order.return.status === "Completed" ||
    order.return.status === "Rejected"
  ) {
    throw new AppError(
      `Cannot change status of a return request that is already ${order.return.status}`,
      STATUS_CODES.BAD_REQUEST,
    );
  }

  order.return.status = newReturnStatus;

  if (newReturnStatus === "Completed") {
    order.status = "Returned";

    for (const item of order.items) {
      if (item.productId && item.productId.type === "store") {
        item.itemStatus = "Returned";

        await Product.findByIdAndUpdate(item.productId._id, {
          $inc: { stock: item.quantity },
        });
      }
    }

    if (order.paymentStatus === "PAID" || order.paymentMethod === "COD") {
      await creditWallet(
        order.userId,
        order.pricing.totalAmount,
        "ORDER_RETURN_REFUND",
        `Refund for returned order ${order.orderId}`,
        order._id,
      );
      logger.info(
        `Refunded ₹${order.pricing.totalAmount} to user wallet for returned order ${orderId}`,
      );
    }
  }

  await order.save();
  logger.info(
    `Order ${orderId} return status securely updated to ${newReturnStatus}`,
  );

  return order;
};

export const updateOrderItemReturnStatusService = async (
  orderId,
  itemId,
  status,
) => {
  const order = await Order.findById(orderId).populate("items.productId");

  if (!order) {
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "ORDER_NOT_FOUND",
      "Order not found",
    );
  }
  const item = order.items.id(itemId);

  if (!item) {
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "ITEM_NOT_FOUND",
      "Item not found in this order",
    );
  }

  item.itemStatus = status;
  if (status === "Returned") {
    if (item.productId) {
      await Product.findByIdAndUpdate(item.productId._id || item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    const previousTotalOwed = order.pricing.totalAmount;
    const initialPaid =
      (order.pricing.amountToPayOnline || 0) +
      (order.pricing.walletAmountUsed || 0);
    const previouslyRefunded = Math.max(0, initialPaid - previousTotalOwed);

    const activeItems = order.items.filter(
      (i) => i.itemStatus !== "Cancelled" && i.itemStatus !== "Returned",
    );

    let storeItems = 0,
      pickupServices = 0,
      earnings = 0,
      newOfferDiscount = 0;

    activeItems.forEach((i) => {
      const itemTotal = i.price;
      newOfferDiscount += (i.offerDiscount || 0) * i.quantity;
      if (i.productId?.type === "recyclable") earnings += itemTotal;
      else if (i.productId?.type === "store") storeItems += itemTotal;
      else pickupServices += itemTotal;
    });

    const newSubtotal = storeItems + pickupServices;
    const payableAmount = newSubtotal - newOfferDiscount;

    let newCouponDiscount = 0;
    if (order.couponCode) {
      const coupon = await Coupon.findOne({ code: order.couponCode });
      if (coupon && payableAmount >= (coupon.minPurchaseAmount || 0)) {
        if (coupon.discountType === "flat")
          newCouponDiscount = coupon.discountValue;
        else if (coupon.discountType === "percent") {
          let calc = payableAmount * (coupon.discountValue / 100);
          newCouponDiscount =
            coupon.maxDiscountAmount > 0
              ? Math.min(calc, coupon.maxDiscountAmount)
              : calc;
        }
      }
    }

    const platformFee = order.pricing.platformFee || 0;
    const newTotalOwed =
      newSubtotal -
      earnings +
      platformFee -
      newOfferDiscount -
      newCouponDiscount;

    const newTotalRefundAllowed = Math.max(0, initialPaid - newTotalOwed);
    const refundAmount = newTotalRefundAllowed - previouslyRefunded;

    order.pricing.storeItems = storeItems;
    order.pricing.pickupServices = pickupServices;
    order.pricing.earnings = earnings;
    order.pricing.subtotal = newSubtotal;
    order.pricing.offerDiscount = newOfferDiscount;
    order.pricing.couponDiscount = newCouponDiscount;
    order.pricing.totalAmount = newTotalOwed;

    if (
      ["Completed", "PAID"].includes(order.paymentStatus) ||
      order.paymentMethod === "COD"
    ) {
      if (refundAmount > 0) {
        await creditWallet(
          order.userId,
          refundAmount,
          "ORDER_RETURN_REFUND",
          `Refund for returned item in order ${order.orderId}`,
          order._id,
        );
        logger.info(
          `Refunded ₹${refundAmount} to user wallet for returned item in order ${orderId}`,
        );
      }
    }

    const storeItemsList = order.items.filter(
      (i) => !i.productId || i.productId.type === "store",
    );
    const allItemsReturned = storeItemsList.every(
      (i) => i.itemStatus === "Returned" || i.itemStatus === "Cancelled",
    );

    if (allItemsReturned && storeItemsList.length > 0) {
      order.status = "Returned";
      if (!order.return) order.return = {};
      order.return.status = "Completed";
    }
  }

  await order.save();
  return order;
};

export const adminApproveCancelOrderService = async (
  orderId,
  isPickupMode,
  isApproved,
) => {
  const order = await Order.findById(orderId).populate("items.productId");
  if (!order)
    throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Order not found");

  const currentCancellation = isPickupMode
    ? order.pickupCancellation
    : order.orderCancellation;
  if (!currentCancellation || currentCancellation.status !== "Pending") {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "INVALID_ACTION",
      "No pending cancellation request found",
    );
  }

  if (!isApproved) {
    if (isPickupMode) order.pickupCancellation.status = "Rejected";
    else order.orderCancellation.status = "Rejected";
    order.items.forEach((item) => {
      if (item.itemStatus === "Cancel Pending") {
        const isStoreItem = !item.productId || item.productId.type === "store";
        if (isPickupMode && !isStoreItem) item.itemStatus = "Active";
        if (!isPickupMode && isStoreItem) item.itemStatus = "Active";
      }
    });

    await order.save();
    logger.info(`Admin rejected cancellation for Order ${orderId}`);
    return order;
  }

  if (isPickupMode) order.pickupCancellation.status = "Approved";
  else order.orderCancellation.status = "Approved";
  const oldTotalPaid = order.pricing.totalAmount;

  if (isPickupMode) {
    order.pickupStatus = "Cancelled";
    order.items.forEach((item) => {
      const isStoreItem = !item.productId || item.productId.type === "store";
      if (item.itemStatus === "Cancel Pending" && !isStoreItem) {
        item.itemStatus = "Cancelled";
      }
    });
  } else {
    order.status = "Cancelled";
    for (const item of order.items) {
      if (item.itemStatus === "Cancel Pending") {
        item.itemStatus = "Cancelled";
        if (item.productId && item.productId.type === "store") {
          await Product.findByIdAndUpdate(item.productId._id, {
            $inc: { stock: item.quantity },
          });
        }
      }
    }
  }

  const activeItems = order.items.filter(
    (i) => i.itemStatus !== "Cancelled" && i.itemStatus !== "Returned",
  );
  if (activeItems.length === 0) {
    order.status = "Cancelled";
    order.pickupStatus = "Cancelled";
    order.pricing.subtotal = 0;
    order.pricing.storeItems = 0;
    order.pricing.pickupServices = 0;
    order.pricing.earnings = 0;
    order.pricing.offerDiscount = 0;
    order.pricing.couponDiscount = 0;
    order.pricing.totalAmount = 0;
    order.pricing.platformFee = 0;

    if (
      ["Completed", "PAID"].includes(order.paymentStatus) &&
      order.paymentMethod !== "COD" &&
      oldTotalPaid > 0
    ) {
      await creditWallet(
        order.userId,
        oldTotalPaid,
        "ORDER_CANCEL_REFUND",
        `Refund for complete cancellation of ${order.orderId}`,
        order._id,
      );
    }
  } else {
    let storeItems = 0,
      pickupServices = 0,
      earnings = 0,
      newOfferDiscount = 0;

    activeItems.forEach((i) => {
      const itemTotal = i.price * i.quantity;
      newOfferDiscount += (i.offerDiscount || 0) * i.quantity;
      if (i.productId?.type === "recyclable") earnings += itemTotal;
      else if (i.productId?.type === "store") storeItems += itemTotal;
      else pickupServices += itemTotal;
    });
    const newSubtotal = storeItems + pickupServices;
    const payableAmount = newSubtotal - newOfferDiscount;
    let newCouponDiscount = 0;
    if (order.couponCode) {
      const coupon = await Coupon.findOne({ code: order.couponCode });
      if (coupon && payableAmount >= (coupon.minPurchaseAmount || 0)) {
        if (coupon.discountType === "flat")
          newCouponDiscount = coupon.discountValue;
        else if (coupon.discountType === "percent") {
          let calc = payableAmount * (coupon.discountValue / 100);
          newCouponDiscount =
            coupon.maxDiscountAmount > 0
              ? Math.min(calc, coupon.maxDiscountAmount)
              : calc;
        }
      }
    }
    const platformFee = order.pricing.platformFee || 0;
    const newTotalOwed =
      newSubtotal -
      earnings +
      platformFee -
      newOfferDiscount -
      newCouponDiscount;
    const refundAmount = oldTotalPaid - newTotalOwed;
    order.pricing.storeItems = storeItems;
    order.pricing.pickupServices = pickupServices;
    order.pricing.earnings = earnings;
    order.pricing.subtotal = newSubtotal;
    order.pricing.offerDiscount = newOfferDiscount;
    order.pricing.couponDiscount = newCouponDiscount;
    order.pricing.totalAmount = newTotalOwed;
    if (
      ["Completed", "PAID"].includes(order.paymentStatus) &&
      order.paymentMethod !== "COD" &&
      refundAmount > 0
    ) {
      await creditWallet(
        order.userId,
        refundAmount,
        "ORDER_CANCEL_REFUND",
        `Refund for cancelled items in order ${order.orderId}`,
        order._id,
      );
    }
  }
  await order.save();
  logger.info(
    `Admin successfully approved and processed cancellation for Order ${orderId}`,
  );
  return order;
};

export const adminApproveCancelItemService = async (
  orderId,
  itemId,
  isApproved,
) => {
  const order = await Order.findById(orderId).populate("items.productId");
  if (!order)
    throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Order not found");

  const item = order.items.find((i) => i._id.toString() === itemId);
  if (!item)
    throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Item not found");

  if (item.itemStatus !== "Cancel Pending") {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "INVALID_ACTION",
      "Item is not pending cancellation",
    );
  }
  console.log(order, "11");
  console.log(item, "12");

  if (!isApproved) {
    item.itemStatus = "Active";

    const otherPending = order.items.some(
      (i) => i.itemStatus === "Cancel Pending",
    );
    if (!otherPending && order.cancellation)
      order.cancellation.status = "Rejected";

    await order.save();
    logger.info(
      `Admin rejected cancellation for Item ${itemId} in Order ${orderId}`,
    );
    return order;
  }

  item.itemStatus = "Cancelled";
  const oldTotalPaid = order.pricing.totalAmount;

  if (item.productId && item.productId.type === "store") {
    await Product.findByIdAndUpdate(item.productId._id, {
      $inc: { stock: item.quantity },
    });
  }

  const activeItems = order.items.filter(
    (i) => i.itemStatus !== "Cancelled" && i.itemStatus !== "Returned",
  );

  const activeStoreItems = activeItems.filter(
    (i) => i.productId?.type === "store",
  );
  const activePickupItems = activeItems.filter(
    (i) => i.productId?.type !== "store",
  );

  const allStoreItems = order.items.filter(
    (i) => i.productId?.type === "store",
  );
  if (allStoreItems.length > 0 && activeStoreItems.length === 0) {
    const hasReturnedStoreItems = allStoreItems.some(
      (i) => i.itemStatus === "Returned",
    );
    order.status = hasReturnedStoreItems ? "Returned" : "Cancelled";
  }

  const allPickupItems = order.items.filter(
    (i) => i.productId?.type !== "store",
  );
  if (allPickupItems.length > 0 && activePickupItems.length === 0) {
    order.pickupStatus = "Cancelled";
  }

  if (activeItems.length === 0) {
    order.status = "Cancelled";
    order.pickupStatus = "Cancelled";
    if (order?.cancellation) order.cancellation.status = "Approved";

    order.pricing.subtotal = 0;
    order.pricing.storeItems = 0;
    order.pricing.pickupServices = 0;
    order.pricing.earnings = 0;
    order.pricing.offerDiscount = 0;
    order.pricing.couponDiscount = 0;
    order.pricing.totalAmount = 0;
    order.pricing.platformFee = 0;

    if (
      ["Completed", "PAID"].includes(order.paymentStatus) &&
      order.paymentMethod !== "COD" &&
      oldTotalPaid > 0
    ) {
      await creditWallet(
        order.userId,
        oldTotalPaid,
        "ORDER_CANCEL_REFUND",
        `Refund for complete cancellation of ${order.orderId}`,
        order._id,
      );
    }
  } else {
    let storeItems = 0,
      pickupServices = 0,
      earnings = 0,
      newOfferDiscount = 0;
    console.log(activeItems, "13");
    activeItems.forEach((i) => {
      const itemTotal = i.price;
      newOfferDiscount += (i.offerDiscount || 0) * i.quantity;
      if (i.productId?.type === "recyclable") earnings += itemTotal;
      else if (i.productId?.type === "store") storeItems += itemTotal;
      else pickupServices += itemTotal;
    });

    const newSubtotal = storeItems + pickupServices;
    const payableAmount = newSubtotal - newOfferDiscount;

    let newCouponDiscount = 0;
    if (order.couponCode) {
      const coupon = await Coupon.findOne({ code: order.couponCode });
      if (coupon && payableAmount >= (coupon.minPurchaseAmount || 0)) {
        if (coupon.discountType === "flat")
          newCouponDiscount = coupon.discountValue;
        else if (coupon.discountType === "percent") {
          let calc = payableAmount * (coupon.discountValue / 100);
          newCouponDiscount =
            coupon.maxDiscountAmount > 0
              ? Math.min(calc, coupon.maxDiscountAmount)
              : calc;
        }
      }
    }

    const platformFee = order.pricing.platformFee || 0;
    const newTotalOwed =
      newSubtotal -
      earnings +
      platformFee -
      newOfferDiscount -
      newCouponDiscount;
    const refundAmount = oldTotalPaid - newTotalOwed;

    order.pricing.storeItems = storeItems;
    order.pricing.pickupServices = pickupServices;
    order.pricing.earnings = earnings;
    order.pricing.subtotal = newSubtotal;
    order.pricing.offerDiscount = newOfferDiscount;
    order.pricing.couponDiscount = newCouponDiscount;
    order.pricing.totalAmount = newTotalOwed;

    if (
      ["Completed", "PAID"].includes(order.paymentStatus) &&
      order.paymentMethod !== "COD" &&
      refundAmount > 0
    ) {
      await creditWallet(
        order.userId,
        refundAmount,
        "ORDER_CANCEL_REFUND",
        `Refund for cancelling item (${item.name}) in order ${order.orderId}`,
        order._id,
      );
    }
  }

  await order.save();
  console.log(order, "14");
  logger.info(`Admin approved item cancellation for ${itemId}`);
  return order;
};
