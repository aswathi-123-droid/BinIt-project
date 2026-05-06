import express from 'express'
import { authenticateUser } from '../../middlewares/user/authenticate-user.js';
import { getProductById, getProductsController } from '../../controllers/user/productController.js';

const router = express.Router();

// router.use(authenticateUser);

router.get("/",getProductsController);
router.get("/:id", getProductById);

export default router;
