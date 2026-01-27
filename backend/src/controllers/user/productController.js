import { getProducts } from "../../services/user/productServices.js"
import { sendResponse } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";

export const getProductsController = async(req,res) => {
    const result = await getProducts(req.query);
    sendResponse(res,result,STATUS_CODES.OK)
};