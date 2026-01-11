const { User } = require("../models/model");
const jwt = require("jsonwebtoken");

const refreshTokenHandler = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(401);

  const refreshToken = cookies.jwt;
  const foundUser = await User.findOne({ user_token: refreshToken });
  if (foundUser == null) return res.sendStatus(403);
  //evaluate JWT

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || foundUser.user_email !== decoded.username)
      return res.status(401).json({ error: "ta aqui" });
    const accessToken = jwt.sign(
      {
        username: decoded.username,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "20m" }
    );
    res.json({ user_Token: accessToken });
  });
};
module.exports = { refreshTokenHandler };
