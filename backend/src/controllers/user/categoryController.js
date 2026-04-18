import Category from "../../models/category.model.js"
import { getActiveCategories } from "../../services/user/categoryServices.js";
import { sendResponse } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";


export const getActiveCategoriesController = async(req,res) => {
    const categories = await getActiveCategories()

    sendResponse(res,{categories:categories},STATUS_CODES.OK)
}