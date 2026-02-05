import Category from "../models/category.model.js";
import { STATUS_CODES } from "./constants.js";

export class AppError extends Error {
  constructor(
    status = STATUS_CODES.INTERNAL_SERVER_ERROR,
    code = "INTERNAL_SERVER_ERROR",
    message = "An unexpected error occurred. We are investigating the issue."
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.isOperational = true;
  }
}

export const sendResponse = (res, data, statusCode =STATUS_CODES.OK) => {
  res.status(statusCode).json({
    success: true,
    ...data
  });
};

export const buildUserQuery = ({status,search}) => {
  const query = {};
  
  if(status){
    if(status === "blocked") {
      query.isBlocked = true;
    }else if (status === "active") {
      query.isBlocked = false
    }
  }

  if(search && search.trim() !== ""){
    const searchRegex = { $regex: search.trim() , $options: "i"}

    query.$or = [
      { name: searchRegex },
      { email: searchRegex }
    ]
  }

  return query
}

export const buildCategoryQuery = ({ status, search, type }) => {
  const query = { isDeleted: false };
  if (status) {
    query.isActive = status === "true";
  }

  if (search && search.trim() !== "") {
    query.name = { $regex: search.trim(), $options: "i" };
  }

  if (type && type.trim() !== "") {
    query.type = type.toLowerCase(); 
  }
   return query;
};

export const buildProductQuery = ({search,type,stockStatus,isActive,categoryId}) => {
  const query = {}

  if(search){
    query.name = {$regex: search.trim(),$options: "i"}
  }
  
  if (type && type.trim() !== "") {
    query.type = type.toLowerCase(); 
  }
  
  if(isActive){
    query.isActive = true
  }

  if(categoryId){
    query.categoryId =categoryId
  }

  if (stockStatus) {
    if (stockStatus === 'in_stock') {
      // Show anything with stock > 0 (Store items) OR Service items (infinite)
      query.$or = [
          { stock: { $gt: 0 } },
          { type: { $ne: 'store' } } // Service items are technically "in stock"
      ];
    } else if (stockStatus === 'out_of_stock') {
      // Strict: Only show Store items that have 0 stock
      query.type = 'store';
      query.stock = { $lte: 0 };
    }
  }

  // if(category){
  //   const categoryDoc = await Category.findOne({slug:category}).select("_id");

  //   if(categoryDoc){
  //     query.category = categoryDoc._id
  //   }else{
  //     query.category = null;
  //   }
  // }

  // if(type){
  //   const matchingCategories = await Category.find({ type: type }).select("_id");
  //   const categoryIds = matchingCategories.map(cat => cat._id);

  //   if(query.category){
  //     const isTypeMatch = categoryIds.some(id => id.toString() === query.category.toString())
  //     if (!isTypeMatch) query.category = null;
  //   }else{
  //     query.category = { $in: categoryIds };
  //   }
  // }
   return query;
}

export const getPagination = (page= 1, limit= 8, maxLimit= 25) => {
  const pageNumber= parseInt(page);
  
  const pageSize= Math.min(parseInt(limit),maxLimit);

  const skip = (pageNumber-1) * pageSize;

  return {pageNumber,pageSize,skip};
}

export const getSortOption = (sortBy = "createdAt", sortOrder = "desc") => ({
  [sortBy]: sortOrder === "asc" ? 1 : -1,
});

export const getCategorySortOption = (sortBy = "newest") => {
  switch (sortBy) {
    case "newest":
      return { createdAt: -1 };
    case "oldest":
      return { createdAt: 1 };
    case "name_asc":
      return { name: 1 };
    case "name_desc":
      return { name: -1 };
    case "items_asc":
      return { itemCount: 1 }; 
    case "items_desc":
      return { itemCount: -1 };
    case "price_asc":
      return { price: 1};
    case "price_desc":
      return { price: -1}
    default:
      return { createdAt: -1 };
  }
};


