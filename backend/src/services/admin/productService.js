import Product from "../../models/product.model.js";
import Category from "../../models/category.model.js";
import { AppError, buildProductQuery, getCategorySortOption, getPagination, getSortOption } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";
import logger from "../../config/logger.js";

/**
 * Create a new Inventory Item
 */
export const createProduct = async (productData) => {
  const { categoryId, name, type } = productData;

  // 1. Verify Category exists
  const categoryDoc = await Category.findById(categoryId);
  if (!categoryDoc) {
    throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Selected category does not exist.");
  }

  // 2. Check for Duplicates
  const existingProduct = await Product.findOne({ 
    name: { $regex: new RegExp(`^${name}$`, "i") } 
  });
  
  if (existingProduct) {
    throw new AppError(STATUS_CODES.CONFLICT, "CONFLICT", `Item '${name}' already exists.`);
  }

  // 3. Create Product
  // Ensure we save the specific 'type' (earn/pay/store) to the product for easier filtering later
  const newProduct = await Product.create({
    ...productData,
    type: type || categoryDoc.type // Fallback to category type if not sent
  });

  logger.info(`Product created: ${newProduct.name} [ID: ${newProduct._id}]`);
  return newProduct;
};

/**
 * Get All Items (With Filters, Pagination & Stats)
 */
export const getAllProducts = async (queryParams) => {
  const { 
    page, 
    limit, 
    search, 
    type,       // 'recyclable', 'junk', 'store'
    stockStatus,// 'in_stock', 'out_of_stock'
    sortBy, 
  } = queryParams;

  const { pageSize, skip, pageNumber } = getPagination(page, limit);

  const query = buildProductQuery({search,type,stockStatus})

  const sort = getCategorySortOption(sortBy);

  const [products, totalCount, recyclableCount, junkCount, storeCount] = await Promise.all([
    Product.find(query)
      .populate("categoryId", "name type") // Populate category name for the table
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

/**
 * Update Product
 */
export const updateProduct = async (productId, updateData) => {
  const product = await Product.findByIdAndUpdate(productId, updateData, { new: true });
  
  if (!product) {
    throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Item not found.");
  }
  
  logger.info(`Product updated: ${product.name} [ID: ${productId}]`);
  return product;
};

/**
 * Toggle Product Status
 */
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

/**
 * Delete Product (Soft Delete)
 */
export const deleteProduct = async (productId) => {
    // We prefer Soft Delete (isDeleted: true) over hard delete to keep history
    const product = await Product.findByIdAndUpdate(productId, { isDeleted: true });
    
    if (!product) {
        throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Item not found.");
    }

    logger.info(`Product soft-deleted: ${product.name} [ID: ${productId}]`);
    return { message: "Item deleted successfully" };
};