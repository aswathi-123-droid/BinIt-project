import logger from "../../config/logger.js";
import { getWishlistService, toggleWishlistService } from "../../services/user/wishlistServices.js";
import { AppError, sendResponse } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";

export const getWishlistController = async (req, res) => {
    const userId = req.user._id;

    if (!userId) {
        throw new AppError(STATUS_CODES.UNAUTHORIZED, "UNAUTHORIZED", "User not authenticated");
    }

    logger.info(`Request received: Get wishlist for user ${userId}`);

    const wishlist = await getWishlistService(userId);
 
    sendResponse(res, {
        message: "Wishlist fetched successfully",
        wishlist
    }, STATUS_CODES.OK);
};

export const toggleWishlistController = async (req, res) => {
    const userId = req.user._id;
    const { productId } = req.body;

    if (!userId) {
        throw new AppError(STATUS_CODES.UNAUTHORIZED, "UNAUTHORIZED", "User not authenticated");
    }

    if (!productId) {
         throw new AppError(STATUS_CODES.BAD_REQUEST, "MISSING_FIELD", "Product ID is required");
    }

    logger.info(`Request received: Toggle wishlist item ${productId} for user ${userId}`);

    const { wishlist, isWishlisted, message } = await toggleWishlistService(userId, productId);

    sendResponse(res, {
        message,
        isWishlisted,
        wishlist
    }, STATUS_CODES.OK);
};
