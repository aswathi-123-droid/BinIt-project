import bcrypt from "bcryptjs";
import redisClient from "../../config/redis-client.js";
import User from "../../models/user.model.js";
import { AppError } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";
import { sendEmail } from "../../utils/email.js";

export const getAccountDetails = async (userId) => {
  const user = await User.findOne({
    _id: userId,
    isBlocked: false,
  }).select("_id name email phone role referralCode hasMadeFirstPurchase avatar");

  if (!user)
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "USER_NOT_FOUND",
      "could not found user",
    );
  return user;
};

export const updatePersonalDetails = async (
  userId,
  name,
  email = undefined,
  imageUrl = undefined 
) => {
  const updatedUser = await User.findById(userId);

  if (!updatedUser)
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "USER_UPDATE_FAILED",
      "Unable to update user details",
    );

  updatedUser.name = name;
  if (imageUrl) {
      updatedUser.avatar = imageUrl;
  }
  await updatedUser.save();

  if (email) {
    await requestEmailChange(userId, email);
    return { message: "Email otp sent successfully" };
  } else {
    return { message: "Changed username successfully" };
  }
};

export const requestEmailChange = async (userId, newEmail) => {
  const existingUser = await User.findOne({ email: newEmail });
  console.log(existingUser);
  if (existingUser)
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "EMAIL_EXISTS",
      "Email is already in use",
    );

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

  const user = await User.findById(userId);
  if (!user)
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "USER_NOT_FOUND",
      "cannot find user",
    );

  await redisClient.set(
    `emailChange:${userId}`,
    JSON.stringify({ otp, newEmail }),
    "EX",
    600,
  );

  await user.save();

  await sendEmail({
    to: newEmail,
    subject: "Verify Your New Email",
    html: `
      <p>Dear User,</p>
      <p>We received a request to update the email address associated with your <strong>BinIt.com</strong> account.</p>
      <p>Please use the One-Time Password (OTP) below to verify this change:</p>
      <h2 style="letter-spacing: 4px; font-size: 28px; margin: 12px 0;">${otp}</h2>
      <p>This OTP is valid for the next <strong>10 minutes</strong>.</p>
      <p>If you did not initiate this request, please ignore this message or contact our support team immediately.</p>
      <br/>
      <p>Warm regards,<br/><strong>BinIt.com Support Team</strong></p>`,
  });
};

export const confirmEmailChange = async (userId, otpInput) => {
  const data = await redisClient.get(`emailChange:${userId}`);

  if (!data) {
    throw new AppError(STATUS_CODES.BAD_REQUEST, "OTP_EXPIRED", "OTP expired");
  }

  const { otp, newEmail } = JSON.parse(data);

  console.log(data, "here confrim");
  if (otp !== otpInput)
    throw new AppError(STATUS_CODES.BAD_REQUEST, "INVALID_OTP", "Invalid Otp");

  const user = await User.findById(userId);
  user.email = newEmail;
  await user.save();

  await redisClient.del(`emailChange:${userId}`);

  return { message: "Email updated successfully" };
};

export const updatePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findOne({
    _id: userId,
    isBlocked: false,
  }).select("+password");

  if (!user)
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "USER_NOT_FOUND",
      "User not found",
    );

  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch)
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "INCORRECT_PASSWORD",
      "Current password is incorrect",
    );

  const isSamePassword = await bcrypt.compare(newPassword, user.password);

  if (isSamePassword)
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "SAME_PASSWORD",
      "New password cannot be the same as old password",
    );

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  await user.save();

  return { message: "Password updated successfully" };
};
