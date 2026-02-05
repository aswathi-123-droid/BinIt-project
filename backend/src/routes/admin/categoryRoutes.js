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

router.post(
  "/",
  verifyAdminToken,           
  upload.single("image"),    
  parseFormData,                 
  validate(createCategorySchema),
  createCategoryController              
);

router.patch("/:categoryId",
  upload.single("image"),
  validate(updateCategorySchema),
  updateCategoryController)

router.patch("/:categoryId/status",updateCategoryStatusController)
router.post("/:categoryId/offer",validate(offerSchema),createCategoryOfferController)
router.put("/:categoryId/offer",validate(offerSchema),updateCategoryOfferController)

export default router;