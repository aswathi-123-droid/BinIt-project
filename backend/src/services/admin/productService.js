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
    Product.countDocuments(query),
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


export const createProductOffer = async (productId, offerData) => {
    const { 
        title, 
        description, 
        discountType, 
        value, 
        minTransactionalValue, 
        maxRedeemableAmount, 
        startDate, 
        expiryDate, 
        isActive 
    } = offerData;
    logger.info(`Service: Initiating create offer for product [ID: ${productId}]`);
    const product = await Product.findById(productId);
    
    if (!product) {
        logger.warn(`Service: Create offer failed. Product not found [ID: ${productId}]`);
        throw new AppError(
            STATUS_CODES.NOT_FOUND,
            "NOT_FOUND",
            "Product not found"
        );
    }
    if (product.type !== 'store') {
        logger.warn(`Service: Create offer rejected. Product is not a store item [ID: ${productId}, Type: ${product.type}]`);
        throw new AppError(
            STATUS_CODES.BAD_REQUEST,
            "INVALID_ACTION",
            "Discount offers can only be applied to 'store' items."
        );
    }

    const start = new Date(startDate);
    const expiry = new Date(expiryDate);
    
    if (start >= expiry) {
        throw new AppError(
            STATUS_CODES.BAD_REQUEST,
            "INVALID_DATE",
            "Expiry date must be after the start date"
        );
    }

     if(offerData.discountType === "flat"){
      if (product.price < offerData.value) {
        throw new AppError(
            STATUS_CODES.BAD_REQUEST,
            "INVALID_VALUE",
            "Discount value cannot be greater than product price"
        );
      }
    }else if(offerData.discountType === "percent"){
      if(offerData.value>=100){
        throw new AppError(
            STATUS_CODES.BAD_REQUEST,
            "INVALID_VALUE",
            "Discount percentage cannot be greater than or equal to 100"
        );
      }
    }
    const newOffer = {
        title,
        description: description || "",
        discountType,
        value,
        minTransactionalValue: minTransactionalValue || 0,
        maxRedeemableAmount: maxRedeemableAmount || null,
        startDate: start,
        expiryDate: expiry,
        isActive: isActive !== undefined ? isActive : true
    };
    product.offer = newOffer;
    await product.save();
    logger.info(`Service: Offer created successfully for product: ${product.name} [Offer: ${title}]`);
    return product;
};

export const updateProductOffer = async (productId, offerData) => {
    logger.info(`Service: Initiating update offer for product [ID: ${productId}]`);
    const product = await Product.findById(productId);
    if (!product) {
        logger.warn(`Service: Update offer failed. Product not found [ID: ${productId}]`);
        throw new AppError(
            STATUS_CODES.NOT_FOUND,
            "PRODUCT_NOT_FOUND",
            "The product with the specified ID could not be found."
        );
    }
    if (product.type !== 'store') {
        throw new AppError(
            STATUS_CODES.BAD_REQUEST,
            "INVALID_ACTION",
            "Discount offers can only be applied to 'store' items."
        );
    }
    
    console.log(offerData.discountType,"viii")
    if(offerData.discountType === "flat"){
      if (product.price < offerData.value) {
        throw new AppError(
            STATUS_CODES.BAD_REQUEST,
            "INVALID_VALUE",
            "Discount value cannot be greater than product price"
        );
      }
    }else if(offerData.discountType === "percent"){
      if(offerData.value>=100){
        throw new AppError(
            STATUS_CODES.BAD_REQUEST,
            "INVALID_VALUE",
            "Discount percentage cannot be greater than or equal to 100"
        );
      }
    }

    product.offer = {
        isActive: offerData.isActive !== undefined ? offerData.isActive : true,
        title: offerData.title,
        description: offerData.description || "",
        discountType: offerData.discountType,
        value: offerData.value,
        minTransactionalValue: offerData.minTransactionalValue || 0,
        maxRedeemableAmount: offerData.maxRedeemableAmount || 0, 
        startDate: offerData.startDate,
        expiryDate: offerData.expiryDate
    };
    const updatedProduct = await product.save();
    
    logger.info(`Service: Offer updated successfully for product '${product.name}'`);
    
    return updatedProduct;
};