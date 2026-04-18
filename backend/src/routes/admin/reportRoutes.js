import express from "express";
import { getBestCustCont, getSalesReportController } from "../../controllers/admin/reportController.js";
import { verifyAdminToken } from "../../middlewares/admin/authenticate-admin.js";

const reportRoutes = express.Router();

reportRoutes.get("/sales", verifyAdminToken, getSalesReportController);
reportRoutes.get("/bestCust",verifyAdminToken,getBestCustCont)

export default reportRoutes;
