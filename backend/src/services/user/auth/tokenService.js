import logger from "../../../config/logger.js"
import User from "../../../models/user.model.js"
import { AppError } from "../../../utils/appError.js"
import { STATUS_CODES } from "../../../utils/constants.js"
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from "../../../utils/jwt.js"

export const  refreshAccessToken = async(token)=>{
    if(!token){
        throw new AppError(
            STATUS_CODES.UNAUTHORIZED,
            "UNAUTHORIZED",
            "Refresh token is missing")
    }
    
    const decoded = verifyRefreshToken(token);

    const user = await User.findById(decoded.userId);
    if(!user)throw new AppError(404,"USER_NOT_FOUND","User does not exist.")

    if(!user.refreshToken.includes(token))
        throw new AppError(
         STATUS_CODES.FORBIDDEN,
         "INVALID_REFRESH_TOKEN",
         "Token does not match user session."
       );

    try{
        const accessToken = generateAccessToken(user._id)
        const refreshToken = generateRefreshToken(user._id)
        console.log(refreshToken)
        user.refreshToken.push(refreshToken);
        await user.save();
        return {accessToken,refreshToken}
    }catch(err){
        logger.error(err);
        throw new AppError(
            STATUS_CODES.FORBIDDEN,
           "INVALID_REFRESH_TOKEN",
           "Invalid refresh token"
        )
    }
}