import express from "express";
import { authenticateUser } from "../../middlewares/user/authenticate-user.js";
import { cancelOrderController, cancelOrderItemController, createOrderController, getOrderByIdController, getUserOrdersController, returnOrderController, returnOrderItemController } from "../../controllers/user/orderController.js";
import { createRazorpayOrderController, verifyRazorpayPaymentController } from "../../controllers/user/paymentController.js";

const router = express.Router();

router.use(authenticateUser);

router.get("/my-orders",getUserOrdersController)
router.post("/create",createOrderController);
router.get("/:orderId", getOrderByIdController); 
router.post('/:orderId/cancel', cancelOrderController);
router.post('/:orderId/return', returnOrderController);
router.put('/:orderId/item/:itemId/cancel', cancelOrderItemController);
router.put('/:orderId/item/:itemId/return', returnOrderItemController);
router.post("/create-razorpay-order", createRazorpayOrderController);
router.post("/verify-payment", verifyRazorpayPaymentController);

export default router;

