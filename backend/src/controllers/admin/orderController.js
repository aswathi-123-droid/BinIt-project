import logger from "../../config/logger.js";
import {
  getAllOrders,
  getOrderById,
  updateOrderItemReturnStatusService,
  updateOrderStatusService,
  updateReturnStatusService,
} from "../../services/admin/orderService.js";
import { AppError, sendResponse } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";

export const getOrderController = async (req, res) => {
  const result = await getAllOrders(req.query, false);
  sendResponse(res, result, STATUS_CODES.OK);
};

export const getPickupController = async (req, res) => {
  const result = await getAllOrders(req.query, true);
  sendResponse(res, result, STATUS_CODES.OK);
};

export const getOrderDetailsByIdController = async (req, res) => {
  const { id } = req.params;
  logger.info(`Admin request received: Get details for order ${id}`);

  const order = await getOrderById(id);

  sendResponse(
    res,
    {
      message: "Order details fetched successfully",
      order,
    },
    STATUS_CODES.OK,
  );
};

export const updateOrderStatusController = async (req, res) => {
  const { id } = req.params;
  const { status, type } = req.body;

  const isPickupUpdate = type === "pickup";

  logger.info(
    `Admin request to update ${isPickupUpdate ? "pickup" : "order"} ${id} to ${status}`,
  );

  const updatedOrder = await updateOrderStatusService(
    id,
    status,
    isPickupUpdate,
  );

  sendResponse(
    res,
    {
      message: `${isPickupUpdate ? "Pickup" : "Order"} marked as ${status} successfully`,
      order: updatedOrder,
    },
    STATUS_CODES.OK,
  );
};

export const updateReturnStatusController = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "MISSING_STATUS",
      "Status is required",
    );
  }

  const validStatuses = ["Pending", "Approved", "Rejected", "Completed"];
  if (!validStatuses.includes(status)) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "INVALID_STATUS",
      "Invalid return status provided",
    );
  }

  const updatedOrder = await updateReturnStatusService(id, status);

  logger.info(
    `Admin successfully updated return status for order ${id} to ${status}`,
  );

  sendResponse(
    res,
    { order: updatedOrder },
    STATUS_CODES.OK,
    `Return request marked as ${status}`,
  );
};

export const updateOrderItemReturnStatusController = async (req, res) => {
  const { id, itemId } = req.params;
  const { status } = req.body;

  if (!status) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "MISSING_STATUS",
      "Status is required",
    );
  }
  const validStatuses = ["Returned", "Active"];
  if (!validStatuses.includes(status)) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "INVALID_STATUS",
      "Invalid item return status provided. Must be 'Returned' or 'Active'.",
    );
  }
  logger.info(
    `Admin request to update return status for item ${itemId} in order ${id} to ${status}`,
  );

  const updatedOrder = await updateOrderItemReturnStatusService(
    id,
    itemId,
    status,
  );

  const actionString = status === "Returned" ? "Approved" : "Rejected";
  sendResponse(
    res,
    { order: updatedOrder },
    STATUS_CODES.OK,
    `Item return ${actionString} successfully`,
  );
};