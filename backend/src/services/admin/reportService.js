import Order from "../../models/orderModel.js";

export const getSalesReportData = async (filterType, startDate, endDate) => {
    let matchStage = { status: { $nin: ["Cancelled", "Returned"] } };

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

    const report = await Order.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalAmount: { $sum: "$pricing.totalAmount" },
                totalCouponDiscount: { $sum: "$pricing.couponDiscount" },
                totalOfferDiscount: { $sum: "$pricing.offerDiscount" },
            }
        }
    ]);

    const orders = await Order.find(matchStage).populate('userId', 'name email').sort({ createdAt: -1 });

    if (report.length > 0) {
        return {
            summary: report[0],
            orders
        }
    } else {
         return {
            summary: {
                totalOrders: 0,
                totalAmount: 0,
                totalCouponDiscount: 0,
                totalOfferDiscount: 0,
            },
            orders: []
        };
    }
}
