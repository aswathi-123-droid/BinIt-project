import * as inventoryService from "../../services/admin/productService.js";
import { AppError, sendResponse } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";
import logger from "../../config/logger.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js"; // Assuming you have this
import Product from "../../models/product.model.js";

/**
 * Get All Inventory Items
 */
export const getAllInventoryController = async (req, res) => {
  console.log(req.query,"Looookk")
  const result = await inventoryService.getAllProducts(req.query);
  sendResponse(res, result, STATUS_CODES.OK);
};

/**
 * Create New Item
 */
export const createInventoryController = async (req, res) => {
  logger.info(`Controller: Creating inventory item by Admin [${req.admin?._id}]`);
  
  let imageUrls = [];
  if (req.files && req.files.length>0) {
    const uploadPromises = req.files.map(file => uploadToCloudinary(file.path));
    imageUrls = await Promise.all(uploadPromises)
  }else if (req.body.image) {
    // Handle case where user sends existing URL strings (rare for create, common for update)
    imageUrls = Array.isArray(req.body.image) ? req.body.image : [req.body.image];
  }

  let parsedVariations = [];
  if (req.body.variations) {
      try {
          // If it comes as a string (from FormData), parse it. If it's already object, leave it.
          parsedVariations = typeof req.body.variations === 'string' 
              ? JSON.parse(req.body.variations) 
              : req.body.variations;
      } catch (error) {
          logger.error("Error parsing variations JSON", error);
          // Optional: Return 400 error here if parsing fails
      }
  }

  const productData = {
    ...req.body,
    image: imageUrls,
    variations: parsedVariations
  };

  const newProduct = await inventoryService.createProduct(productData);

  sendResponse(res, { 
    message: "Item created successfully", 
    data: newProduct 
  }, STATUS_CODES.CREATED);
};

/**
 * Update Item
 */
export const updateInventoryController = async (req, res) => {
  const { id } = req.params;
  
  const existingProducts = await Product.findById(id)
  if (!existingProducts) {
      throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Item not found.");
  }
  
  let finalImages = existingProducts.image;
  let imageUrls = []
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(file => uploadToCloudinary(file.path));
    imageUrls = await Promise.all(uploadPromises);
    finalImages = [...existingProducts.image,...imageUrls]
  }
  
  let parsedVariations = undefined;
  if (req.body.variations) {
      try {
          parsedVariations = typeof req.body.variations === 'string' 
              ? JSON.parse(req.body.variations) 
              : req.body.variations;
      } catch (error) {
          logger.error("Error parsing variations JSON", error);
      }
  }

  const updateData = {
    ...req.body,
    ...(imageUrls.length>0 && { image: finalImages }), // Only update image if a new one is provided
    ...(parsedVariations !== undefined && { variations: parsedVariations })
  };

  const updatedProduct = await inventoryService.updateProduct(id, updateData);

  sendResponse(res, { 
    message: "Item updated successfully", 
    data: updatedProduct 
  }, STATUS_CODES.OK);
};

/**
 * Toggle Status
 */
export const toggleInventoryStatusController = async (req, res) => {
  const { id } = req.params;
  const updatedProduct = await inventoryService.toggleProductStatus(id);

  sendResponse(res, {
    message: `Item ${updatedProduct.isActive ? 'activated' : 'deactivated'} successfully`,
    data: updatedProduct
  }, STATUS_CODES.OK);
};

/**
 * Delete Item
 */
export const deleteInventoryController = async (req, res) => {
    const { id } = req.params;
    await inventoryService.deleteProduct(id);
    
    sendResponse(res, { message: "Item deleted successfully" }, STATUS_CODES.OK);
};