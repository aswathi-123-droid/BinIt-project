import Category from "../../models/category.model.js";
import Product from "../../models/product.model.js";
import { buildProductQuery, getPagination, getSortOption } from "../../utils/appError.js";


export const getProducts = async(queryParams) => {
 const {
    page = 1,
    limit = 10,
    search = "",
    category = "",
    type = "",
    sortBy = "createdAt",
    sortOrder = "desc",
 } = queryParams;

 const filter = await buildProductQuery(queryParams);

 const {skip, pageSize, pageNumber} = getPagination(page,limit);

 const sort = getSortOption(sortBy,sortOrder);

 const [products, totalProducts, currentCategory] = Promise.all([
   Product.find(filter)
   .populate("category","name slug type image")
   .sort(sort)
   .skip(skip)
   .limit(pageSize),

   Product.countDocuments(filter),

   category? Category.findOne({slug:category}).select("name") : null
 ])

 return {
   products,
   categoryTitle: currentCategory ? currentCategory.name : "All Items",
   pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalProducts/pageSize),
      totalItems: totalProducts,
      limit: pageSize
   }
 }
}