import Joi from "joi";


// 1. Create Schema: Must match Mongoose exactly
const addressSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  phone: Joi.string().pattern(/^(?:\+91)?[6-9]\d{9}$/).required(),
  type: Joi.string().valid("Home", "Work", "Other").required(),
  flat: Joi.string().trim().required(),
  street: Joi.string().trim().required(),
  locality: Joi.string().trim().required(),
  city: Joi.string().trim().min(2).required(),
  state: Joi.string().trim().min(2).required(),
  pincode: Joi.string().pattern(/^\d{6}$/).required(),
  isDefault: Joi.boolean().default(false),
});

// 2. Edit Schema: All fields are optional, but matches the same naming convention
const editAddressSchema = Joi.object({
  _id: Joi.string().optional(),
  userId: Joi.any().strip(),
  name: Joi.string().trim().min(2).max(50).optional(),
  phone: Joi.string().pattern(/^(?:\+91)?[6-9]\d{9}$/).optional(),
  type: Joi.string().valid("Home", "Work", "Other").optional(),
  flat: Joi.string().trim().optional(),
  street: Joi.string().trim().optional(),
  locality: Joi.string().trim().optional(),
  city: Joi.string().trim().min(2).optional(),
  state: Joi.string().trim().min(2).optional(),
  pincode: Joi.string().pattern(/^\d{6}$/).optional(),
  isDefault: Joi.boolean().optional(),
}).min(1);

// Middleware for Create
export const validateCreateAddress = (req, res, next) => {
  const { error } = addressSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  next();
};

// Middleware for Edit
export const validateEditAddress = (req, res, next) => {
  const { error } = editAddressSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  next();
};

