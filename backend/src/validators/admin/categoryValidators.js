import Joi from "joi";

// --- 1. Reusable Components ---

// Validation for the nested "Offer" object
const offerSchema = Joi.object({
  isActive: Joi.boolean().default(false).messages({
    "boolean.base": "Offer status must be true or false",
  }),

  // If Offer is Active, Title is required
  title: Joi.string().trim().when("isActive", {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional().allow(""),
  }).messages({
    "any.required": "Offer title is required when offer is active",
  }),

  description: Joi.string().trim().allow("").optional(),

  // Discount Type: required if active
  discountType: Joi.string().valid("flat", "percent").when("isActive", {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional().allow(null, ""),
  }),

  // Value (The discount amount): Logic depends on type
  value: Joi.number().min(0).when("isActive", {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional().allow(null),
  })
  // Specific check: If type is 'percent', value cannot exceed 100
  .when("discountType", {
    is: "percent",
    then: Joi.number().max(100).messages({
      "number.max": "Percentage discount cannot exceed 100%",
    }),
  }),

  // Logic: If discount is FLAT, you usually need a Minimum Transaction Value
  minTransactionalValue: Joi.number().min(0).default(0).when("discountType", {
    is: "flat",
    then: Joi.required(),
  }),

  // Logic: If discount is PERCENT, you usually need a Maximum Cap (using your field 'minRedeemableAmount')
  // Note: Assuming 'minRedeemableAmount' acts as a threshold or cap.
  minRedeemableAmount: Joi.number().min(0).default(0),

  startDate: Joi.date().iso().allow(null),
  
  // Expiry Date must be AFTER Start Date
  expiryDate: Joi.date().iso().min(Joi.ref("startDate")).allow(null).messages({
    "date.min": "Expiry date must be after the start date",
  }),
});

// --- 2. Base Category Schema ---
const categoryBaseSchema = {
  name: Joi.string().trim().min(3).max(50).messages({
    "string.empty": "Category name is required",
    "string.min": "Category name must be at least 3 characters",
    "string.max": "Category name cannot exceed 50 characters",
  }),

  // Enum validation matching your Mongoose model
  type: Joi.string().valid("recyclable", "junk", "store").messages({
    "any.only": "Type must be either 'recyclable' or 'junk'",
  }),

  description: Joi.string().trim().allow("").max(500),
  
  image: Joi.string().allow("").messages({
    "string.base": "Image must be a valid string path/url",
  }),

  isActive: Joi.boolean().default(true),

  // Validating the nested object
  offer: offerSchema.default({}),
};

// --- 3. Create Schema (Strict) ---
export const createCategorySchema = Joi.object({
  ...categoryBaseSchema,
  
  // Override: Name and Type are STRICTLY required for creation
  name: categoryBaseSchema.name.required(),
  type: categoryBaseSchema.type.required(),
});

// --- 4. Update Schema (Flexible) ---
export const updateCategorySchema = Joi.object({
  ...categoryBaseSchema,
  
  // In updates, everything is optional. 
  // Joi handles "if provided, it must be valid" automatically.
}).min(1).messages({
  "object.min": "You must provide at least one field to update",
});

// --- 5. Validation Options ---
export const validationOptions = {
  abortEarly: false, // Return ALL errors, not just the first one
  allowUnknown: true, // Allow fields like _id to pass through safely
  stripUnknown: true, // Remove fields that are NOT in the schema (security)
};