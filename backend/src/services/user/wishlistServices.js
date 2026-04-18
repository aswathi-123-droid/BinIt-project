import logger from "../../config/logger.js";
import Product from "../../models/product.model.js";
import Wishlist from "../../models/wishlistModel.js";
import { AppError } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";

export const getWishlistService = async (userId) => {
  const wishlist = await Wishlist.findOne({ userId }).populate({
    path: "items.productId",
    select:
      "name type price image unit stock isEstimationEnabled hasVariations",
  });

  if (!wishlist) {
    return { items: [] };
  }

  logger.info(`Fetched wishlist for user ${userId}`);
  return wishlist;
};

export const toggleWishlistService = async (userId, productId) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "NOT_FOUND",
      "Product not found",
    );
  }

  let wishlist = await Wishlist.findOne({ userId });

  if (!wishlist) {
    wishlist = new Wishlist({ userId, items: [{ productId }] });
    await wishlist.save();

    logger.info(
      `Wishlist created and item ${productId} added for user ${userId}`,
    );
    return { wishlist, isWishlisted: true, message: "Added to wishlist" };
  }

  const itemIndex = wishlist.items.findIndex(
    (item) => item.productId.toString() === productId,
  );

  if (itemIndex > -1) {
    wishlist.items.splice(itemIndex, 1);
    await wishlist.save();
    logger.info(`Item ${productId} removed from wishlist for user ${userId}`);
    return { wishlist, isWishlisted: false, message: "Removed from wishlist" };
  } else {
    wishlist.items.push({ productId });
    await wishlist.save();

    logger.info(`Item ${productId} added to wishlist for user ${userId}`);
    return { wishlist, isWishlisted: true, message: "Added to wishlist" };
  }
};
