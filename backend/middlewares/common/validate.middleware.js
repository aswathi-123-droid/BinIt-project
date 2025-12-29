import { STATUS_CODES } from "../../utils/constants.js";
import { AppError } from "../../utils/appError.js";

export const validate = (schema) => {
  return (req, res, next) => {
    const options = {
      abortEarly: false,
      stripUnknown: true,
    };
    const { error, value } = schema.validate(req.body, options);

    if (error) {
     const errorMessage = error.details.map(d => d.message).join(", ");

     return next(new AppError(STATUS_CODES.BAD_REQUEST, "VALIDATION_ERROR",errorMessage))
    }

    req.body = value;
    next();
  };
};
