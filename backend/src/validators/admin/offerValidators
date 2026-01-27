import Joi from "joi";

export const offerSchema = Joi.object({
    title: Joi.string().required().trim().min(3).messages({
        "any.required": "Offer title is required",
        "string.min": "Title must be at least 3 characters"
    }),
    discountType: Joi.string().valid("flat", "percent").required(),
    value: Joi.number().required().min(1).messages({
        "number.min": "Value must be greater than 0"
    }),
    startDate: Joi.date().required(),
    expiryDate: Joi.date().required().greater(Joi.ref('startDate')).messages({
        "date.greater": "Expiry date must be after start date"
    }),
    maxRedeemablePrice: Joi.number().allow(null, "").optional(),
    minTransactionalValue: Joi.number().allow(null, "").optional(),
    description: Joi.string().allow("", null).optional(),
    isActive: Joi.boolean().optional()
});