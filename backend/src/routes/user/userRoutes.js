import express from "express"
import authRouter from "./authRoutes.js"
import accountRouter from "./accountRoutes.js"
import addressRouter from "./addressRoutes.js"
import categoryRouter from "./categoryRoutes.js"
import productRouter from './productRoutes.js'
import { getProductsController } from "../../controllers/user/productController.js"

const userRouter = express.Router()

userRouter.use("/auth",authRouter)
userRouter.use("/account",accountRouter)
userRouter.use("/address",addressRouter)
userRouter.use("/categories",categoryRouter)



userRouter.use("/products",productRouter);

export default userRouter