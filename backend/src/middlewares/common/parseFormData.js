import logger from "../../config/logger.js";

export const parseFormData = (req, res, next) => {
  if (req.body.offer && typeof req.body.offer === 'string') {
    try {
      req.body.offer = JSON.parse(req.body.offer);
    } catch (e) {
      logger.warn(`Middleware: Failed to parse 'offer' JSON from FormData. Error: ${e.message}`);
    }
  }

  if (req.body.isActive !== undefined) {
    if (req.body.isActive === 'true') req.body.isActive = true;
    if (req.body.isActive === 'false') req.body.isActive = false;
  }
  next();
};