import { adminLogin, logoutAdmin } from "../../services/admin/authAdminService.js"
import { refreshAccessToken } from "../../services/user/auth/tokenService.js";
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

export const refreshAdminTokenController = async(req,res) => {
    const token = req.cookies.adminRefreshToken;
    const {accessToken, refreshToken} = await refreshAccessToken(token);

    setAdminAccessToken(res,accessToken);
    setAdminRefreshToken(res,refreshToken);

    sendResponse(res,{ message: "Admin session refreshed successfully" }, STATUS_CODES.OK);
}

export const logoutAdminController = async (req,res) => {
    const userId = req.admin._id
    console.log(req,"lets look")

    if (!userId) {
        throw new AppError(
          STATUS_CODES.UNAUTHORIZED,
          "UNAUTHORIZED",
          "Admin not authenticated."
        );
    }

    const adminRefreshToken = req.cookies?.adminRefreshToken;

    const result = await logoutAdmin(userId,adminRefreshToken);

    res.clearCookie("adminAccessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
    });

    res.clearCookie("adminRefreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
    });

    sendResponse(res,result,STATUS_CODES.OK)
}

