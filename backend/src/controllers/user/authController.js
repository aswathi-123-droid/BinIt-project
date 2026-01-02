import {registerUser , loginUser} from "../../services/user/auth/authService.js"
import { resendVerificationOTP, sendVerificationOTP, verifyEmailOTP } from "../../services/user/auth/emailVerificationService.js"
import { refreshAccessToken } from "../../services/user/auth/tokenService.js"
import { AppError, sendResponse } from "../../utils/appError.js"
import { STATUS_CODES } from "../../utils/constants.js"
import { setRefreshToken } from "../../utils/jwt.js"
import User from "../../models/user.model.js"
import { forgotPassword, resendResetOTP, resetPassword } from "../../services/user/auth/passwordService.js"


export const registerUserController = async(req,res)=>{
   const {user,accessToken,refreshToken} = await registerUser(req.body)

   setRefreshToken(res,refreshToken);
   sendResponse(res,{user,token:accessToken},STATUS_CODES.CREATED)
}



export const loginUserController = async(req,res)=>{
   const {user,accessToken,refreshToken} = await loginUser(req.body)
   
   setRefreshToken(res,refreshToken)
   sendResponse(res,{user,token:accessToken},STATUS_CODES.OK)
}

export const refreshAccessTokenController = async(req,res)=>{
   const token = req.cookies.refreshToken
    if (!token)
    throw new AppError(
      STATUS_CODES.UNAUTHORIZED,
      "UNAUTHORIZED",
      "unauthorized"
    );
    const {accessToken,refreshToken} = await refreshAccessToken(token)

    setRefreshToken(res,refreshToken)
    res.status(STATUS_CODES.OK).json({token:accessToken})
}


export const sendOTPController = async(req,res)=>{
   const {email} = req.body;
   console.log("REQ EMAIL =", req.body.email);
   console.log("FOUND USER =", await User.find().lean());

   if(!email){
      throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "MISSING_DATA",
      "Email is required"
      );
   }

   await sendVerificationOTP(email);

   sendResponse(res,{ message: "OTP sent to your email" },STATUS_CODES.OK);
}

export const verifyOTPContoller = async(req,res)=>{
   const {email,otp} = req.body

   if(!email || !otp){
      throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "MISSING_DATA",
      "Email or OTP missing"
      )
   }

   await verifyEmailOTP(email,otp)

   sendResponse(res,{message: "Email verified successfully"},STATUS_CODES.OK)
}

export const resendVerificationOTPController = async(req,res)=>{
   const {email} = req.body
   
   if (!email) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "MISSING_EMAIL",
      "Email is required"
    );
  }
   await resendVerificationOTP(email);
   sendResponse(res,{ message:"OTP resent successfully" },STATUS_CODES.OK)
}

export const forgotPasswordController = async(req,res)=>{
   const {email} = req.body
   
   const result = await forgotPassword(email)
   sendResponse(res,result,STATUS_CODES.OK)
}

export const resetPasswordController = async(req,res)=>{
   const {email, otp ,newPassword} = req.body;

   const result = await resetPassword(email, otp, newPassword);
   sendResponse(res,result,STATUS_CODES.OK)
}

export const resendResetOTPController = async (req, res) => {
  const { email } = req.body;

  await resendResetOTP(email);

  sendResponse(res,{ message: "Password reset OTP resent successfully" }, STATUS_CODES.OK);
};