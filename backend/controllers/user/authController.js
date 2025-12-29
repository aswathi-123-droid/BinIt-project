import {registerUser} from "../../services/user/authService.js"
import { sendResponse } from "../../utils/appError.js"
import { STATUS_CODES } from "../../utils/constants.js"


export const registerUserController = async(req,res)=>{
   const user = await registerUser(req.body)

   sendResponse(res,user,STATUS_CODES.CREATED)
}