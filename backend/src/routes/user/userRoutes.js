import express from "express"
import authRouter from "./authRoutes.js"
import accountRouter from "./accountRoutes.js"

const userRouter = express.Router()

userRouter.use("/auth",authRouter)
userRouter.use("/account",accountRouter)

export default userRouter