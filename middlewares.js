const authToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    if (token !== "token") {
      throw new Error("invalid token");
    }
    next();
  } catch (err) {
    return res.status(403).send("A token is required for authentication");
  }
};
module.exports = {authToken};
