import { confirmEmailChange, getAccountDetails, requestEmailChange, updatePassword, updatePersonalDetails } from "../../services/user/accountServices.js";
import { sendResponse } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";

export const getUserAccountController = async(req,res) => {
    const userId = req.user._id;
    const user = await getAccountDetails(userId);
    sendResponse(res,{user},STATUS_CODES.OK);
}

export const updatePersonalDetailsController = async(req,res) =>{
    console.log("update")
    const userId = req.user._id;
    const {name,email} = req.body
    let imageUrl = undefined;
    if (req.file) {
        imageUrl = await uploadToCloudinary(req.file.path);
    }
    const result = await updatePersonalDetails(userId,name,email,imageUrl);
    sendResponse(res,{
        message:"Personal details updated successfully",
        data:result
    },STATUS_CODES.OK)
}

export const requestEmailOtpController = async(req,res) => {
    const userId = req.user._id;
    const {email} = req.body;
    console.log(email,"jimbooo")
    const result = await requestEmailChange(userId,email);

    sendResponse(res, {
      message: "OTP sent successfully",
      data: result,
    });
}

export const verfyEmailOtpController = async(req,res) => {
    
    const userId =req.user._id;
    const {otp} = req.body;
    const result = await confirmEmailChange(userId,otp)
    sendResponse(res,result,STATUS_CODES.OK)
}

export const updatePasswordController = async(req,res) => {
   const userId = req.user._id;
   const {currentPassword,newPassword} = req.body;
   const result = await updatePassword(userId,currentPassword,newPassword);
   sendResponse(res,result,STATUS_CODES.OK)
}