import Joi from "joi"

export const registerSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.base": "Name must be a string",
      "string.empty": "Name cannot be empty",
      "string.min": "Name must be at least 3 characters",
      "any.required": "Name is required",
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
    }),

  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(
      new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])")
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain uppercase, lowercase, number and special character",
      "string.min": "Password must be at least 8 characters",
      "any.required": "Password is required",
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Passwords do not match",
      "any.required": "Confirm password is required",
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
    }),

  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(
      new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])")
    )
    .required()
    .messages({
      "string.pattern.base":
      "Password must contain uppercase, lowercase, number and special character",
      "string.min": "Password must be at least 8 characters",
      "any.required": "Password is required",
    })
})

export const verifyOTPSchema = Joi.object({
  email: Joi.string()
    .email()
    .required(),

  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/) 
    .required()
    .messages({
      "string.length": "OTP must be exactly 6 digits",
      "string.pattern.base": "OTP must contain only numbers",
      "any.required": "OTP is required"
    }),
});

export const resendOtpSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

// export const resetPasswordSchema = Joi.object({
//   email: Joi.string().email().required(),
//   otp: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
//   newPassword: Joi.string()
//     .min(8)
//     .max(30)
//     .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
//     .required()
// });

export const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required(),
    
  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(
      new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])")
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain uppercase, lowercase, number and special character",
      "string.min": "Password must be at least 8 characters",
      "any.required": "Password is required",
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Passwords do not match",
      "any.required": "Confirm password is required",
    }),
});

