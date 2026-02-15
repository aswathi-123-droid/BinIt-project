import express from "express";
import { authenticateUser } from "../../middlewares/user/authenticate-user.js";
import { addItemToCartController, getCartController, updateQuantityController } from "../../controllers/user/cartController.js";

const router = express.Router();

router.use(authenticateUser);

router.get("/",getCartController)
router.post("/add",addItemToCartController);
router.patch("/quantity",updateQuantityController)

export default router;