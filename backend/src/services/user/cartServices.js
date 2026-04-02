import { calculateBestDiscount } from "../../../../frontend/src/utils/helpers.js";
import logger from "../../config/logger.js";
import Cart from "../../models/cartModel.js";
import Coupon from "../../models/couponModel.js";
import Product from "../../models/product.model.js";
import { AppError } from "../../utils/appError.js";
import { deleteFromCloudinary, extractPublicIdFromUrl, uploadToCloudinary } from "../../utils/cloudinary.js";
import { PLATFORM_FEE, STATUS_CODES } from "../../utils/constants.js";


export const getCartWithSummary = async (userId) => {
    const cart = await Cart.findOne({ userId }).populate({
        path: "items.productId",
        select: "name type description unit image price isActive stock offer",
        populate: {
            path: "categoryId",
            select: "name offer isActive"
        }
    });

    // Helper to calculate the highest discount possible
    // const calculateBestDiscount = (totalPrice, productOffer, categoryOffer) => {
    //     const getDiscount = (price, offer) => {
    //         if (!offer || !offer.isActive || new Date(offer.expiryDate) < new Date()) return 0;
    //         if (offer.minTransactionalValue && price < offer.minTransactionalValue) return 0;
            
    //         if (offer.discountType === 'flat') {
    //             return offer.value;
    //         } else if (offer.discountType === 'percent') {
    //             let discountAmount = price * (offer.value / 100);
    //             if (offer.maxRedeemableAmount > 0) {
    //                 return Math.min(discountAmount, offer.maxRedeemableAmount);
    //             }
    //             return discountAmount;
    //         }
    //         return 0;
    //     };

    //     const pDiscount = getDiscount(totalPrice, productOffer);
    //     const cDiscount = getDiscount(totalPrice, categoryOffer);
        
    //     return Math.max(pDiscount, cDiscount);
    // };

    
    if (!cart || cart.items.length === 0) {
        return {
            cart: { items: [] },
            summary: { subtotal: 0, earnings: 0, platformFee: 0, total: 0 }
        };
    }

    let subtotal = 0;
    let earnings = 0;
    let storeItems = 0;
    let pickupServices = 0;
    let totalOfferDiscount = 0;

    cart.items.forEach(item => {
        const product = item.productId;
        const category = product?.categoryId;
        const itemType = product?.type;
      
        if (itemType === 'recyclable') {
            earnings += item.price;
        } else if (itemType === "store"){
            storeItems += item.price;
            
            // Calculate best discount comparing Product vs Category offer
            const bestDiscount = calculateBestDiscount(item.price, product.offer, category?.offer);
            totalOfferDiscount += bestDiscount;
        } else {
            pickupServices += item.price;
        }
    });
    
    subtotal = storeItems + pickupServices;

     let couponDiscount = 0;
    if (cart.appliedCoupon) {
        const coupon = await Coupon.findById(cart.appliedCoupon);
        
        // Safety check again in case it expired while sitting in the cart
        if (coupon && coupon.isActive && new Date() <= new Date(coupon.expiryDate)) {
           // Only apply discount to the subtotal amount AFTER standard product offers are taken off
           let payableAmount = subtotal - totalOfferDiscount;
           
           if (payableAmount >= coupon.minPurchaseAmount) {
               if (coupon.discountType === 'flat') {
                   couponDiscount = coupon.discountValue;
               } else if (coupon.discountType === 'percent') {
                   let percentDiscount = payableAmount * (coupon.discountValue / 100);
                   couponDiscount = coupon.maxDiscountAmount > 0 
                       ? Math.min(percentDiscount, coupon.maxDiscountAmount) 
                       : percentDiscount;
               }
           } else {
               // Invalidated due to user removing items from cart
               cart.appliedCoupon = null;
               await cart.save();
           }
        }
    }
    // 3. Ensure discounts don't exceed the subtotal
    couponDiscount = Math.min(couponDiscount, (subtotal - totalOfferDiscount));
    // 4. FINAL CALCULATION: Total subtracts earnings AND both discounts
    const total = subtotal - totalOfferDiscount - couponDiscount - earnings + PLATFORM_FEE;
    // // Total subtracts earnings AND the new calculated offer discounts
    // const total = subtotal - totalOfferDiscount - earnings + PLATFORM_FEE;

    const summary = {
        storeItems,
        pickupServices,
        subtotal,
        earnings,
        offerDiscount: totalOfferDiscount,
        couponDiscount: couponDiscount , 
        platformFee: PLATFORM_FEE,
        totalAmount: Math.max(0, total) // Prevent negative totals
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

    let priceChange = 0;

    if (product.hasVariations) {
    let variation = product.variations.find(x => x.name == selectionName);
    console.log(variation, "variation");
    if (variation && variation.price) {
        priceChange = Number(variation.price);
    } else {
        priceChange = Number(product.price); 
    }
} 
else if (product.isEstimationEnabled) {
    priceChange = selectionName === "Small Bag" 
        ? product.price * 2 
        : selectionName === "Medium Bag" 
            ? product.price * 8 
            : product.price * 20;
} 
else {
    console.log(product, "checking product price");
    priceChange = Number(product.price);
}
    
    if (action === 'increment') {
        
        if (product.type === 'store' && currentItem.quantity + 1 > product.stock) {
            throw new AppError(STATUS_CODES.BAD_REQUEST, "STOCK_LIMIT", `Only ${product.stock} items available`);
        }
        currentItem.quantity += 1;
        currentItem.price+=priceChange;
    } else if (action === 'decrement') {
       
        if (currentItem.quantity > 1) {
            currentItem.quantity -= 1;
             currentItem.price-=priceChange;
        } else {
            throw new AppError(STATUS_CODES.BAD_REQUEST, "MIN_LIMIT", "Quantity cannot be less than 1");
        }
    }

    await cart.save();
    logger.info(`Quantity ${action}ed for product ${productId} by user ${userId}`);
    console.log(cart,"kuiii")
    return cart;
};

export const uploadWasteImages = async(userId, productId, selectionName, files) => {
    const cart = await Cart.findOne({ userId });
    if (!cart) throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Cart not found");

    const itemIndex = cart.items.findIndex(item => 
        item.productId.toString() === productId && 
        item.selectionName === selectionName
    );

    if (itemIndex === -1) throw new AppError(STATUS_CODES.NOT_FOUND, "ITEM_NOT_FOUND", "Item not in bin");

    const uploadPromises = files.map(file => uploadToCloudinary(file.path, 'waste_verifications'));
    const results = await Promise.all(uploadPromises);
    console.log(results)
    const imageUrls = results

    cart.items[itemIndex].userUploadedImages.push(...imageUrls);
    
    await cart.save();
    logger.info(`Verification images (${imageUrls.length}) uploaded by user ${userId} for item ${productId}`);
    return cart;
}

export const deleteWasteImage = async (userId, productId, selectionName, imageUrl) => {
    const cart = await Cart.findOne({ userId });
    if (!cart) throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Cart not found");
    const itemIndex = cart.items.findIndex(item => 
        item.productId.toString() === productId && 
        item.selectionName === selectionName
    );
    if (itemIndex === -1) throw new AppError(STATUS_CODES.NOT_FOUND, "ITEM_NOT_FOUND", "Item not in bin");
  
    const publicId = extractPublicIdFromUrl(imageUrl);
    if (publicId) {
        await deleteFromCloudinary(publicId);
    } else {
        logger.warn(`Could not extract public ID from URL: ${imageUrl}`);
    }
  
    cart.items[itemIndex].userUploadedImages = cart.items[itemIndex].userUploadedImages.filter(
        img => img !== imageUrl
    );
    await cart.save();
    logger.info(`Image deleted for user ${userId}, item ${productId}`);
    return cart;
};

export const removeItemFromCart = async(userId, itemId)=>{
    const cart = await Cart.findOneAndUpdate(
        {userId},
        {
            $pull: {items: {_id: itemId}}
        },
        {new: true}
    ).populate('items.productId')

    if (cart) {
        logger.info(`Item ${itemId} removed from cart for user ${userId}`);
    } else {
        logger.warn(`Failed to remove item ${itemId} for user ${userId} - Cart or item not found`);
    }
    return cart;
}


export const applyCouponCode = async (userId, code) => {
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) throw new AppError(400, "EMPTY_CART", "Cart is empty");
    // 1. Find the active coupon
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) throw new AppError(404, "INVALID_COUPON", "Invalid or expired coupon code");
    // 2. Validate dates
    const now = new Date();
    if (now < coupon.startDate || now > coupon.expiryDate) {
        throw new AppError(400, "EXPIRED_COUPON", "This coupon is expired or not active yet");
    }
    // 3. Validate usage limit
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        throw new AppError(400, "COUPON_DEPLETED", "This coupon has reached its usage limit");
    }
    // 4. Temporarily calculate subtotal to check Minimum Purchase Amount
    // Use your existing logic to add up StoreItems + PickupItems
    let subtotal = cart.items.reduce((sum, item) => item.productId.type !== 'recyclable' ? sum + item.price : sum, 0);
    if (subtotal < coupon.minPurchaseAmount) {
        throw new AppError(400, "MIN_PURCHASE", `Minimum purchase of ₹${coupon.minPurchaseAmount} required`);
    }
    // 5. Apply it to the cart
    cart.appliedCoupon = coupon._id;
    await cart.save();
    return cart;
};

export const removeCouponCode = async (userId) => {
    const cart = await Cart.findOne({ userId });
    if (!cart) throw new AppError(404, "NOT_FOUND", "Cart not found");
    cart.appliedCoupon = null;
    await cart.save();
    return cart;
};