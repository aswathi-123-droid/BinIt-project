import express from "express";
import { verifyAdminToken } from "../../middlewares/admin/authenticate-admin.js";
import authRouter from "./authRoutes.js"
import userRouter from "./userRoutes.js"
import categoryRouter from "./categoryRoutes.js"

const adminRouter = express.Router();

adminRouter.use("/auth",authRouter);
adminRouter.use("/users",verifyAdminToken,userRouter);
adminRouter.use("/categories",verifyAdminToken,categoryRouter);

export default adminRouter;