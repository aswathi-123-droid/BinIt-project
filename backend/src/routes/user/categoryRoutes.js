import express from "express"
import { authenticateUser } from "../../middlewares/user/authenticate-user.js";
import {  getActiveCategoriesController } from "../../controllers/user/categoryController.js";

const router = express.Router();

router.use(authenticateUser);

router.get("/",getActiveCategoriesController)

export default router;