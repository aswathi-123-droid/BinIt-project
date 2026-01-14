import User from "../../models/user.model.js";
import { buildUserQuery, getPagination, getSortOption } from "../../utils/appError.js";


export const getAllUsers = async(queryParams) => {
  const { 
    page, 
    limit, 
    status, 
    search, 
    sortBy = "createdAt", 
    sortOrder = "desc" 
  } = queryParams;

  const query = buildUserQuery({status,search});

  const {pageSize,skip,pageNumber} = getPagination(page,limit);

  const sort = getSortOption(sortBy,sortOrder);

  const [users, totalUsers] = await Promise.all([
    User.find(query)
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .select("name email phone isBlocked createdAt").
    User.countDocuments(query)
  ]);

  return {
    users,
    pagination: {
        totalUsers,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalUsers/pageSize),
        pageSize,
    }
  }
}