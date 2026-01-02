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
