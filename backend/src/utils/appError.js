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

export const getPagination = (page= 1, limit= 10, maxLimit= 25) => {
  const pageNumber= parseInt(page);
  const pageSize= Math.min(parseInt(limit),maxLimit);
  const skip = (pageNumber-1) * pageSize;

  return (pageNumber,pageSize,skip);
}

export const getSortOption = (sortBy = "createdAt", sortOrder = "desc") => ({
  [sortBy]: sortOrder === "asc" ? 1 : -1,
});
