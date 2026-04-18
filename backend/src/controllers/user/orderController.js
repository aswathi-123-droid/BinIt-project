import logger from "../../config/logger.js";
import { cancelOrderItemService, cancelOrderService, createOrder, getOrderById, getUserOrders, returnOrderItemService, returnOrderService } from "../../services/user/orderServices.js";
import { AppError, sendResponse } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";

export const createOrderController = async(req,res)=> {
    const userId = req.user._id;
    const orderData = req.body;

    logger.info(`Received order creation request for user ${userId}`);

    const order = await createOrder(userId,orderData);

    sendResponse(res, { 
        message: "Order placed successfully", 
        order 
    }, STATUS_CODES.CREATED);
}

export const getUserOrdersController = async(req,res) => {
    const userId = req.user._id;

    if (!userId) {
        throw new AppError(STATUS_CODES.UNAUTHORIZED, "UNAUTHORIZED", "User not authenticated");
    }

    logger.info(`Request received: Get orders for user ${userId}`);

    const orders = await getUserOrders(userId);
 
    sendResponse(res, {
        message: "User orders fetched successfully",
        orders
    }, STATUS_CODES.OK);
}

export const getOrderByIdController = async (req, res) => {
    const userId = req.user._id;
    const { orderId } = req.params; 

    logger.info(`Request received: Get details for order ${orderId} by user ${userId}`);

    const order = await getOrderById(userId, orderId);

    sendResponse(res, {
        message: "Order details fetched successfully",
        order
    }, STATUS_CODES.OK);
};

export const cancelOrderController = async (req, res) => {
    const userId = req.user._id;
    const { orderId } = req.params;
    const  {reason, isPickupMode}  = req.body;

    logger.info(`Request received: Cancel order ${orderId} for user ${userId}`);

    const order = await cancelOrderService(userId, orderId, reason, isPickupMode);
    sendResponse(res, {
        message: "Order cancelled successfully",
        order
    }, STATUS_CODES.OK);
};

export const cancelOrderItemController = async (req, res) => {
    const userId = req.user._id;
    const { orderId, itemId } = req.params;
    const { reason } = req.body;

    logger.info(`Request received: Cancel item ${itemId} from order ${orderId} for user ${userId}`);

    const order = await cancelOrderItemService(userId, orderId, itemId, reason);

    sendResponse(res, {
        message: "Item cancelled successfully",
        order
    }, STATUS_CODES.OK);
};


export const returnOrderController = async (req, res) => {
    const userId = req.user._id;
    const { orderId } = req.params;
    const  {reason}  = req.body;
    logger.info(`Request received: Return order ${orderId} for user ${userId}`);
    if (!reason) {
        throw new AppError(STATUS_CODES.BAD_REQUEST, "MISSING_FIELD", "Return reason is required");
    }
    const order = await returnOrderService(userId, orderId, reason);
    sendResponse(res, {
        message: "Return request submitted successfully",
        order
    }, STATUS_CODES.OK);
};

export const returnOrderItemController = async (req, res) => {
        const userId = req.user._id;
        const { orderId, itemId } = req.params;
        const { reason } = req.body;

        logger.info(`Request received: Return item ${itemId} from order ${orderId} for user ${userId}`);

        if (!reason) {
            throw new AppError(STATUS_CODES.BAD_REQUEST, "MISSING_FIELD", "Return reason is required");
        }

        const order = await returnOrderItemService(userId, orderId, itemId, reason);

        sendResponse(res, {
            message: "Item return request submitted successfully",
            order
        }, STATUS_CODES.OK);
};

