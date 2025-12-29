import bcrypt from "bcryptjs";
import User from "../../models/user.model.js"
import { AppError } from "../../utils/appError.js"
import { STATUS_CODES } from "../../utils/constants.js"


const registerUser = async (userData) =>{
  const {name,email,password} = userData

  const existingUser = await User.findOne({email})

  if(existingUser){
    throw new AppError(STATUS_CODES.CONFLICT,"EMAIL_ALREADY_EXISTS","User already exists.")
  }

  const hashedPassword = await bcrypt.hash(password,10)
  const newUser = new User({
    name,
    email,
    password:hashedPassword,
  })

  await newUser.save()
  const user = await User.findById(newUser._id)
    .select("_id name email imageId")
    .lean()

  return user;
}

export {registerUser}

