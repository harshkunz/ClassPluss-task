import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import { signToken } from "../utils/jwt.js";
import { getGoogleAuthUrl, getGoogleProfileFromCode, verifyGoogleIdToken } from "../utils/google.js";

function clientOrigin() {
  return process.env.CLIENT_ORIGIN || "http://localhost:5173";
}

function safeUser(user) {
  return {
    _id: user._id,
    name: user.name || "",
    email: user.email || "",
    profileImageUrl: user.profileImageUrl || "",
    provider: user.provider,
    isPremium: Boolean(user.isPremium),
    currentPlan: user.currentPlan || "free",
    role: user.role || "user",
  };
}

function sendAuthResponse(res, user, statusCode = 200) {
  return res.status(statusCode).json({
    token: signToken(user._id),
    user: safeUser(user),
  });
}

async function upsertGoogleUser(profile) {
  const email = profile.email?.toLowerCase();
  const providerId = profile.sub || email || `google-${crypto.randomUUID()}`;

  let user = await User.findOne({
    $or: [{ provider: "google", providerId }, ...(email ? [{ email }] : [])],
  });

  if (!user) {
    user = await User.create({
      provider: "google",
      providerId,
      name: profile.name || "Google User",
      email,
      profileImageUrl: profile.picture || "",
    });
    return user;
  }

  user.provider = "google";
  user.providerId = providerId;
  user.name = profile.name || user.name;
  user.email = email || user.email;
  user.profileImageUrl = profile.picture || user.profileImageUrl;
  await user.save();
  return user;
}

export async function googleStart(req, res, next) {
  try {
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI) {
      return res.redirect(getGoogleAuthUrl());
    }

    const user = await upsertGoogleUser({
      sub: `demo-google-${crypto.randomUUID()}`,
      email: "google@classplus.local",
      name: "Google User",
      picture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    });

    const token = signToken(user._id);
    return res.redirect(`${clientOrigin()}/?token=${encodeURIComponent(token)}`);
  } catch (error) {
    return next(error);
  }
}

export async function googleCallback(req, res, next) {
  try {
    let profile = null;

    if (req.query.id_token) {
      profile = await verifyGoogleIdToken(req.query.id_token);
    } else if (req.query.code) {
      profile = await getGoogleProfileFromCode(req.query.code);
    } else {
      profile = {
        sub: `demo-google-${crypto.randomUUID()}`,
        email: "google@classplus.local",
        name: "Google User",
        picture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      };
    }

    const user = await upsertGoogleUser(profile);
    const token = signToken(user._id);
    return res.redirect(`${clientOrigin()}/?token=${encodeURIComponent(token)}`);
  } catch (error) {
    return next(error);
  }
}

export async function emailRegister(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      provider: "email",
      name,
      email: normalizedEmail,
      passwordHash,
    });

    return sendAuthResponse(res, user, 201);
  } catch (error) {
    return next(error);
  }
}

export async function emailLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return sendAuthResponse(res, user);
  } catch (error) {
    return next(error);
  }
}

export async function guestLogin(req, res, next) {
  try {
    const name = String(req.body?.name || "Guest User").trim() || "Guest User";
    const user = await User.create({
      provider: "guest",
      providerId: `guest-${crypto.randomUUID()}`,
      name,
    });

    return sendAuthResponse(res, user, 201);
  } catch (error) {
    return next(error);
  }
}

export async function me(req, res) {
  return res.status(200).json({ user: safeUser(req.user) });
}

export async function updateProfile(req, res, next) {
  try {
    const { name, profileImageUrl } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (typeof name === "string" && name.trim()) {
      user.name = name.trim();
    }

    if (typeof profileImageUrl === "string" && profileImageUrl.trim()) {
      user.profileImageUrl = profileImageUrl.trim();
    }

    await user.save();
    return res.status(200).json({ user: safeUser(user) });
  } catch (error) {
    return next(error);
  }
}
