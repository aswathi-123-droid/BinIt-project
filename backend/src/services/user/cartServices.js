import logger from "../../config/logger.js";
import Cart from "../../models/cartModel.js";
import Product from "../../models/product.model.js";
import { AppError } from "../../utils/appError.js";
import { PLATFORM_FEE, STATUS_CODES } from "../../utils/constants.js";


export const getCartWithSummary = async (userId) => {
    const cart = await Cart.findOne({ userId }).populate({
        path: "items.productId",
        select: "name type description unit",
        populate: {
            path: "categoryId",
            select: "name"
        }
    });

    // Default summary for empty or non-existent carts
    if (!cart || cart.items.length === 0) {
        return {
            cart: { items: [] },
            summary: { subtotal: 0, earnings: 0, platformFee: 0, total: 0 }
        };
    }

    let subtotal = 0; // Service Fees (Junk/Store)
    let earnings = 0; // Recyclable earnings

    cart.items.forEach(item => {
        const itemType = item.productId.type;
        // Calculation based on (unit_price * quantity) logic handled in addItemToCart
        if (itemType === 'recyclable') {
            earnings += item.price;
        } else {
            subtotal += item.price;
        }
    });

    const platformFee = PLATFORM_FEE;
    const total = subtotal - earnings + platformFee;

    const summary = {
        subtotal,
        earnings,
        couponDiscount: 0, // Placeholder for future implementation
        platformFee,
        total: Math.max(0, total) // Prevent negative totals
    };

    logger.info(`Cart and summary calculated for user: ${userId}`);
    return { cart, summary };
};

export const addItemToCart = async(userId,cartData) => {
    const { productId, quantity = 1, selectionType, selectionName, name, price} = cartData;
    console.log(cartData,"viiiii")

    const product = await Product.findById(productId).populate("categoryId");

    if(!product || !product.isActive || !product.categoryId.isActive){
        throw new AppError(
            STATUS_CODES.BAD_REQUEST,
            "PRODUCT_UNAVAILABLE",
            "This product is currently unavailable")
    }

    if(product.type == "store" && product.stock < quantity){
        throw new AppError(
            STATUS_CODES.BAD_REQUEST,
            "LIMIT_EXCEEDED",
            'Requested quantity exceeds available stock'
        )
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
    cart = await Cart.create({ userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(item => 
      item.productId.toString() === productId && 
      item.selectionName === selectionName
    );

    if (existingItemIndex > -1) {
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;
    const newPrice = cart.items[existingItemIndex].price+price;
    

    if (product.type === 'store' && newQuantity > product.stock) {
      throw new AppError(STATUS_CODES.BAD_REQUEST,"LIMIT_EXCEEDED",`Only ${product.stock} items available in stock`);
    }
    
    cart.items[existingItemIndex].quantity = newQuantity;
    cart.items[existingItemIndex].price = newPrice
    } else {
      cart.items.push({
        productId,
        // name: product.name,
        name,
        price,
        quantity,
        selectionType,
        selectionName,
        image: product.image[0],
      });
    }

    await cart.save();
    logger.info(`Item ${productId} added to cart for user ${userId}`);
    console.log(cart,"what is this")
    return cart;
}

export const updateCartItemQuantity = async (userId, updateData) => {
    const { productId, selectionName, action } = updateData;

    const cart = await Cart.findOne({ userId });
    if (!cart) throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Cart not found");

    // Find the item index using both ID and selectionName (important for variations)
    const itemIndex = cart.items.findIndex(item => 
        item.productId.toString() === productId && item.selectionName === selectionName
    );

    if (itemIndex === -1) {
        throw new AppError(STATUS_CODES.NOT_FOUND, "ITEM_NOT_FOUND", "Item not found in your bin");
    }

    const product = await Product.findById(productId);
    const currentItem = cart.items[itemIndex];
    
    let priceOfVariation = product.variations.filter(x=>x.name==selectionName);
    if (action === 'increment') {
        // Requirement vi: Maximum quantity limits (Stock Validation)
        if (product.type === 'store' && currentItem.quantity + 1 > product.stock) {
            throw new AppError(STATUS_CODES.BAD_REQUEST, "STOCK_LIMIT", `Only ${product.stock} items available`);
        }
        currentItem.quantity += 1;
        currentItem.price+=priceOfVariation[0].price;
    } else if (action === 'decrement') {
        // Requirement v: Prevent quantity from going below 1
        if (currentItem.quantity > 1) {
            currentItem.quantity -= 1;
             currentItem.price-=priceOfVariation[0].price;
        } else {
            throw new AppError(STATUS_CODES.BAD_REQUEST, "MIN_LIMIT", "Quantity cannot be less than 1");
        }
    }

    await cart.save();
    logger.info(`Quantity ${action}ed for product ${productId} by user ${userId}`);
    console.log(cart,"kuiii")
    return cart;
};