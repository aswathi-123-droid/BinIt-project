import logger from "../../config/logger.js";
import { getWalletBalanceService, getWalletHistoryService } from "../../services/user/walletService.js";
import { sendResponse } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";



export const getWalletBalance = async (req, res) => {
    const userId = req.user._id; 
    
    logger.info(`Fetching wallet balance for user: ${userId}`);
    const data = await getWalletBalanceService(userId);
    
    sendResponse(res, {
        success: true,
        message: "Wallet balance fetched successfully",
        balance: data.balance
    }, STATUS_CODES.OK);
};

export const getWalletHistory = async (req, res) => {
    const userId = req.user._id;
    
    logger.info(`Fetching wallet transaction history for user: ${userId}`);
    const data = await getWalletHistoryService(userId);
    
    sendResponse(res, {
        success: true,
        message: "Wallet history fetched successfully",
        transactions: data.transactions
    }, STATUS_CODES.OK);
};
