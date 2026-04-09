import express from "express";
import { verifyAdminToken } from "../../middlewares/admin/authenticate-admin.js";
import { 
    getAllInventoryController, 
    createInventoryController, 
    updateInventoryController, 
    toggleInventoryStatusController,
    deleteInventoryController,
    createProductOfferController,
    updateProductOfferController
} from "../../controllers/admin/productController.js";
import { validate } from "../../middlewares/common/validate.middleware.js";
import { offerSchema } from "../../validators/admin/offerValidators.js";
import { uploadImageMiddleware } from "../../middlewares/common/uploadMiddleware.js";


const router = express.Router();


router.use(verifyAdminToken);


router.get("/", getAllInventoryController);
router.post("/", uploadImageMiddleware.array("image"), createInventoryController);
router.patch("/:id", uploadImageMiddleware.array("image"), updateInventoryController);
router.patch("/:id/status", toggleInventoryStatusController);
router.delete("/:id", deleteInventoryController);
router.post("/:productId/offer", validate(offerSchema), createProductOfferController);
router.put("/:productId/offer", validate(offerSchema), updateProductOfferController);

export default router;