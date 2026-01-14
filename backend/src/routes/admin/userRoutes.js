import express from "express";
import { verifyAdminToken } from "../../middlewares/admin/authenticate-admin.js";
import { getAllUserController } from "../../controllers/admin/userController.js";


const  router = express.Router();

router.get("/",verifyAdminToken,getAllUserController)

export default router