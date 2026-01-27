import logger from "../../config/logger.js";

export const parseFormData = (req, res, next) => {
  if (req.body.offer && typeof req.body.offer === 'string') {
    try {
      req.body.offer = JSON.parse(req.body.offer);
    } catch (e) {
      logger.warn(`Middleware: Failed to parse 'offer' JSON from FormData. Error: ${e.message}`);
    }
  }
  next();
};