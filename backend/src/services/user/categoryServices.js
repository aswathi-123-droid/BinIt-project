import Category from "../../models/category.model.js";

export const getActiveCategories = async () => {
  const categories = await Category.aggregate([
    {
      $match: { isActive: true },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "categoryId",
        as: "products",
      },
    },
    {
      $addFields: {
        itemCount: { $size: "$products" },
      },
    },
    {
      $match: { itemCount: { $gt: 0 } },
    },
    {
      $project: { products: 0, __v: 0 },
    },
  ]);
  return categories;
};
