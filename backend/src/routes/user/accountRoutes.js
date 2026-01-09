import express from "express";
import { authenticateUser } from "../../middlewares/user/authenticate-user.js";
import { getUserAccountController, updatePersonalDetailsController, verfyEmailOtpController } from "../../controllers/user/accountController.js";


const router = express.Router();

router.use(authenticateUser);

router.get("/profile",getUserAccountController);
router.patch("/update-details",updatePersonalDetailsController);
// router.post ("/request-email-otp",requestEmailOtpController);
router.post("/verify-email-otp",verfyEmailOtpController)

export default router;
