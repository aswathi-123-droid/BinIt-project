import express from "express"
import authRouter from "./authRoutes.js"

const userRouter = express.Router()

userRouter.use("/auth",authRouter)

export default userRouter