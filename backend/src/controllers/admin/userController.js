import { getAllUsers } from "../../services/admin/userService.js"
import { sendResponse } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";


export const getAllUserController = async(req,res) => {
    const result = await getAllUsers(req.query);
    sendResponse(res,result,STATUS_CODES.OK)
}