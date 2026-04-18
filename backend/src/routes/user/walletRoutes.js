import express from "express";
import { authenticateUser } from "../../middlewares/user/authenticate-user.js";
import { getWalletBalance, getWalletHistory } from "../../controllers/user/walletController.js";


const router = express.Router();
router.use(authenticateUser);

router.get('/balance', getWalletBalance);
router.get('/history', getWalletHistory);

export default router;