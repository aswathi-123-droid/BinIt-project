import mongoose from "mongoose";
import logger from "./logger.js";
import {env} from "./env.js"

export const connectDB = async()=>{
    try{
        await mongoose.connect(env.MONGO_URI)
        logger.info("MongoDB connected successfully")
    }catch(error){
        logger.error("MongoDB connection failed",{
            message:error.message,
            stack:error.stack
        })
        process.exit(1)
    }
}