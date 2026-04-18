import jwt from "jsonwebtoken";
import { verifyAccessToken } from "../../utils/jwt.js";
import User from "../../models/user.model.js";
import { AppError } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";


export const verifyAdminToken = async(req,res,next) => {
    const token = req.cookies.adminAccessToken;

    if (!token) {
    throw new AppError(STATUS_CODES.UNAUTHORIZED, "UNAUTHORIZED", "Admin access required.");
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId);

    if (!user || user.role !== "admin") {
    throw new AppError(STATUS_CODES.FORBIDDEN, "FORBIDDEN", "Access denied. Admins only.");
    }

    if (user.isBlocked) {
    throw new AppError(STATUS_CODES.UNAUTHORIZED, "UNAUTHORIZED", "Admin account is deactivated.");
    }

    req.admin = user;
    next()
}