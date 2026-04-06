const jwt = require("jsonwebtoken");
const client = require("../databasepg");
require("dotenv").config();

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Token not provided" });
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      return res.status(500).json({ error: "Internal Server Error: Security configuration missing" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await client.query("SELECT * FROM users WHERE user_id = $1", [
      decoded.user_id,
    ]);

    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = decoded; // Attach decoded token data (e.g., user_id) to request
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err);
    return res.status(403).json({ error: "Forbidden: Invalid or expired token" });
  }
};

module.exports = authenticateToken;
