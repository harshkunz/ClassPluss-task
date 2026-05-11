import express from "express";
import {
  registerEmail,
  loginEmail,
  authGoogle,
  authGuest,
  updateProfile,
  me,
} from "../controllers/authController.js";
import {
  validateEmailRegister,
  validateEmailLogin,
  validateGoogleAuth,
  validateGuestAuth,
  validateProfileUpdate,
  handleValidation,
} from "../validators/authValidators.js";
import { requireAuth } from "../middleware/auth.js";

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

export default router;
