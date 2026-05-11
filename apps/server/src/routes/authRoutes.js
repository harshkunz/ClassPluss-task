const express = require("express");
const {
  registerEmail,
  loginEmail,
  authGoogle,
  authGuest,
  updateProfile,
  me,
} = require("../controllers/authController");
const {
  validateEmailRegister,
  validateEmailLogin,
  validateGoogleAuth,
  validateGuestAuth,
  validateProfileUpdate,
  handleValidation,
} = require("../validators/authValidators");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post(
  "/email/register",
  validateEmailRegister,
  handleValidation,
  registerEmail
);
router.post(
  "/email/login",
  validateEmailLogin,
  handleValidation,
  loginEmail
);
router.post(
  "/google",
  validateGoogleAuth,
  handleValidation,
  authGoogle
);
router.post(
  "/guest",
  validateGuestAuth,
  handleValidation,
  authGuest
);
router.get("/me", requireAuth, me);
router.put(
  "/profile",
  requireAuth,
  validateProfileUpdate,
  handleValidation,
  updateProfile
);

module.exports = router;
