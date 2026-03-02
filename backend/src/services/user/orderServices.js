import logger from "../../config/logger.js";
import Address from "../../models/address.model.js";
import Cart from "../../models/cartModel.js";
import Order from "../../models/orderModel.js";
import { AppError } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";
import { getCartWithSummary } from "./cartServices.js";

export const createOrder = async(userId, orderData) => {
    const {addressId, paymentMethod, pickupDate, pickupTimeSlot} = orderData;

    // const cart = await Cart.findOne({userId}).populate("items.productId")
    // console.log(cart,"check")
    // if (!cart || cart.items.length === 0) {
    //     throw new AppError("Cart is empty", STATUS_CODES.BAD_REQUEST);
    // }
    const {cart,summary} = await getCartWithSummary(userId)
    if (!cart || cart.items.length === 0) {
        throw new AppError("Cart is empty", STATUS_CODES.BAD_REQUEST);
    }
    console.log(cart.items,"lets see itemsss")
    let isPickupRequired = false;

    for(const item of cart.items){
        if(item.productId && (item.productId.type === 
        'recyclable' || item.productId.type === 'junk')){
            isPickupRequired = true;
            break;
        }
    }

    let finalPickupDate = pickupDate;
    let finalPickupTimeSlot = pickupTimeSlot;

    if(isPickupRequired){
        if(!pickupDate || !pickupTimeSlot){
            throw new AppError("Pickup date and time are required for recycling/junk pickup.",
                 STATUS_CODES.BAD_REQUEST);
        }
    }else{
        if(!finalPickupDate){
            const deliveryDate = new Date();
            deliveryDate.setDate(deliveryDate.getDate()+3);
            finalPickupDate = deliveryDate;
        }
        if(!finalPickupTimeSlot){
            finalPickupDate = "Standard Delivery"
        }
    }

    const address = await Address.findById(addressId);
    if (!address) {
         throw new AppError("Address not found", STATUS_CODES.NOT_FOUND);
    }

    const newOrder = new Order({
        userId,
        orderId: `#ORD-${Date.now().toString().slice(-6)}`,
        items: cart.items.map(item => ({
            productId: item.productId._id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.productId.image[0],
            selectionType: item.selectionType,
            selectionName: item.selectionName,
            userUploadedImages: item.userUploadedImages || []
        })),
        pricing: summary || { subtotal: 0,  platformFee: 0, couponDiscount: 0, totalAmount: 0 , storeItems: 0 , pickupServices: 0 , earnings: 0  },
        pickupAddress: {
            name: address.name,
            phone: address.phone,
            street: `${address.flat}, ${address.street}, ${address.locality}`,
            city: address.city,
            state: address.state,
            pincode: address.pincode
        },
        pickupDate: finalPickupDate,
        pickupTimeSlot: finalPickupTimeSlot,
        paymentMethod,
        status: "Placed"
    })

    await newOrder.save();

    cart.items = [];
    cart.summary = {subtotal: 0, earning: 0, platformFee: 0, total: 0, storeItems: 0 , pickupServices: 0 , earnings: 0};

    await cart.save();

    logger.info(`Order created successfully for user ${userId}. Order ID: ${newOrder.orderId}`);

    return newOrder;
} 

export const getUserOrders = async(userId) => {
    const orders = await Order.find({userId})
    .populate({
        path: "items.productId",
        select: "name type price image unit" 
    })
    .sort({createdAt: -1});

    logger.info(`Fetched ${orders.length} orders for user ${userId}`);
    
    return orders;
}

export const getOrderById = async (userId, orderId) => {
    const order = await Order.findOne({ 
        orderId: orderId, 
        userId: userId 
    }).populate({
        path: "items.productId",
        select: "name type price image unit"
    });

    if (!order) {
        logger.warn(`Order not found or unauthorized access attempt. User: ${userId}, Order: ${orderId}`);
        throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Order not found");
    }

    logger.info(`Successfully fetched details for order ${orderId} by user ${userId}`);

    return order;
};

