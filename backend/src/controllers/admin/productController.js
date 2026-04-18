import * as inventoryService from "../../services/admin/productService.js";
import { AppError, sendResponse } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";
import logger from "../../config/logger.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js"; 
import Product from "../../models/product.model.js";


export const getAllInventoryController = async (req, res) => {
  console.log(req.query,"Looookk")
  const result = await inventoryService.getAllProducts(req.query);
  sendResponse(res, result, STATUS_CODES.OK);
};


export const createInventoryController = async (req, res) => {
  logger.info(`Controller: Creating inventory item by Admin [${req.admin?._id}]`);
  console.log(req.files,"joyyyy")
  console.log(req.body.image,"image")
  let imageUrls = [];
  if (req.files && req.files.length>0) {
    const uploadPromises = req.files.map(file => uploadToCloudinary(file.path));
    imageUrls = await Promise.all(uploadPromises)
  }else if (req.body.image) {
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
      }
  }
  
  let finalPrice = req.body.price;
  if (req.body.hasVariations === 'true' && parsedVariations.length > 0) {
    // Calculate lowest price if variations are present
    finalPrice = Math.min(...parsedVariations.map(v => Number(v.price)));
  }

 const productData = {
    ...req.body,
    price: finalPrice || 0, // Ensure it's a number, not an empty string
    image: imageUrls,
    variations: parsedVariations,
    // Ensure Booleans are actual booleans (FormData sends them as strings)
    hasVariations: req.body.hasVariations === 'true',
    isEstimationEnabled: req.body.isEstimationEnabled === 'true',
    isActive: req.body.isActive === 'true'
  };

  const newProduct = await inventoryService.createProduct(productData);

  sendResponse(res, { 
    message: "Item created successfully", 
    data: newProduct 
  }, STATUS_CODES.CREATED);
};

export const updateInventoryController = async (req, res) => {
  const { id } = req.params;
  
  let keptImages = [];
  if (req.body.existingImages) {
    keptImages = typeof req.body.existingImages === 'string' 
      ? JSON.parse(req.body.existingImages) 
      : req.body.existingImages;
  }

  let newImageUrls = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(file => uploadToCloudinary(file.path));
    newImageUrls = await Promise.all(uploadPromises);
  }

  const finalImages = [...keptImages, ...newImageUrls];
  
  let parsedVariations = [];
  if (req.body.variations) {
    try {
      parsedVariations = typeof req.body.variations === 'string'
        ? JSON.parse(req.body.variations)
        : req.body.variations;
    } catch (error) {
      parsedVariations = [];
    }
  }

    let price = req.body.price;
  if (req.body.hasVariations === 'true' && parsedVariations.length > 0) {
    const prices = parsedVariations.map(v => Number(v.price));
    price = Math.min(...prices);
  } else {
    price = req.body.price ? Number(req.body.price) : 0;
  }

  const updateData = {
   ...req.body,
    price: price,
    image: finalImages,
    variations: parsedVariations,
    // Convert FormData strings back to actual Booleans
    hasVariations: req.body.hasVariations === 'true',
    isEstimationEnabled: req.body.isEstimationEnabled === 'true',
    isActive: req.body.isActive === 'true'
  };

  const updatedProduct = await inventoryService.updateProduct(id, updateData);

  sendResponse(res, { 
    message: "Item updated successfully", 
    data: updatedProduct 
  }, STATUS_CODES.OK);
};


export const toggleInventoryStatusController = async (req, res) => {
  const { id } = req.params;
  const updatedProduct = await inventoryService.toggleProductStatus(id);

  sendResponse(res, {
    message: `Item ${updatedProduct.isActive ? 'activated' : 'deactivated'} successfully`,
    data: updatedProduct
  }, STATUS_CODES.OK);
};


export const deleteInventoryController = async (req, res) => {
    const { id } = req.params;
    await inventoryService.deleteProduct(id);
    
    sendResponse(res, { message: "Item deleted successfully" }, STATUS_CODES.OK);
};

export const createProductOfferController = async (req, res) => {
    const { productId } = req.params;
    const offerData = req.body;
    
    logger.info(`Controller: Received request to create offer for product ID: ${productId}`);
    
    const updatedProduct = await inventoryService.createProductOffer(productId, offerData);
    
    sendResponse(res, {
        success: true,
        message: "Product offer created successfully",
        product: updatedProduct
    }, STATUS_CODES.CREATED);
};

export const updateProductOfferController = async (req, res) => {
    const { productId } = req.params;
    const offerData = req.body;
    
    logger.info(`Controller: Received request to update offer for product ID: ${productId}`);
    
    const updatedProduct = await inventoryService.updateProductOffer(productId, offerData);
    
    sendResponse(res, {
        success: true,
        message: "Product offer updated successfully",
        product: updatedProduct
    }, STATUS_CODES.OK);
};