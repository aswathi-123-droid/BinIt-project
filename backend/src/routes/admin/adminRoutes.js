import express from "express";
import { verifyAdminToken } from "../../middlewares/admin/authenticate-admin.js";
import authRouter from "./authRoutes.js"
import userRouter from "./userRoutes.js"

const adminRouter = express.Router();

adminRouter.use("/auth",authRouter);
adminRouter.use("/users",verifyAdminToken,userRouter);

export default adminRouter;