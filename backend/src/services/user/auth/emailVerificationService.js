import Otp from "../../../models/otp.model.js";
import User from "../../../models/user.model.js";
import { AppError } from "../../../utils/appError.js";
import { STATUS_CODES } from "../../../utils/constants.js";
import { sendEmail } from "../../../utils/email.js";
import bcrypt from "bcryptjs";


export const sendVerificationOTP = async(email)=>{
    
    const normEmail = email.toLowerCase().trim();

    const user = await User.findOne({
    email: normEmail,
    isBlocked: false,
    }).select("_id email isVerified");
    
    if (!user) {
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "USER_NOT_FOUND",
      "User not found"
      );
    }

    if (user.isVerified) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "ALREADY_VERIFIED",
      "Email is already verified"
      );
    }

    await Otp.deleteMany({ userId: user._id,type:"verification" });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOtp = await bcrypt.hash(otpCode, 10);

    await Otp.create({
    userId: user._id,
    email: normEmail,
    hashedOtp: hashedOtp,
    type: "verification",
    expiresAt: Date.now() + 10 * 60 * 1000, 
    });

    await sendEmail({
    to: normEmail,
    subject: "Verify your email",
    html: `
      <h2>Verify your email</h2>
      <p>Your verification code is:</p>
      <h1>${otpCode}</h1>
      <p>This code expires in <b>10 minutes</b>.</p>
    `,
    });
    console.log("DEV OTP =", otpCode);
    return { message: "Verification OTP sent successfully" };
}


export const verifyEmailOTP = async(email,otpInput)=>{

    const normEmail = email.toLowerCase().trim()
      // console.log("ALL OTP RECORDS =", await Otp.find().lean());
    const user = await User.findOne({email:normEmail})
    if (!user) {
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "USER_NOT_FOUND",
      "User not found"
      );
    }
    const otpDoc = await Otp.findOne({
      userId:user._id,
      email:normEmail,
      type:"verification"
    });

    if(!otpDoc){
     throw new AppError(
        STATUS_CODES.BAD_REQUEST,
        "OTP_NOT_FOUND",
        "OTP expired or not found"
     );
    }

    if(otpDoc.expiresAt<Date.now()){
        await Otp.deleteMany({userId:user._id})
        throw new AppError(
        STATUS_CODES.BAD_REQUEST,
        "OTP_EXPIRED",
        "OTP has expired"
      );
    }
    console.log("OTP INPUT =", otpInput);
    console.log("HASHED OTP =", otpDoc.hashedOtp);

    const isValid = await bcrypt.compare(otpInput,otpDoc.hashedOtp);

    if(!isValid){
        throw new AppError(
        STATUS_CODES.BAD_REQUEST,
        "OTP_INVALID",
        "Invalid OTP code"
      );
    }

    user.isVerified = true;
    await user.save()

    await Otp.deleteMany({userId:user._id})

    return { message: "Email verified successfully" };
}


export const resendVerificationOTP = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });

  if (!user)
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "USER_NOT_FOUND",
      "User not found"
    );

  if (user.isVerified)
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "ALREADY_VERIFIED",
      "User already verified"
    );

  await Otp.deleteMany({
    userId: user._id,
    type: "verification",
  });


  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  const hashedOtp = await bcrypt.hash(otpCode, 10);

  await Otp.create({
    userId: user._id,
    email: normalizedEmail,
    hashedOtp,
    type: "verification",
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  await sendEmail({
    to: normalizedEmail,
    subject: "Verify your email — new OTP",
    html: `
      <p>Your new verification code:</p>
      <h2>${otpCode}</h2>
      <p>This expires in 10 minutes.</p>
    `,
  });

  return { message: "Verification OTP resent successfully" };
};
