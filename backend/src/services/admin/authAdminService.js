import bcrypt from "bcryptjs";
import User from "../../models/user.model.js"
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt.js";
import { STATUS_CODES } from "../../utils/constants.js";
import { AppError } from "../../utils/appError.js";

export const adminLogin = async({email,password}) => {
    const user = await User.findOne({email}).select("+password role name email");

    if (!user || user.role !== "admin") {
    throw new AppError(STATUS_CODES.UNAUTHORIZED, "UNAUTHORIZED", "Invalid admin credentials.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
    throw new AppError(STATUS_CODES.UNAUTHORIZED, "UNAUTHORIZED", "Invalid admin credentials.");
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    const adminObj = user.toObject();
    delete adminObj.password;

  return { admin: adminObj, accessToken, refreshToken };

}

export const refreshAdminAccessToken = async (token) => {
  if (!token) {
    throw new AppError(
      STATUS_CODES.UNAUTHORIZED,
      "UNAUTHORIZED",
      "Refresh token is missing"
    );
  }

  const decoded = verifyRefreshToken(token);


  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new AppError(STATUS_CODES.NOT_FOUND, "USER_NOT_FOUND", "User does not exist.");
  }


  if (user.role !== "admin") {
    throw new AppError(STATUS_CODES.FORBIDDEN, "FORBIDDEN", "Access denied. Not an admin.");
  }

  
  if (!user.refreshToken.includes(token)) {
    throw new AppError(
      STATUS_CODES.FORBIDDEN,
      "INVALID_REFRESH_TOKEN",
      "Token does not match user session."
    );
  }

  try {
    const accessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = user.refreshToken.filter((t) => t !== token);
    user.refreshToken.push(newRefreshToken);
    
    await user.save();

    return { accessToken, refreshToken: newRefreshToken };
  } catch (err) {
    throw new AppError(
      STATUS_CODES.FORBIDDEN,
      "INVALID_REFRESH_TOKEN",
      "Invalid refresh token"
    );
  }
};

export const logoutAdmin = async(userId,adminRefreshToken) =>{
   if (!adminRefreshToken) return;

  const user = await User.findOne({
    _id: userId,
    refreshToken:adminRefreshToken,
  });

  if (!user) {
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "USER_NOT_FOUND",
      "Admin does not exist."
    );
  }

  user.refreshToken = null;
  await user.save();

  return { message: "Admin successfully logged out." };
}

