import Joi from "joi";

const offerSchema = Joi.object({
  isActive: Joi.boolean().default(false).messages({
    "boolean.base": "Offer status must be true or false",
  }),

  title: Joi.string()
    .trim()
    .when("isActive", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional().allow(""),
    })
    .messages({
      "any.required": "Offer title is required when offer is active",
    }),

  description: Joi.string().trim().allow("").optional(),

  discountType: Joi.string()
    .valid("flat", "percent")
    .when("isActive", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional().allow(null, ""),
    }),

  value: Joi.number()
    .min(0)
    .when("isActive", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional().allow(null),
    })
    .when("discountType", {
      is: "percent",
      then: Joi.number().max(100).messages({
        "number.max": "Percentage discount cannot exceed 100%",
      }),
    }),
  minTransactionalValue: Joi.number().min(0).default(0).when("discountType", {
    is: "flat",
    then: Joi.required(),
  }),

  minRedeemableAmount: Joi.number().min(0).default(0),

  startDate: Joi.date().iso().allow(null),

  expiryDate: Joi.date().iso().min(Joi.ref("startDate")).allow(null).messages({
    "date.min": "Expiry date must be after the start date",
  }),
});

const categoryBaseSchema = {
  name: Joi.string().trim().min(3).max(50).messages({
    "string.empty": "Category name is required",
    "string.min": "Category name must be at least 3 characters",
    "string.max": "Category name cannot exceed 50 characters",
  }),

  type: Joi.string().valid("recyclable", "junk", "store").messages({
    "any.only": "Type must be either 'recyclable' or 'junk'",
  }),

  description: Joi.string().trim().allow("").max(500),

  image: Joi.string().allow("").messages({
    "string.base": "Image must be a valid string path/url",
  }),

  isActive: Joi.boolean().truthy("true").falsy("false").default(true),

  offer: offerSchema.default({}),
};

export const createCategorySchema = Joi.object({
  ...categoryBaseSchema,

  name: categoryBaseSchema.name.required(),
  type: categoryBaseSchema.type.required(),
});

export const updateCategorySchema = Joi.object({
  ...categoryBaseSchema,
})
  .min(1)
  .messages({
    "object.min": "You must provide at least one field to update",
  });

export const validationOptions = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true,
};
