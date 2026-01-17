import bcrypt from "bcryptjs";
import User from "../../../models/user.model.js"
import { AppError } from "../../../utils/appError.js"
import { STATUS_CODES } from "../../../utils/constants.js"
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from "../../../utils/jwt.js"
import { sendVerificationOTP } from "./emailVerificationService.js";


const registerUser = async (userData) =>{
  const {fullName:name,email,phone,password} = userData

  const existingUser = await User.findOne({email})

  if(existingUser){
    
    throw new AppError(STATUS_CODES.CONFLICT,"EMAIL_ALREADY_EXISTS","User already exists.")
  }

  const hashedPassword = await bcrypt.hash(password,10)
  const newUser = new User({
    name,
    email,
    phone,
    password:hashedPassword,
  })
 
  await newUser.save()
  // const user = await User.findById(newUser._id)
  //   .select("_id name email imageId")
  //   .lean()
  
  // const accessToken = generateAccessToken(user._id)
  // const refreshToken = generateRefreshToken(user._id)
  // newUser.refreshToken = refreshToken;
  // await newUser.save();

  let result = await sendVerificationOTP(email)

  return result
  
}

const loginUser = async(userData)=>{
  const {email,password} = userData
  const user = await User.findOne({email}).select("_id name email +password imageId role phone")
  

  if(!user){
    throw new AppError(STATUS_CODES.UNAUTHORIZED,"INVALID_CREDENTIALS","Invalid email or password")
  }
  
  const isPasswordValid = await bcrypt.compare(password,user.password)

  if(!isPasswordValid){
    throw new AppError(STATUS_CODES.UNAUTHORIZED,"INVALID_CREDENTIALS","Invalid email or password")
  }
  
  const accessToken = generateAccessToken(user._id)
  const refreshToken = generateRefreshToken(user._id)
  user.refreshToken = refreshToken
  await user.save()

  const userObj = user.toObject()
  delete userObj.password
  delete userObj.refreshToken

  return {user:userObj,accessToken,refreshToken}
}

const logoutUser = async (userId, refreshToken) => {
  if (!refreshToken) return;
  console.log(userId,refreshToken,"wowwwwww")
  const user = await User.findOne({
    _id: userId,
    refreshToken,
  });

  if (!user) {
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "USER_NOT_FOUND",
      "User does not exist."
    );
  }

  user.refreshToken = null;
  await user.save();

  return { message: "User successfully logged out." };
};

export { 
        registerUser ,
        loginUser ,
        logoutUser
       }

