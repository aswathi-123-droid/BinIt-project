import logger from "../../config/logger.js";
import { getAllOrders, getOrderById, updateOrderStatusService } from "../../services/admin/orderService.js"
import { sendResponse } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";


export const getOrderController = async(req,res) => {
    const result = await getAllOrders(req.query,false);
    sendResponse(res,result,STATUS_CODES.OK)
};

export const getPickupController = async(req,res) => {
    const result = await getAllOrders(req.query,true);
    sendResponse(res,result,STATUS_CODES.OK)
}

export const getOrderDetailsByIdController = async(req,res) => {
    const {id} = req.params;
    logger.info(`Admin request received: Get details for order ${id}`);

    const order = await getOrderById(id);

    sendResponse(res, {
        message: "Order details fetched successfully",
        order
    }, STATUS_CODES.OK);
}

export const updateOrderStatusController = async(req, res) => {
    const { id } = req.params;
    const { status } = req.body; 
    logger.info(`Admin request to update order ${id} to ${status}`);
    const updatedOrder = await updateOrderStatusService(id, status);
    sendResponse(res, {
        message: `Order marked as ${status} successfully`,
        order: updatedOrder
    }, STATUS_CODES.OK);
}