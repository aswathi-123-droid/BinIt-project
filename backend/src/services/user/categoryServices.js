import Category from "../../models/category.model.js";

export const getActiveCategories = async()=> {
    const categories = await Category.aggregate([
    { 
      $match: { isActive: true } // Only active categories
    },
    {
      $lookup: {
        from: 'products',          // The collection name in MongoDB
        localField: '_id',
        foreignField: 'categoryId',
        as: 'products'
      }
    },
    {
      $addFields: {
        itemCount: { $size: '$products' } // Count the products
      }
    },
    { 
      $match: { itemCount: { $gt: 0 } } // ONLY keep categories with items > 0
    },
    { 
      $project: { products: 0, __v: 0 } // Clean up the response
    }
  ]);
  return categories
}