import {body , validationResult } from "express-validator"

export const validate = (req, res, next) => {
    const errors = validationResult(req)

    if (errors.isEmpty()) {
       return next()
    }

    res.status(400).json({
      errors: errors.array()
    });
}

export const registerValidation = [
  body("username").isString().withMessage("username should be a String"),
  body("email").isEmail().withMessage("email should be a string for varification"),
  body("password").custom((value) => {
    if (!value || value.length < 6) {
      throw new Error("password should be at least 6 characters long");
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).+$/;
    if (!passwordRegex.test(value)) {
      throw new Error(
        "password should contain at least one uppercase letter and one number",
      );
    }
    return true;
  }),

  validate,
];