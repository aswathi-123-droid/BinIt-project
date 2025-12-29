import express from "express"
import { registerUserController } from "../../controllers/user/authController.js"
import { validate } from "../../middlewares/common/validate.middleware.js"
import { registerSchema } from "../../validators/user/authValidators.js"

const router = express.Router()

router.post("/register",validate(registerSchema),registerUserController)

export default router