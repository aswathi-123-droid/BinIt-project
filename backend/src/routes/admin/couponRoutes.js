import express from "express";
import { verifyAdminToken } from "../../middlewares/admin/authenticate-admin.js";
import { 
    createCouponController, 
    getAllCouponsController, 
    toggleCouponStatusController, 
    deleteCouponController, 
    updateCouponController
} from "../../controllers/admin/couponController.js";
const router = express.Router();

router.use(verifyAdminToken);

router.post("/", createCouponController);
router.put("/:id", updateCouponController);
router.get("/", getAllCouponsController);
router.patch("/:id/status", toggleCouponStatusController);
router.delete("/:id", deleteCouponController);
export default router;