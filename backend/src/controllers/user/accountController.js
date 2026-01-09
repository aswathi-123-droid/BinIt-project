import { confirmEmailChange, getAccountDetails, requestEmailChange, updatePersonalDetails } from "../../services/user/accountServices.js";
import { sendResponse } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";

export const getUserAccountController = async(req,res) => {
    const userId = req.user._id;
    const user = await getAccountDetails(userId);
    sendResponse(res,{user},STATUS_CODES.OK);
}

export const updatePersonalDetailsController = async(req,res) =>{
    console.log("update")
    const userId = req.user._id;
    const {name,email} = req.body
    const result = await updatePersonalDetails(userId,name,email);
    sendResponse(res,{
        message:"Personal details updated successfully",
        data:result
    },STATUS_CODES.OK)
}

// export const requestEmailOtpController = async(req,res) => {
//     const userId = req.user._id;
//     const {newEmail} = req.body;

//     const result = await requestEmailChange(userId,newEmail);

//     sendResponse(res, {
//       message: "OTP sent successfully",
//       data: result,
//     });
// }

export const verfyEmailOtpController = async(req,res) => {
    
    const userId =req.user._id;
    const {otp} = req.body;
    const result = await confirmEmailChange(userId,otp)
    sendResponse(res,{message:result},STATUS_CODES.OK)
}