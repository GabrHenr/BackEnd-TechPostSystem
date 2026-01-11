const { User } = require("../models/model");
const jwt = require("jsonwebtoken");

const authToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader)
    return res.status(403).send("A token is required for authentication");

  const authHeaderToken = authHeader.split(" ")[1];
  jwt.verify(
    authHeaderToken,
    process.env.ACCESS_TOKEN_SECRET,
    (err, decodedToken) => {
      if (err) return res.status(403).json({ erro: "Invalid Token" });
      next();
    }
  );
};

module.exports = { authToken };
