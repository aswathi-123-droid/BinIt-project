import { getAllProducts } from "../../services/user/productServices.js"
import Product from "../../models/product.model.js";
import { sendResponse } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";
import { AppError } from "../../utils/appError.js";

export const getProductsController = async(req,res) => {
    const result = await getAllProducts(req.query);
    sendResponse(res,result,STATUS_CODES.OK)
};


export const getProductById = async (req, res) => {
    const { id } = req.params;
    
    const product = await Product.findById(id).populate("categoryId", "name");
    console.log(product,'kiii')
    if (!product) {
        throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Product not found");
    }

    res.status(STATUS_CODES.OK).json({
        success: true,
        product
    });
};