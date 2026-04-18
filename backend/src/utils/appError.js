import Category from "../models/category.model.js";
import { STATUS_CODES } from "./constants.js";

export class AppError extends Error {
  constructor(
    status = STATUS_CODES.INTERNAL_SERVER_ERROR,
    code = "INTERNAL_SERVER_ERROR",
    message = "An unexpected error occurred. We are investigating the issue.",
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.isOperational = true;
  }
}

export const sendResponse = (res, data, statusCode = STATUS_CODES.OK) => {
  res.status(statusCode).json({
    success: true,
    ...data,
  });
};

export const buildUserQuery = ({ status, search }) => {
  const query = {};

  if (status) {
    if (status === "blocked") {
      query.isBlocked = true;
    } else if (status === "active") {
      query.isBlocked = false;
    }
  }

  if (search && search.trim() !== "") {
    const searchRegex = { $regex: search.trim(), $options: "i" };

    query.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  return query;
};

export const buildCategoryQuery = ({ status, search, type }) => {
  const query = { isDeleted: false };
  if (status) {
    query.isActive = status === "true";
  }

  if (search && search.trim() !== "") {
    query.name = { $regex: search.trim(), $options: "i" };
  }

  if (type && type.trim() !== "") {
    query.type = type.toLowerCase();
  }
  return query;
};

export const buildProductQuery = ({
  search,
  type,
  stockStatus,
  isActive,
  categoryId,
}) => {
  const query = {};

  if (search) {
    query.name = { $regex: search.trim(), $options: "i" };
  }

  if (type && type.trim() !== "") {
    query.type = type.toLowerCase();
  }

  if (isActive) {
    query.isActive = true;
  }

  if (categoryId) {
    query.categoryId = categoryId;
  }

  if (stockStatus) {
    if (stockStatus === "in_stock") {
      query.$or = [{ stock: { $gt: 0 } }, { type: { $ne: "store" } }];
    } else if (stockStatus === "out_of_stock") {
      query.type = "store";
      query.stock = { $lte: 0 };
    }
  }
  return query;
};

export const getPagination = (page = 1, limit = 8, maxLimit = 25) => {
  const pageNumber = parseInt(page);

  const pageSize = Math.min(parseInt(limit), maxLimit);

  const skip = (pageNumber - 1) * pageSize;

  return { pageNumber, pageSize, skip };
};

export const getSortOption = (sortBy = "createdAt", sortOrder = "desc") => ({
  [sortBy]: sortOrder === "asc" ? 1 : -1,
});

export const getCategorySortOption = (sortBy = "newest") => {
  switch (sortBy) {
    case "newest":
      return { createdAt: -1 };
    case "oldest":
      return { createdAt: 1 };
    case "name_asc":
      return { name: 1 };
    case "name_desc":
      return { name: -1 };
    case "items_asc":
      return { itemCount: 1 };
    case "items_desc":
      return { itemCount: -1 };
    case "price_asc":
      return { price: 1 };
    case "price_desc":
      return { price: -1 };
    default:
      return { createdAt: -1 };
  }
};

export const buildOrderQuery = ({ search, statusFilter }, isPickup) => {
  const matchStage = {};
  if (statusFilter) {
    if (isPickup) matchStage.pickupStatus = statusFilter;
    else matchStage.status = statusFilter;
  }

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userId",
      },
    },
    {
      $unwind: { path: "$userId", preserveNullAndEmptyArrays: true },
    },
    {
      $unset: ["userId.refreshToken", "userId.password"]
    },
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    {
      $match: {
        "productDetails.type": isPickup
          ? { $in: ["junk", "recyclable"] }
          : "store",
      },
    },
  ];

  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { orderId: { $regex: search, $options: "i" } },
          { "userId.name": { $regex: search, $options: "i" } },
          { "userId.email": { $regex: search, $options: "i" } },
        ],
      },
    });
  }

  return pipeline;
};

export const getOrderSortOption = (sortBy) => {
  switch (sortBy) {
    case "oldest":
      return { createdAt: 1 };
    case "amount_asc":
      return { "pricing.totalAmount": 1 };
    case "amount_desc":
      return { "pricing.totalAmount": -1 };
    case "newest":
    default:
      return { createdAt: -1 };
  }
};
