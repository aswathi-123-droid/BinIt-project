import bcrypt from "bcryptjs";
import User from "../../models/user.model.js"
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import { STATUS_CODES } from "../../utils/constants.js";

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