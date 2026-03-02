import express from "express";
import { authenticateUser } from "../../middlewares/user/authenticate-user.js";
import { cancelOrderController, cancelOrderItemController, createOrderController, getOrderByIdController, getUserOrdersController, returnOrderController } from "../../controllers/user/orderController.js";

const router = express.Router();

router.use(authenticateUser);

router.get("/my-orders",getUserOrdersController)
router.post("/create",createOrderController);
router.get("/:orderId", getOrderByIdController); 
router.post('/:orderId/cancel', cancelOrderController);
router.post('/:orderId/return', returnOrderController);
router.put('/:orderId/item/:itemId/cancel', cancelOrderItemController);

export default router;

