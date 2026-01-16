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
        <h1> http://localhost:5173/auth/reset-password/${resetToken};</h1>
        <p>This link expires in <b>10 minutes</b>.</p>
        `,
  });

  return { message: "Password reset link sent to your email" };
};

// const forgotPassword = async (email) => {
//   const user = await User.findOne({ email });
//   if (!user) {
//     throw new AppError("User not found", 404);
//   }

//   const resetToken = crypto.randomBytes(20).toString("hex");

//   user.resetPasswordToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");

//   user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

//   await user.save();

//   const resetUrl = http://localhost:5173/reset-password/${resetToken};

//   const message = You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl};

//   try {
//     await sendEmail({
//       email: user.email,
//       subject: "Password Reset Token",
//       message,
//     });

//     return { message: "Email sent" };
//   } catch (error) {
//     console.error("Send Email Error:", error);
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpire = undefined;
//     await user.save();
//     throw new AppError("Email could not be sent", 500);
//   }
// };

// export const resetPassword = async (email, otpInput, newPassword) => {
//   const user = await User.findOne({ email }).select("+password");

//   if (!user) {
//     throw new AppError(
//       STATUS_CODES.NOT_FOUND,
//       "USER_NOT_FOUND",
//       "No account exists with this email"
//     );
//   }

//   const otpDoc = await Otp.findOne({
//     userId: user._id,
//     email,
//     type: "password-reset",
//   });

//   if (!otpDoc) {
//     throw new AppError(
//       STATUS_CODES.BAD_REQUEST,
//       "OTP_NOT_FOUND",
//       "OTP expired or not found"
//     );
//   }

//   if (otpDoc.expiresAt < Date.now()) {
//     await otpDoc.deleteOne();
//     throw new AppError(
//       STATUS_CODES.BAD_REQUEST,
//       "OTP_EXPIRED",
//       "OTP has expired"
//     );
//   }

//   const isValid = await bcrypt.compare(otpInput, otpDoc.hashedOtp);

//   if (!isValid) {
//     throw new AppError(
//       STATUS_CODES.BAD_REQUEST,
//       "OTP_INVALID",
//       "Invalid OTP code"
//     );
//   }

//   const samePassword = await bcrypt.compare(newPassword, user.password);
//   if (samePassword) {
//     throw new AppError(
//       STATUS_CODES.BAD_REQUEST,
//       "OLD_PASSWORD_REUSED",
//       "New password must be different from old password"
//     );
//   }

//   const hashedNewPassword = await bcrypt.hash(newPassword, 10);
//   user.password = hashedNewPassword;
//   user.save();

//   await Otp.deleteMany({ UserId: user._id, type: "password-reset" });

//   return { message: "Password reset successful — you can now log in" };
// };

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
