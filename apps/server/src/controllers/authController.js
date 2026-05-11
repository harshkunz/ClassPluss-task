const bcrypt = require("bcryptjs");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { signToken } = require("../utils/jwt");
const { verifyGoogleIdToken } = require("../utils/google");

function toUserResponse(user) {
  return {
    id: user.id,
    email: user.email || null,
    name: user.name || null,
    profileImageUrl: user.profileImageUrl || null,
    provider: user.provider,
  };
}

const registerEmail = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: "Email already in use" });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    email,
    passwordHash,
    provider: "email",
    name: name || null,
  });

  const token = signToken(user.id);
  return res.status(201).json({ token, user: toUserResponse(user) });
});

const loginEmail = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, provider: "email" }).select(
    "+passwordHash"
  );
  if (!user || !user.passwordHash) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signToken(user.id);
  return res.status(200).json({ token, user: toUserResponse(user) });
});

const authGoogle = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  const googleProfile = await verifyGoogleIdToken(idToken);

  let user = await User.findOne({ googleSub: googleProfile.sub });

  if (!user && googleProfile.email) {
    user = await User.findOne({ email: googleProfile.email });
    if (user && !user.googleSub) {
      user.googleSub = googleProfile.sub;
      await user.save();
    }
  }

  if (!user) {
    user = await User.create({
      email: googleProfile.email,
      provider: "google",
      googleSub: googleProfile.sub,
      name: googleProfile.name || null,
      profileImageUrl: googleProfile.picture || null,
    });
  }

  const token = signToken(user.id);
  return res.status(200).json({ token, user: toUserResponse(user) });
});

const authGuest = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const guestName = name || `Guest-${Math.floor(1000 + Math.random() * 9000)}`;

  const user = await User.create({
    provider: "guest",
    name: guestName,
  });

  const token = signToken(user.id);
  return res.status(201).json({ token, user: toUserResponse(user) });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, profileImageUrl } = req.body;

  if (typeof name === "string") {
    req.user.name = name;
  }

  if (typeof profileImageUrl === "string") {
    req.user.profileImageUrl = profileImageUrl;
  }

  await req.user.save();
  return res.status(200).json({ user: toUserResponse(req.user) });
});

const me = asyncHandler(async (req, res) => {
  return res.status(200).json({ user: toUserResponse(req.user) });
});

module.exports = {
  registerEmail,
  loginEmail,
  authGoogle,
  authGuest,
  updateProfile,
  me,
};
