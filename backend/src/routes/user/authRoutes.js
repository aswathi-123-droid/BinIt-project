import express from "express"
import { registerUserController,
        loginUserController, 
        refreshAccessTokenController ,
        sendOTPController, verifyOTPContoller,
        forgotPasswordController,
        resetPasswordController,
        resendVerificationOTPController,
        resendResetOTPController,
        logoutController} from "../../controllers/user/authController.js"
import { validate } from "../../middlewares/common/validate.middleware.js"
import { registerSchema , loginSchema, verifyOTPSchema, forgotPasswordSchema, resetPasswordSchema, resendOtpSchema} from "../../validators/user/authValidators.js"
import { authenticateUser } from "../../middlewares/user/authenticate-user.js"

const router = express.Router()

router.post("/register",validate(registerSchema),registerUserController)
router.post ("/login",validate(loginSchema),loginUserController)
router.post("/refresh-token",refreshAccessTokenController)
router.post("/send-otp", sendOTPController);
router.post("/verify-otp", validate(verifyOTPSchema), verifyOTPContoller);
router.post("/forgot-password",validate(forgotPasswordSchema),forgotPasswordController)
router.post("/reset-password",validate(resetPasswordSchema),resetPasswordController)
router.post("/resend-verification-otp",validate(resendOtpSchema),resendVerificationOTPController)
router.post("/resend-reset-otp",validate(resendOtpSchema),resendResetOTPController)
router.post("/logout",authenticateUser,logoutController)

export default router