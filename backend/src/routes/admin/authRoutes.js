import express from "express";
import { validate } from "../../middlewares/common/validate.middleware.js";
import { loginSchema } from "../../validators/user/authValidators.js";
import { adminLoginController, logoutAdminController, refreshAdminTokenController} from "../../controllers/admin/adminAuthController.js";
import { verifyAdminToken } from "../../middlewares/admin/authenticate-admin.js";

const   router = express.Router();

router.post("/login",validate(loginSchema),adminLoginController);
router.post("/refresh-token", refreshAdminTokenController)
router.post("/admin-logout",verifyAdminToken,logoutAdminController);


export default router;