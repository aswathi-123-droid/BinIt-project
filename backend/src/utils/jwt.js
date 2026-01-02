import jwt from "jsonwebtoken"
import {env} from "../config/env.js"

export const generateAccessToken = (userId) =>{
    return jwt.sign(
        {userId},
        env.JWT_ACCESS_SECRET,
        {expiresIn:env.ACCESS_TOKEN_EXPIRES || "15m" }
    );
};

export const generateRefreshToken = (userId) =>{
    return jwt.sign(
        {userId},
        env.JWT_REFRESH_SECRET,
        {expiresIn:env.REFRESH_TOKEN_EXPIRES || "7d" }

    );
};

export const setRefreshToken =(res,token) =>{
    res.cookie("refreshToken",token,{
        httpOnly:true,
        secure:env.NODE_ENV === "production",
        sameSite:"Strict"
    })
}

export const verifyAccessToken = (token)=>{
    return jwt.verify(token,env.JWT_ACCESS_SECRET)
}

export const verifyRefreshToken = (token)=>{
    return jwt.verify(token,env.JWT_REFRESH_SECRET)
}

