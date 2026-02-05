import Product from "../../models/product.model.js";
import Category from "../../models/category.model.js";
import { AppError, buildProductQuery, getCategorySortOption, getPagination, getSortOption } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";
import logger from "../../config/logger.js";


export const createProduct = async (productData) => {
  const { categoryId, name, type } = productData;


  const categoryDoc = await Category.findById(categoryId);
  if (!categoryDoc) {
    throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Selected category does not exist.");
  }

  const existingProduct = await Product.findOne({ 
    name: { $regex: new RegExp(`^${name}$`, "i") } 
  });
  
  if (existingProduct) {
    throw new AppError(STATUS_CODES.CONFLICT, "CONFLICT", `Item '${name}' already exists.`);
  }

  const newProduct = await Product.create({
    ...productData,
    type: type || categoryDoc.type 
  });

  logger.info(`Product created: ${newProduct.name} [ID: ${newProduct._id}]`);
  return newProduct;
};


export const getAllProducts = async (queryParams) => {
  const { 
    page, 
    limit, 
    search, 
    type,       
    stockStatus,
    sortBy, 
  } = queryParams;

  const { pageSize, skip, pageNumber } = getPagination(page, limit);

  const query = buildProductQuery({search,type,stockStatus})

  const sort = getCategorySortOption(sortBy);

  const [products, totalCount, recyclableCount, junkCount, storeCount] = await Promise.all([
    Product.find(query)
      .populate("categoryId", "name type") 
      .sort(sort)
      .skip(skip)
      .limit(pageSize),
    Product.countDocuments(),
    Product.countDocuments({ type: "recyclable" }),
    Product.countDocuments({ type: "junk" }),
    Product.countDocuments({ type: "store"}),
  ]);
   
  return {
    items: products, 
    stats: {
      totalCount,
      recyclableCount,
      junkCount,
      storeCount
    },
    pagination: {
      totalCount,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      pageSize
    }
  };
};


export const updateProduct = async (productId, updateData) => {
  const product = await Product.findByIdAndUpdate(productId, updateData, { new: true });
  
  if (!product) {
    throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Item not found.");
  }
  
  logger.info(`Product updated: ${product.name} [ID: ${productId}]`);
  return product;
};

export const toggleProductStatus = async (productId) => {
  const product = await Product.findById(productId);
  console.log(product,"will do")
  if (!product) {
    throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Item not found.");
  }
  
  product.isActive = !product.isActive;
  await product.save();
  
  return product;
};

export const deleteProduct = async (productId) => {
    const product = await Product.findByIdAndUpdate(productId, { isDeleted: true });
    
    if (!product) {
        throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Item not found.");
    }

    logger.info(`Product soft-deleted: ${product.name} [ID: ${productId}]`);
    return { message: "Item deleted successfully" };
};