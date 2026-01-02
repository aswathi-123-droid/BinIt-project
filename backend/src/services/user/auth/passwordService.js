import bcrypt from "bcryptjs";
import User from "../../../models/user.model.js";
import { AppError } from "../../../utils/appError.js";
import Otp from "../../../models/otp.model.js";
import { sendEmail } from "../../../utils/email.js";
import { STATUS_CODES } from "../../../utils/constants.js";

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "USER_NOT_FOUND",
      "No account exists with this email"
    );
  }
  console.log("Hey:", user._id);
  await Otp.deleteMany({ userId: user._id, type: "password-reset" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const hashedOtp = await bcrypt.hash(otp, 10);

  await Otp.create({
    userId: user._id,
    email,
    hashedOtp,
    type: "password-reset",
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  console.log("RESET OTP =", otp);

  await sendEmail({
    to: email,
    subject: "Reset Your Password",
    html: `
        <h2>Password Reset Request</h2>
        <p>Your password reset code:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in <b>10 minutes</b>.</p>
        `,
  });

  return { message: "Password reset OTP sent to your email" };
};

export const resetPassword = async (email, otpInput, newPassword) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "USER_NOT_FOUND",
      "No account exists with this email"
    );
  }

  const otpDoc = await Otp.findOne({
    userId: user._id,
    email,
    type: "password-reset",
  });

  if (!otpDoc) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "OTP_NOT_FOUND",
      "OTP expired or not found"
    );
  }

  if (otpDoc.expiresAt < Date.now()) {
    await otpDoc.deleteOne();
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "OTP_EXPIRED",
      "OTP has expired"
    );
  }

  const isValid = await bcrypt.compare(otpInput, otpDoc.hashedOtp);

  if (!isValid) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "OTP_INVALID",
      "Invalid OTP code"
    );
  }

  const samePassword = await bcrypt.compare(newPassword, user.password);
  if (samePassword) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "OLD_PASSWORD_REUSED",
      "New password must be different from old password"
    );
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedNewPassword;
  user.save();

  await Otp.deleteMany({ UserId: user._id, type: "password-reset" });

  return { message: "Password reset successful — you can now log in" };
};

export const resendResetOTP = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });

  if (!user)
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "USER_NOT_FOUND",
      "No account exists with this email"
    );

  if (user.isBlocked)
    throw new AppError(
      STATUS_CODES.FORBIDDEN,
      "ACCOUNT_DISABLED",
      "This account is disabled"
    );

  await Otp.deleteMany({
    userId: user._id,
    type: "password-reset",
  });

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  const hashedOtp = await bcrypt.hash(otpCode, 10);

  await Otp.create({
    userId: user._id,
    email: normalizedEmail,
    hashedOtp,
    type: "password-reset",
    expiresAt: Date.now() + 10 * 60 * 1000,
  });


  await sendEmail({
    to: normalizedEmail,
    subject: "Reset your password — OTP",
    html: `
      <p>Your password reset code is:</p>
      <h2>${otpCode}</h2>
      <p>This expires in 10 minutes.</p>
    `,
  });

  return { message: "Reset OTP resent successfully" };
};
