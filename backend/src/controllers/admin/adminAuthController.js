import { adminLogin } from "../../services/admin/authAdminService.js"
import { sendResponse } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";
import { setAdminAccessToken, setAdminRefreshToken } from "../../utils/jwt.js";


export const adminLoginController = async(req,res) => {
    console.log(req.body,"adminLogin")
    const {admin, accessToken, refreshToken} = await adminLogin(req.body);

    setAdminAccessToken(res,accessToken);
    setAdminRefreshToken(res,refreshToken);

    sendResponse(res, { admin }, STATUS_CODES.OK);
}