import { body, validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    success: false,
    message: errors.array()[0].msg,

    errors: errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    })),
  });
};

export const registerValidation = [

  body("username")
    .trim()
    .notEmpty()
    .withMessage("username is required")
    .isString()
    .withMessage("username should be a string")
    .isLength({ min: 3, max: 30 })
    .withMessage("username must be between 3 and 30 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("please enter a valid email")
    .normalizeEmail(),

  body("password")
    .custom((value) => {

      if (!value || value.length < 6) {
        throw new Error(
          "password should be at least 6 characters long"
        );
      }

      const passwordRegex = /^(?=.*[A-Z])(?=.*\d).+$/;

      if (!passwordRegex.test(value)) {
        throw new Error(
          "password should contain at least one uppercase letter and one number"
        );
      }

      return true;
    }),

  validate,
];

export const loginValidation = [

  body("loginId")
    .trim()
    .notEmpty()
    .withMessage("username or email is required")
    .isString()
    .withMessage("username and email must be string"),

  body("password")
    .custom((value) => {

      if (!value || value.length < 6) {
        throw new Error(
          "password should be at least 6 characters long"
        );
      }

      const passwordRegex = /^(?=.*[A-Z])(?=.*\d).+$/;

      if (!passwordRegex.test(value)) {
        throw new Error(
          "password should contain at least one uppercase letter and one number"
        );
      }

      return true;
    }),

  validate,
];

export const otpValidation = [

  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be exactly 6 digits")
    .isNumeric()
    .withMessage("OTP must contain only numbers"),

  validate,
];