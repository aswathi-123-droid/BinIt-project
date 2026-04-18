import express from "express";
import { verifyAdminToken } from "../../middlewares/admin/authenticate-admin.js";
import authRouter from "./authRoutes.js"
import userRouter from "./userRoutes.js"
import categoryRouter from "./categoryRoutes.js"
import productRoutes from "./productRoutes.js";
import orderRoutes from "./orderRoutes.js"
import couponRoutes from "./couponRoutes.js"
import reportRoutes from "./reportRoutes.js"

const adminRouter = express.Router();

adminRouter.use("/auth",authRouter);
adminRouter.use("/users",verifyAdminToken,userRouter);
adminRouter.use("/categories",verifyAdminToken,categoryRouter);
adminRouter.use("/products", productRoutes);
adminRouter.use("/order", orderRoutes);
adminRouter.use("/coupons", couponRoutes);
adminRouter.use("/reports", verifyAdminToken, reportRoutes);

export default adminRouter;