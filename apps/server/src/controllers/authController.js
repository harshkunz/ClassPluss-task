import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signToken } from "../utils/jwt.js";
import { getGoogleAuthUrl, getGoogleProfileFromCode } from "../utils/google.js";

export async function googleStart(req, res, next) {
  try {
    const url = getGoogleAuthUrl();
    res.redirect(url);
  } catch (error) {
    next(error);
  }
}

export async function googleCallback(req, res, next) {
  try {
    let profile = null;

    if (req.query.code) {
      profile = await getGoogleProfileFromCode(req.query.code);
    } else {
      profile = {
        sub: "demo-user",
        email: "demo@classplus.local",
        name: "Demo User",
        picture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      };
    }

    let user = await User.findOne({ email: profile.email });
    if (!user) {
      user = await User.create({
        provider: "google",
        name: profile.name,
        email: profile.email,
        profileImageUrl: profile.picture || "",
      });
    }

    const token = signToken(user._id);
    const redirectUrl = `${process.env.CLIENT_ORIGIN || "http://localhost:5173"}/?token=${encodeURIComponent(token)}`;
    res.redirect(redirectUrl);
  } catch (error) {
    next(error);
  }
}

export async function emailRegister(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      provider: "email",
      name,
      email,
      passwordHash: hash,
    });

    res.status(201).json({
      token: signToken(user._id),
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
}

export async function emailLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      token: signToken(user._id),
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
}

export async function guestLogin(req, res, next) {
  try {
    const name = req.body?.name || "Guest";
    const user = await User.create({
      provider: "guest",
      name,
    });

    res.status(201).json({
      token: signToken(user._id),
      user: { _id: user._id, name: user.name },
    });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res) {
  res.json({
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      profileImageUrl: req.user.profileImageUrl,
    },
  });
}

export async function updateProfile(req, res, next) {
  try {
    const { name, profileImageUrl } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (profileImageUrl) user.profileImageUrl = profileImageUrl;

    await user.save();
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
      },
    });
  } catch (error) {
    next(error);
  }
}
