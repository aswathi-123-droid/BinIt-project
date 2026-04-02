import { addItemToCart, applyCouponCode, deleteWasteImage, getCartWithSummary, removeCouponCode, removeItemFromCart, updateCartItemQuantity, uploadWasteImages } from "../../services/user/cartServices.js";
import { sendResponse } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";
import logger from "../../config/logger.js";
import Cart from "../../models/cartModel.js";
import Coupon from "../../models/couponModel.js";


export const getCartController = async(req,res) =>{
    const userId = req.user._id;
    const {cart, summary} = await getCartWithSummary(userId)
    logger.info(`Cart and summary successfully fetched for user: ${userId}`);
    sendResponse(res,{cart,summary},STATUS_CODES.OK)
}

export const addItemToCartController = async(req,res) => {
    const userId = req.user._id;
    const cart = await addItemToCart(userId,req.body);

    logger.info(`User ${userId} added item to cart`);
    sendResponse(res,{
        message: 'Item added to Bin Successfully',
        cart
    }, STATUS_CODES.OK)
}

export const updateQuantityController = async(req,res) => {
    const userId = req.user._id;
    console.log(req.body,"loooo")
    await updateCartItemQuantity(userId, req.body);

    const { cart, summary } = await getCartWithSummary(userId);

    logger.info(`User ${userId} updated item quantity. Fresh summary calculated.`);

    sendResponse(res, { 
        message: "Quantity updated successfully", 
        cart, 
        summary 
    }, STATUS_CODES.OK);
}

export const uploadWasteImagsController = async(req,res) => {
    const userId = req.user._id;
    const { productId, selectionName } = req.body;
    const files = req.files;
    
    const cart = await uploadWasteImages(userId, productId, selectionName, files);
    logger.info(`User ${userId} uploaded ${files?.length || 0} verification images for item ${productId}`);

    sendResponse(res, { message: "Images uploaded successfully", cart }, STATUS_CODES.OK);
}


export const deleteWasteImageController = async(req, res) => {
    const userId = req.user._id;
    const { productId, selectionName, imageUrl } = req.body;
    if (!imageUrl) {
         throw new AppError(STATUS_CODES.BAD_REQUEST, "MISSING_DATA", "Image URL is required");
    }
    
    const cart = await deleteWasteImage(userId, productId, selectionName, imageUrl);
    
    sendResponse(res, { message: "Image deleted successfully", cart }, STATUS_CODES.OK);
}

export const removeItemController = async(req,res) => {
    const userId = req.user._id;
    const { itemId } = req.params;

    const cart = await removeItemFromCart(userId, itemId)

    logger.info(`User ${userId} removed item ${itemId} from cart`);

        sendResponse(res, { 
        message: "Item removed successfully", 
        cart 
    }, STATUS_CODES.OK);
}

export const getAvailableCoupons = async (req, res) => {
    // Only fetch coupons that are active AND haven't expired
    const activeCoupons = await Coupon.find({ 
        isActive: true,
        expiryDate: { $gte: new Date() }
    }).sort({ minPurchaseAmount: 1 }); // Sort by lowest cart value required
    sendResponse(res, { data: activeCoupons }, 200);
};

export const applyCouponController = async (req, res) => {
    const userId = req.user._id; 
    const { code } = req.body;
    
    if (!code) {
        throw new AppError(400, "MISSING_CODE", "Please provide a coupon code");
    }
    const updatedCart = await applyCouponCode(userId, code);
    
    logger.info(`Coupon ${code} applied successfully to cart for user ${userId}`);
    sendResponse(res, { 
        message: "Coupon applied successfully", 
        data: updatedCart 
    }, STATUS_CODES.OK);
};

export const removeCouponController = async (req, res) => {
    const userId = req.user._id;
    
    const updatedCart = await removeCouponCode(userId);
    
    logger.info(`Coupon removed from cart successfully for user ${userId}`);
    sendResponse(res, { 
        message: "Coupon removed successfully", 
        data: updatedCart 
    }, STATUS_CODES.OK);
};


