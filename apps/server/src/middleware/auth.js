const User = require("../models/User");
const { verifyToken } = require("../utils/jwt");

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = { requireAuth };
