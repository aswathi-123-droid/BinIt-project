import logger from "../../config/logger.js";
import Order from "../../models/orderModel.js";
import { AppError, buildOrderQuery, getOrderSortOption, getPagination } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";

export const getAllOrders = async(queryParams, isPickup=false) => {
      const { 
        page, 
        limit, 
        statusFilter, 
        search, 
        sortBy = "createdAt",
        sortOrder = "desc" 
    } = queryParams;

    const { pageSize, skip, pageNumber} = getPagination(page,limit);

    const basePipeline = buildOrderQuery({search, statusFilter}, isPickup);

    const sort = getOrderSortOption(sortBy);

    try{
        const itemsPipeline = [...basePipeline,{$sort: sort},{$skip: skip},{$limit: pageSize}];
         
        const countPipeline = [...basePipeline,{$count:"totalCount"}];

        const statsPipeline = [
            ...basePipeline,
            {
               $group: {
                _id: null,
                totalOrders: {$sum: 1},
                placed: {$sum: { $cond: [{ $eq: ["$status", "Placed"]}, 1, 0] } },
                inTransit: {$sum: {$cond: [{ $eq: ["$status", "Shipped"]}, 1, 0] } },
                delivered: { $sum: { $cond: [{ $in: ["$status", ["Delivered", "Completed"]] }, 1, 0] } }
               }
            }
        ]

        const [items, countResult, statsResult] = await Promise.all([
            Order.aggregate(itemsPipeline),
            Order.aggregate(countPipeline),
            Order.aggregate(statsPipeline)
        ])

        const totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;
        const stats = statsResult.length > 0 ? statsResult[0] : { totalOrders: 0, placed: 0, inTransit: 0, delivered: 0 };
        
        console.log(stats,"kijjj")
        if(stats._id === null) delete stats._id;

        logger.info(`Fetched admin ${isPickup ? 'pickups' : 'orders'} successfully. Page: ${pageNumber}`);

                return {
            items,
            stats: {
                totalCount: stats.totalOrders,
                placedCount: stats.placed,
                inTransitCount: stats.inTransit,
                deliveredCount: stats.delivered
            },
            pagination: {
                totalCount,
                currentPage: pageNumber,
                totalPages: Math.ceil(totalCount / pageSize),
                pageSize,
            }
        };
    }catch(error){
        logger.error(`Error fetching admin ${isPickup ? 'pickups' : 'orders'}: ${error.message}`)
        throw new AppError(STATUS_CODES.INTERNAL_SERVER_ERROR, "DB_ERROR", "Failed to fetch orders");
    }
}

export const getOrderById = async (orderId) => {
    const order = await Order.findOne({ 
       $or: [{ _id: orderId }, { orderId: orderId }]
    })
    .populate("userId", "name email phone")
    .populate({
        path: "items.productId",
        select: "name type price image unit"
    });

    if (!order) {
        logger.warn(`Admin attempt to view non-existent order. Order: ${orderId}`);
        throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Order not found");
    }

    logger.info(`Successfully fetched details for order ${orderId} by Admin`);

    return order;
};


export const updateOrderStatusService = async (orderId, newStatus) => {
    const validStatuses = ["Placed", "Confirmed", "Shipped", "Delivered", "Cancelled", "Returned"];
    if (!validStatuses.includes(newStatus)) {
        throw new AppError(STATUS_CODES.BAD_REQUEST, "INVALID_STATUS", "Invalid order status");
    }
  
    // const order = await Order.findOneAndUpdate(
    //     { $or: [{ _id: orderId }, { orderId: orderId }] },
    //     { status: newStatus },
    //     { new: true }
    // );
    const order = await Order.findOne({
        $or: [{ _id: orderId }, { orderId: orderId }]
    })
    if (!order) {
        throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Order not found");
    }
    order.status = 'Cancelled';
    order.items.forEach(item => {
    item.itemStatus = 'Cancelled'});
    await order.save();
    logger.info(`Admin updated order ${orderId} status to ${newStatus}`);
    return order;
};