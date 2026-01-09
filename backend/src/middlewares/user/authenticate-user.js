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
         if(!decoded)
            throw new AppError(
              STATUS_CODES.UNAUTHORIZED,
              "UNAUTHORIZED",
              "Not authorized, token expired or invalid"
            ); 

        const user = await User.findById(decoded.userId)
        if(!user)throw new AppError(STATUS_CODES.NOT_FOUND,"USER_NOT_FOUND","User does not exist.")
        if(user.isBlocked)throw new AppError(STATUS_CODES.UNAUTHORIZED,"USER_NOT_FOUND","User does not exist or Not authorized")
        req.user = user;
        next()
}