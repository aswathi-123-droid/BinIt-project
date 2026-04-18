import {registerUser , loginUser, logoutUser} from "../../services/user/auth/authService.js"
import { resendVerificationOTP, sendVerificationOTP, verifyEmailOTP } from "../../services/user/auth/emailVerificationService.js"
import { refreshAccessToken } from "../../services/user/auth/tokenService.js"
import { AppError, sendResponse } from "../../utils/appError.js"
import { STATUS_CODES } from "../../utils/constants.js"
import { generateAccessToken, generateRefreshToken, setAccessToken, setRefreshToken } from "../../utils/jwt.js"
import User from "../../models/user.model.js"
import { forgotPassword, resendResetOTP, resetPassword } from "../../services/user/auth/passwordService.js"
import { env } from "../../config/env.js"
import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(env.VITE_GOOGLE_CLIENT_ID);


export const registerUserController = async(req,res)=>{
   const result = await registerUser(req.body)

   // setRefreshToken(res,refreshToken);
   sendResponse(res,result,STATUS_CODES.CREATED)
}



export const loginUserController = async(req,res)=>{
   const {user,accessToken,refreshToken} = await loginUser(req.body)
   setAccessToken(res,accessToken)
   setRefreshToken(res,refreshToken)
   sendResponse(res,{user},STATUS_CODES.OK)
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
    setAccessToken(res,accessToken)
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
   console.log("here",req.body)
   const {token,password} = req.body;

   const result = await resetPassword(token,password);
   sendResponse(res,result,STATUS_CODES.OK)
}

export const resendResetOTPController = async (req, res) => {
  const { email } = req.body;

  await resendResetOTP(email);

  sendResponse(res,{ message: "Password reset OTP resent successfully" }, STATUS_CODES.OK);
};

export const logoutController = async (req,res) => {
   const userId = req.user._id;

   if (!userId) {
    throw new AppError(
      STATUS_CODES.UNAUTHORIZED,
      "UNAUTHORIZED",
      "User not authenticated."
    );
  }
   const refreshToken = req.cookies?.refreshToken;

   const result = await logoutUser(userId,refreshToken);

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  sendResponse(res,result,STATUS_CODES.OK)

}

export const googleAuthController = async (req, res) => {
  const { idToken } = req.body;

  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.VITE_GOOGLE_CLIENT_ID,
  });
  const { email, name, sub:googleId } = ticket.getPayload();

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name,
      email,
      googleId,
      isVerified: true,
      role: "user"
    });
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken.push(refreshToken);
  user.save();
  setAccessToken(res, accessToken);
  setRefreshToken(res, refreshToken);

  sendResponse(res, { user }, STATUS_CODES.OK);
};