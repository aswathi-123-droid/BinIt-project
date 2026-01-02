import logger from "../../config/logger.js";
import { STATUS_CODES } from "../../../src/utils/constants.js";

export const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });

  res.status(err.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
