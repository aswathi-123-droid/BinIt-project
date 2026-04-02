import express from "express";
import { authenticateUser } from "../../middlewares/user/authenticate-user.js";
import { getWishlistController, toggleWishlistController } from "../../controllers/user/wishlistController.js";

const router = express.Router();
router.use(authenticateUser);

router.get("/",getWishlistController);
router.post("/toggle",toggleWishlistController);

export default router;