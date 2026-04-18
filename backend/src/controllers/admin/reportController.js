import { getBestCust, getSalesReportData } from "../../services/admin/reportService.js";
import { sendResponse } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";
import logger from "../../config/logger.js";

export const getSalesReportController = async (req, res) => {
    const { filterType = "daily", startDate, endDate } = req.query;

    const reportData = await getSalesReportData(filterType, startDate, endDate);

    logger.info(`Admin fetched sales report for filterType: ${filterType}`);
    sendResponse(res, { data: reportData }, STATUS_CODES.OK);
}

export const getBestCustCont = async(req,res) => {
    const { filterType = "daily", startDate, endDate } = req.query;
    const bestCust = await getBestCust(filterType, startDate, endDate)
    sendResponse(res,{data: bestCust},STATUS_CODES.OK)
}
