import express from "express";
import { authenticateUser } from "../../middlewares/user/authenticate-user.js";
import { getUserAccountController, updatePasswordController, updatePersonalDetailsController, verfyEmailOtpController } from "../../controllers/user/accountController.js";
import { validate } from "../../middlewares/common/validate.middleware.js";
import { updatePasswordSchema } from "../../validators/user/accountValidators.js";


const router = express.Router();

router.use(authenticateUser);

router.get("/profile",getUserAccountController);
router.patch("/update-details",updatePersonalDetailsController);
// router.post ("/request-email-otp",requestEmailOtpController);
router.post("/verify-email-otp",verfyEmailOtpController)
router.patch("/update-password",validate(updatePasswordSchema),updatePasswordController)

export default router;
