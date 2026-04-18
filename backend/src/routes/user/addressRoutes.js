import express from 'express';
import { authenticateUser } from '../../middlewares/user/authenticate-user.js';
import { validateCreateAddress, validateEditAddress } from '../../validators/user/addressValidators.js';
import { addAddressController, deleteAddressController, editAddressController, getAllAddressController } from '../../controllers/user/addressController.js';
const router = express.Router();

router.use(authenticateUser);

router.post("/",validateCreateAddress,addAddressController);
router.get("/",getAllAddressController);
router.patch("/:id",validateEditAddress,editAddressController);
router.delete("/:id",deleteAddressController)

export default router;