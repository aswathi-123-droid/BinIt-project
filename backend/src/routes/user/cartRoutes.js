import express from "express";
import { authenticateUser } from "../../middlewares/user/authenticate-user.js";
import { addItemToCartController, applyCouponController, deleteWasteImageController, getAvailableCoupons, getCartController, removeCouponController, removeItemController, updateQuantityController, uploadWasteImagsController } from "../../controllers/user/cartController.js";
import { parseFormData } from "../../middlewares/common/parseFormData.js";
import { uploadImageMiddleware } from "../../middlewares/common/uploadMiddleware.js";

const router = express.Router();

router.use(authenticateUser);

router.get("/",getCartController)
router.post("/add",addItemToCartController);
router.patch("/quantity",updateQuantityController);
router.patch("/upload-images",uploadImageMiddleware.array("wasteImages", 5),parseFormData,uploadWasteImagsController)
router.patch("/delete-image", deleteWasteImageController);
router.delete("/remove/:itemId",removeItemController)
router.get("/validate-checkout", getCartController);
router.get("/coupons", getAvailableCoupons);
router.post("/apply-coupon", applyCouponController);
router.post("/remove-coupon", removeCouponController);

export default router;