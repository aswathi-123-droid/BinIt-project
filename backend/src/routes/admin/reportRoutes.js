import express from "express";
import { getSalesReportController } from "../../controllers/admin/reportController.js";
import { verifyAdminToken } from "../../middlewares/admin/authenticate-admin.js";

const reportRoutes = express.Router();

reportRoutes.get("/sales", verifyAdminToken, getSalesReportController);

export default reportRoutes;
