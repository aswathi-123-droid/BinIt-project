import { addAddress, deleteAddress, editAddress, getAllAddress } from "../../services/user/addressServices.js";
import { sendResponse } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";


export const addAddressController = async(req,res) => {
    const userId = req.user._id;
    const addressData = req.body;

    const createdAddress = await addAddress(userId,addressData);

    console.log(createdAddress)
    sendResponse(
        res,
        {message:"Address added successfully", data:createdAddress},
        STATUS_CODES.CREATED
    )
}

export const getAllAddressController = async(req,res) => {
    const userId = req.user._id;

    const addresses =await getAllAddress(userId);
    sendResponse(res,{data:addresses},STATUS_CODES.OK)
}

export const editAddressController = async(req,res) => {
    const addressId = req.params.id;

    const updated = await editAddress(addressId,req.body)   

  if (!updated) {
    return sendResponse(
      res,
      { message: "Address not found" },
      STATUS_CODES.NOT_FOUND
    );
  }

  sendResponse(res, {
    message: "Address updated successfully",
    data: updated,
  });
}

export const deleteAddressController = async (req, res) => {
  const addressId = req.params.id;

  const deleted = await deleteAddress(addressId);

  if (!deleted) {
    return sendResponse(
      res,
      { message: "Address not found" },
      STATUS_CODES.NOT_FOUND
    );
  }

  return sendResponse(res, { message: "Address deleted successfully" });
};