export const cancelOrderService = async (userId, orderId, reason) => {
    const order = await Order.findOne({ orderId, userId });
    if (!order) {
        logger.warn(`Cancel failed: Order not found. User: ${userId}, Order: ${orderId}`);
        throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Order not found");
    }

    const nonCancellableStatuses = ['Completed', 'Cancelled', 'Delivered'];
    
    if (nonCancellableStatuses.includes(order.status)) {
        logger.warn(`Cancel failed: Invalid status ${order.status}. User: ${userId}, Order: ${orderId}`);
        throw new AppError(STATUS_CODES.BAD_REQUEST, "INVALID_ACTION", "Cannot cancel order at this stage");
    }
  
    order.status = 'Cancelled';
    order.items.forEach(item => {
        item.itemStatus = 'Cancelled'});
    order.cancellation = {
        reason: reason,
        timestamp: new Date(),
        cancelledBy: userId
    };
    await order.save();
    logger.info(`Order ${orderId} cancelled successfully by user ${userId}`);
    return order;
};

export const returnOrderService = async (userId, orderId, reason) => {
    const order = await Order.findOne({ orderId, userId });
    if (!order) {
        logger.warn(`Return failed: Order not found. User: ${userId}, Order: ${orderId}`);
        throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Order not found");
    }
  
    const returnableStatuses = ['Completed', 'Delivered'];
    
    if (!returnableStatuses.includes(order.status)) {
         logger.warn(`Return failed: Order not completed. Status: ${order.status}. User: ${userId}`);
         throw new AppError(STATUS_CODES.BAD_REQUEST, "INVALID_ACTION", "Only completed orders can be returned");
    }
    // Check if return is already placed
    if (order.return && order.return.status === 'Placed') {
         throw new AppError(STATUS_CODES.BAD_REQUEST, "INVALID_ACTION", "Return request already exists");
    }
    // Update Order with Return Request
    // We don't change the main status immediately; we just log the return request
    order.return = {
        reason,
        status: 'Placed',
        timestamp: new Date()
    };
    await order.save();
    logger.info(`Return request submitted for order ${orderId} by user ${userId}`);
    return order;
};

export const cancelOrderItemService = async (userId, orderId, itemId, reason) => {
    const order = await Order.findOne({ orderId, userId });
    
    if (!order) {
        logger.warn(`Cancel item failed: Order not found. User: ${userId}, Order: ${orderId}`);
        throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Order not found");
    }

    const nonCancellableStatuses = [ 'Completed', 'Cancelled', 'Delivered'];
    
    if (nonCancellableStatuses.includes(order.status)) {
        logger.warn(`Cancel item failed: Invalid status ${order.status}. User: ${userId}, Order: ${orderId}`);
        throw new AppError(STATUS_CODES.BAD_REQUEST, "INVALID_ACTION", "Cannot cancel an item at this order stage");
    }

    // 1. Find the specific item by its _id
    const item = order.items.find(item => item._id.toString() === itemId);
    
    if (!item) {
        throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Item not found in this order");
    }

    if (item.itemStatus === "Cancelled") {
        throw new AppError(STATUS_CODES.BAD_REQUEST, "BAD_REQUEST", "Item is already cancelled");
    }

    // 2. Mark the item as cancelled
    item.itemStatus = 'Cancelled';

    // 3. Check if ALL items in the order are now cancelled
    const activeItems = order.items.filter(i => i.itemStatus !== 'Cancelled');

    if (activeItems.length === 0) {
        // Cancel the entire order if no active items remain
        order.status = 'Cancelled';
        order.cancellation = {
            reason: reason || "All items were individually cancelled",
            timestamp: new Date(),
            cancelledBy: userId
        };
        order.pricing.subtotal = 0;
        order.pricing.totalAmount = 0;
    } else {
        // 4. Recalculate the pricing using ONLY active items
        const newSubtotal = activeItems.reduce((total, i) => total + (i.price * i.quantity), 0);
        
        order.pricing.subtotal = newSubtotal;
        
        const platformFee = order.pricing.platformFee || 0;
        const couponDiscount = order.pricing.couponDiscount || 0;
        
        // Ensure total doesn't go below 0
        order.pricing.totalAmount = Math.max(0, newSubtotal + platformFee - couponDiscount);
    }

    await order.save();
    
    logger.info(`Item ${itemId} from order ${orderId} marked as Cancelled by user ${userId}`);
    
    return order;
};
