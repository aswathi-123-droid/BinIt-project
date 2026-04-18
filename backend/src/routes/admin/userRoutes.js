import express from "express";
import { getAllUserController, getUserStatsController } from "../../controllers/admin/userController.js";
import { getAdminAccountController } from "../../controllers/admin/userController.js";


const  router = express.Router();


router.get("/",getAllUserController);
router.get("/profile",getAdminAccountController);
router.patch("/:userId/stats",getUserStatsController);

export default router