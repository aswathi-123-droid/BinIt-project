import express from "express";
import multer from "multer";
import os from "os";
import { validate } from "../../middlewares/common/validate.middleware.js";
import { createCategorySchema, updateCategorySchema } from "../../validators/admin/categoryValidators.js";
import { createCategoryController, createCategoryOfferController, getAllCategoriesContoller, updateCategoryController, updateCategoryOfferController, updateCategoryStatusController } from "../../controllers/admin/categoryController.js";
import { parseFormData } from "../../middlewares/common/parseFormData.js";
import { verifyAdminToken } from "../../middlewares/admin/authenticate-admin.js";
import { offerSchema } from "../../validators/admin/offerValidators.js";

const router = express.Router();

const upload = multer({ 
  dest: os.tmpdir(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.get("/",verifyAdminToken,getAllCategoriesContoller)

// Create Category
router.post(
  "/",
  verifyAdminToken,           // 1. Security
  upload.single("image"),     // 2. Handle File (Multer)
  parseFormData,                  // 3. Fix Data Types (String -> Object)
  validate(createCategorySchema), // 4. Validate (Joi checks the Object)
  createCategoryController                 // 5. Success! (Controller)
);

router.patch("/:categoryId",
  upload.single("image"),
  validate(updateCategorySchema),
  updateCategoryController)

router.patch("/:categoryId/status",updateCategoryStatusController)
router.post("/:categoryId/offer",validate(offerSchema),createCategoryOfferController)
router.put("/:categoryId/offer",validate(offerSchema),updateCategoryOfferController)

export default router;