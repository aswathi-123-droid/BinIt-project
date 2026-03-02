import express from "express";
import { authenticateUser } from "../../middlewares/user/authenticate-user.js";
import { addItemToCartController, deleteWasteImageController, getCartController, removeItemController, updateQuantityController, uploadWasteImagsController } from "../../controllers/user/cartController.js";
import { parseFormData } from "../../middlewares/common/parseFormData.js";
import multer from "multer";
import os from "os";

const router = express.Router();

const upload = multer({ dest: os.tmpdir() });

router.use(authenticateUser);

router.get("/",getCartController)
router.post("/add",addItemToCartController);
router.patch("/quantity",updateQuantityController);
router.patch("/upload-images",upload.array("wasteImages", 5),parseFormData,uploadWasteImagsController)
router.patch("/delete-image", deleteWasteImageController);
router.delete("/remove/:itemId",removeItemController)

export default router;