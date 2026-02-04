import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string().required().trim().min(2).messages({
    "any.required": "Item name is required",
    "string.min": "Item name must be at least 2 characters"
  }),
  category: Joi.string().required().messages({
    "any.required": "Category is required",
    "string.empty": "Please select a valid category"
  }),
  price: Joi.number().required().min(0).messages({
    "any.required": "Base Rate/Price is required",
    "number.min": "Price cannot be negative"
  }),
  unit: Joi.string().valid("kg", "unit", "bag").required().messages({
    "any.only": "Unit must be either 'kg', 'unit', or 'bag'"
  }),
  isActive: Joi.boolean().optional(),
  inStock: Joi.boolean().optional(),
  isEstimationEnabled: Joi.boolean().optional(),
  // Image validation is handled by Multer, but we allow it in body for updates
  image: Joi.string().optional().allow(""), 
  hasVariations: Joi.boolean().optional(),
  variations: Joi.alternatives().try(
      Joi.string(), // Allow stringified JSON
      Joi.array().items(
          Joi.object({
              name: Joi.string().required(),
              price: Joi.number().required().min(0)
          })
      )
  ).optional()
});

export const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(2).optional(),
  category: Joi.string().optional(),
  price: Joi.number().min(0).optional(),
  unit: Joi.string().valid("kg", "unit", "bag").optional(),
  isActive: Joi.boolean().optional(),
  inStock: Joi.boolean().optional(),
  isEstimationEnabled: Joi.boolean().optional(),
  image: Joi.string().optional().allow(""),
  hasVariations: Joi.boolean().optional(),
  variations: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(
          Joi.object({
              name: Joi.string().required(),
              price: Joi.number().required().min(0),
              _id: Joi.string().optional() // Allow ID for updates
          })
      )
  ).optional()
});