import { verifyAccessToken } from "../../utils/jwt.js";
import User from "../../models/user.model.js";
import { STATUS_CODES } from "../../utils/constants.js";
import { AppError } from "../../utils/appError.js";

export const authenticateUser = async(req,res,next) => {
        const token = req.cookies.accessToken;
        if(!token){
          throw new AppError(
              STATUS_CODES.UNAUTHORIZED,
              "UNAUTHORIZED",
              "unauthorized"
            );
        }
    
         let decoded = verifyAccessToken(token);

        const user = await User.findById(decoded.userId)
        if(!user || user.isBlocked)throw new AppError(STATUS_CODES.UNAUTHORIZED,"USER_NOT_FOUND","User does not exist.")
        req.user = user;
        next()
}