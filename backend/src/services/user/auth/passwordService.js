import bcrypt from "bcryptjs";
import User from "../../../models/user.model.js";
import { AppError } from "../../../utils/appError.js";
import Otp from "../../../models/otp.model.js";
import { sendEmail } from "../../../utils/email.js";
import { STATUS_CODES } from "../../../utils/constants.js";
import * as crypto from "crypto"

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "USER_NOT_FOUND",
      "No account exists with this email"
    );
  }

  const resetToken = crypto.randomBytes(20).toString("hex");

  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save();

  await sendEmail({
    to: email,
    subject: "Reset Your Password",
    html: `
        <h2>Password Reset Request</h2>
        <p>Your password reset link:</p>
        <h1> http://localhost:5173/auth/reset-password/${resetToken}</h1>
        <p>This link expires in <b>10 minutes</b>.</p>
        `,
  });

  return { message: "Password reset link sent to your email" };
};


export const resetPassword = async (resetToken, newPassword) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");


    
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire:{ $gt: Date.now() },
  }).select("+password");

  if (!user) {
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "USER_NOT_FOUND",
      "INAVALID TOKEN OR EXPIRED TOKEN"
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
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.save();

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
    type: "verification",
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
