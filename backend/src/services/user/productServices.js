import Category from "../../models/category.model.js";
import Product from "../../models/product.model.js";
import { buildProductQuery, getCategorySortOption, getPagination, getSortOption } from "../../utils/appError.js";


export const getAllProducts = async(queryParams) => {
  console.log(queryParams,"piiii")
 const {
    page = 1,
    limit = 8,
    search = "",
    categoryId = "",
    type = "",
    sortBy = "createdAt",
    isActive
 } = queryParams;


 const filter = await buildProductQuery({search,type,isActive,categoryId});

 const {skip, pageSize, pageNumber} = getPagination(page,limit);

 const sort = getCategorySortOption(sortBy)

 const [products, totalProducts, currentCategory] =await  Promise.all([
   Product.find(filter)
   .populate("categoryId","name slug type image isActive")
   .sort(sort)
   .skip(skip)
   .limit(pageSize),

   Product.countDocuments(filter),

   categoryId? Category.findById(categoryId).select("name") : null
 ])

 return {
   items: products,
   categoryTitle: currentCategory ? currentCategory.name : "All Items",
   pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalProducts/pageSize),
      totalItems: totalProducts,
      limit: pageSize
   }
 }
}