import express from "express";
import { validate } from "../../middlewares/common/validate.middleware.js";
import { loginSchema } from "../../validators/user/authValidators.js";
import { adminLoginController } from "../../controllers/admin/adminAuthController.js";

const router = express.Router();

router.post("/login",validate(loginSchema),adminLoginController);

export default router;