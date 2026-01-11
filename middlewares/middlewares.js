const jwt = require("jsonwebtoken");

const authToken = (req, res, next) => {
  const accessToken = req.cookies?.accessToken;
  if (!accessToken) {
    return res.status(401).json({ error: "Access token not provided" });
  }
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expired" });
      }
      console.error("JWT error:", err.message);
      console.error("JWT error:", decoded);
      return res.status(401).json({ error: "Invalid token" });
    }
    req.user = decoded;
    return next();
  });
};

const authTeacher = (req, res, next) => {
  if (req.body.role !== "readWrite") return res.sendStatus(401);
  next();
};

module.exports = { authToken, authTeacher };
