import { addItemToCart, getCartWithSummary, updateCartItemQuantity } from "../../services/user/cartServices.js";
import { sendResponse } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";
import logger from "../../config/logger.js";
import Cart from "../../models/cartModel.js";


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
    
    await updateCartItemQuantity(userId, req.body);

    const { cart, summary } = await getCartWithSummary(userId);

    logger.info(`User ${userId} updated item quantity. Fresh summary calculated.`);

    sendResponse(res, { 
        message: "Quantity updated successfully", 
        cart, 
        summary 
    }, STATUS_CODES.OK);
}






