// import App from "../../../../frontend/src/App.jsx";
import redisClient from "../../config/redis-client.js";
import User from "../../models/user.model.js"
import { AppError } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";
import { sendEmail } from "../../utils/email.js";


export const getAccountDetails = async(userId) =>{
    const user = await User.findOne({
        _id:userId,
        isBlocked:false
    }).select("_id name email phone");

    if(!user)
      throw new AppError(
       STATUS_CODES.NOT_FOUND,
       "USER_NOT_FOUND",
       "could not found user"
      );
      return user;
}

export const updatePersonalDetails = async(userId,name,email=undefined) =>{
  console.log(name,email)
  // const allowedFields = ["name","email"] ;

  // const filteredUpdates = Object.fromEntries(
  //   Object.entries(updates).filter(([key])=>allowedFields.includes(key))
  // )

  // const updatedUser = await User.findOneAndUpdate(
  //   {_id:userId,isBlocked:false},
  //   {$set: filteredUpdates},
  //   {new:true , runValidators:true}
  // ).select("_id name email phone")

  const updatedUser=await User.findById(userId);
  

  if(!updatedUser)
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "USER_UPDATE_FAILED",
      "Unable to update user details"
   );

   updatedUser.name=name;
   await updatedUser.save();
   
   
   if(email){
    // const existingEmail = User.findOne({email})
    // if(updatedUser.email === email || existingEmail)
    //   throw new AppError(
    //     STATUS_CODES.BAD_REQUEST,
    //     "EMAIL_EXISTS",
    //     "Email is already in use"
    //  )

     await requestEmailChange(userId,email)
     return {message : "Email otp sent successfully"}
   }else{
     return {message : "Changed username successfully"}
   }

  
}

export const requestEmailChange = async(userId,newEmail) =>{
  const existingUser = await User.findOne({email:newEmail});
  console.log(existingUser)
  if(existingUser)
    throw new AppError(
    STATUS_CODES.BAD_REQUEST,
    "EMAIL_EXISTS",
    "Email is already in use"
  )

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

  const user = await User.findById(userId);
  if(!user)throw new AppError(STATUS_CODES.NOT_FOUND,"USER_NOT_FOUND", "cannot find user");

    await redisClient.set(
    `emailChange:${userId}`,
    JSON.stringify({ otp, newEmail }),
    "EX",
    600
  );

  await user.save();

  await sendEmail({
    to:newEmail,
    subject:"Verify Your New Email",
    html:`
      <p>Dear User,</p>
      <p>We received a request to update the email address associated with your <strong>11Jersey.com</strong> account.</p>
      <p>Please use the One-Time Password (OTP) below to verify this change:</p>
      <h2 style="letter-spacing: 4px; font-size: 28px; margin: 12px 0;">${otp}</h2>
      <p>This OTP is valid for the next <strong>10 minutes</strong>.</p>
      <p>If you did not initiate this request, please ignore this message or contact our support team immediately.</p>
      <br/>
      <p>Warm regards,<br/><strong>11Jersey.com Support Team</strong></p>`,
    })

    
  //  return {message : "OTP sent to new Email"}
}


export const confirmEmailChange = async (userId, otpInput) => {
  
  const data = await redisClient.get(`emailChange:${userId}`);

  // Step 2: Check if the data exists (if not, it likely expired)
  if (!data) {
    throw new AppError(STATUS_CODES.BAD_REQUEST, "OTP_EXPIRED", "OTP expired");
  }

  // Step 3: Parse the JSON string back into a JavaScript object
  const { otp, newEmail } = JSON.parse(data);
  
  console.log(data,"here confrim")
  if(otp !== otpInput)
    throw new AppError(STATUS_CODES.BAD_REQUEST, "INVALID_OTP", "Invalid Otp")

  const user = await User.findById(userId);
  user.email = newEmail;
  await user.save()

  return {message:"OTP verified successfully"}
};