
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
       userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        index:true
       },
       email:{
        type:String,
        required:true,
        trim:true
       },
       hashedOtp:{
        type:String,
        required:true
       },
       type:{
        type:String,
        enum:["password-reset", "verification"],
        required:true
       },
       expiresAt:{
        type:Date,
        required:true
       },
    },
    {
        timestamps :{createdAt:true,updatedAt:false}
    }
)

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); 

const Otp = mongoose.model("OTP",otpSchema);    
export default Otp;

