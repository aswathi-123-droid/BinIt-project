import Order from "../../models/orderModel.js";
import WalletTransaction from "../../models/walletTransactionModel.js";

export const getSalesReportData = async (filterType, startDate, endDate) => {
    let matchStage = { 
        $or: [
            {status: { $nin: ["Cancelled", "Returned"] }},
            { 
            pickupStatus: { $nin: ["Cancelled", null] },
            pickupTimeSlot: { $ne: null } 
            }
        ]
     };

    const now = new Date();
    let start, end;

    if (filterType === "daily") {
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
    } else if (filterType === "weekly") {
        start = new Date(now.setDate(now.getDate() - now.getDay()));
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
    } else if (filterType === "monthly") {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (filterType === "yearly") {
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else if (filterType === "custom" && startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
    }

    if (start && end) {
        matchStage.createdAt = { $gte: start, $lte: end };
    }

    let refundMatchStage = {
        transactionReason: { $in: ["ORDER_CANCEL_REFUND", "ORDER_RETURN_REFUND", "ORDER_PURCHASE"] }
    };

    if (start && end) {
        refundMatchStage.createdAt = { $gte: start, $lte: end };
    }

    const refundReport = await WalletTransaction.aggregate([
        { $match: refundMatchStage },
        {
            $group: {
                _id: null,
                totalRefund: { $sum: "$amount" }
            }
        }
    ])

    const totalRefund = refundReport.length > 0 ? refundReport[0].totalRefund : 0;

    const report = await Order.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalStoreOrders: { 
                    $sum: {
                        $cond: [
                            { $and: [
                                   {$gt: ["$pricing.storeItems",0]},
                                   {$not: { $in: ["$status",["Cancelled", "Returned"]]}}
                            ]},
                            1,
                            0
                        ]
                    }
                },
                totalPickupsCount: {
                    $sum: {
                       $cond: [
                        { $and: [
                            {$not: {$in: ["$pickupStatus", [null, "Cancelled"]]}},
                            {$ne: ["$pickupTimeSlot", null]}
                        ]},
                        1,
                        0
                       ]
                    }
                },
                totalAmount: { $sum: "$pricing.totalAmount" },
                totalCouponDiscount: { $sum: "$pricing.couponDiscount" },
                totalOfferDiscount: { $sum: "$pricing.offerDiscount" },
            }
        }
    ]);

    const orders = await Order.find(matchStage).populate('userId', 'name email').sort({ createdAt: -1 });

    if (report.length > 0) {
        const summary = report[0];
        summary.totalRefund = totalRefund;

        return {
            summary,
            orders
        }
    } else {
         return {
            summary: {
                totalStoreOrders: 0,
                totalPickupsCount: 0,
                totalAmount: 0,
                totalCouponDiscount: 0,
                totalOfferDiscount: 0,
                totalRefund: totalRefund 
            },
            orders: []
        };
    }
}

export const getBestCust = async(filterType, startDate, endDate) => {
    let matchStage = { 
        $or: [
            {status: { $nin: ["Cancelled", "Returned"] }},
            { 
            pickupStatus: { $nin: ["Cancelled", null] },
            pickupTimeSlot: { $ne: null } 
            }
        ]
     };

    const now = new Date();
    let start, end;

    if (filterType === "daily") {
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
    } else if (filterType === "weekly") {
        start = new Date(now.setDate(now.getDate() - now.getDay()));
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
    } else if (filterType === "monthly") {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (filterType === "yearly") {
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else if (filterType === "custom" && startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
    }

    if (start && end) {
        matchStage.createdAt = { $gte: start, $lte: end };
    }
    console.log(matchStage,"llil")
     const order = await Order.aggregate([
        {
            $match: matchStage
        },
        {
            $group: {
                _id: "$userId",
                totalSpend: { $sum: "$pricing.totalAmount" },
                totalOrders: {$sum: 1}
            }
        },
        {
            $sort: {
                totalSpend: -1
            }
        },
        {
            $limit: 1
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "customerDetails"
            }
        },
        {
            $unwind: "$customerDetails"
        }
     ])
     console.log(order,"Checkkkkk")
    return order
}
