import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  emailLogin,
  emailRegister,
  guestLogin,
  googleCallback,
  googleStart,
  me,
  updateProfile,
} from "../controllers/authController.js";

const router = express.Router();

router.get("/google/start", googleStart);
router.get("/google/callback", googleCallback);
router.post("/email/register", emailRegister);
router.post("/email/login", emailLogin);
router.post("/guest", guestLogin);
router.get("/me", requireAuth, me);
router.put("/profile", requireAuth, updateProfile);

export default router;
