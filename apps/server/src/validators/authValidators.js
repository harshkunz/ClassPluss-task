import { body, validationResult } from "express-validator";

const validateEmailRegister = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("name").optional().isString().trim(),
];

const validateEmailLogin = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isString().withMessage("Password is required"),
];

const validateGoogleAuth = [
  body("idToken").isString().withMessage("Google idToken is required"),
];

const validateGuestAuth = [
  body("name").optional().isString().trim(),
];

const validateProfileUpdate = [
  body("name").optional().isString().trim(),
  body("profileImageUrl").optional().isString().trim(),
];

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  return next();
}

export {
  validateEmailRegister,
  validateEmailLogin,
  validateGoogleAuth,
  validateGuestAuth,
  validateProfileUpdate,
  handleValidation,
};
