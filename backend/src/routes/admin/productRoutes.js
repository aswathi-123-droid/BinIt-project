import express from "express";
import multer from "multer";
import os from "os";
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

// Setup Multer for Image Uploads
const upload = multer({ 
    dest: os.tmpdir(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
});

const router = express.Router();

// Apply Admin Auth to all routes
router.use(verifyAdminToken);

// Routes
router.get("/", getAllInventoryController);

router.post(
    "/", 
    upload.array("image"), 
    createInventoryController
);

router.patch(
    "/:id", 
    upload.array("image"), 
    updateInventoryController
);

router.patch("/:id/status", toggleInventoryStatusController);

router.delete("/:id", deleteInventoryController);

router.post("/:productId/offer", validate(offerSchema), createProductOfferController);
router.put("/:productId/offer", validate(offerSchema), updateProductOfferController);

export default router;