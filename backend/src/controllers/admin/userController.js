import { getAllUsers, getUserStats } from "../../services/admin/userService.js"
import { sendResponse } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";


export const getAllUserController = async(req,res) => {
    const result = await getAllUsers(req.query);
    sendResponse(res,result,STATUS_CODES.OK)
}

export const getAdminAccountController = async(req,res) => {

    sendResponse(res,{admin:req.admin},STATUS_CODES.OK)
}

export const getUserStatsController = async(req,res) =>{
    const userId = req.params.userId;
    const {isBlocked} = req.body
    const user = await getUserStats(userId,isBlocked);
    sendResponse(res,user,STATUS_CODES.OK)
}