import User from "../../models/user.model.js";
import { AppError, buildUserQuery, getPagination, getSortOption } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";


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

const today = new Date();
const startOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1, 0, 0, 0)); 
  const [users, totalUsers,activeUsers,totalUsersCount,userThisMonth] = await Promise.all([
    User.find(query)
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .select("name email phone isBlocked createdAt"),
    User.countDocuments(query),
    User.countDocuments({isBlocked:false}),
    User.countDocuments(),
    User.countDocuments({createdAt: { $gte: startOfMonth }})
  ]);

  

  return {
    users,
    pagination: {
        totalUsers,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalUsers/pageSize),
        pageSize,
    },
    userStats:{
      totalUsersCount,
      activeUsers,
      userThisMonth
    }
  }
}

export const getUserStats = async(userId,isBlocked) => {
  console.log(userId,isBlocked)
  const user = await User.findByIdAndUpdate(
    userId,
    {isBlocked},
    {new: true}
  )

    if (!user) {
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "USER_NOT_FOUND",
      "The user with the specified ID could not be found."
    );
  }

  return user;
}