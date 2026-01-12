import express from "express"
import authRouter from "./authRoutes.js"
import accountRouter from "./accountRoutes.js"
import addressRouter from "./addressRoutes.js"

const userRouter = express.Router()

userRouter.use("/auth",authRouter)
userRouter.use("/account",accountRouter)
userRouter.use("/address",addressRouter)

export default userRouter