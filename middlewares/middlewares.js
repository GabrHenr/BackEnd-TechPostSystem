const jwt = require("jsonwebtoken");
const { Post } = require("../models/model");

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
      return res.status(401).json({ error: "Invalid token" });
    }
    req.user = decoded;
    return next();
  });
};

const authTeacher = (req, res, next) => {
  if (req.user.role == "readWrite") {
    return next();
  }
  return res.sendStatus(403);
};

const canEditPost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (post.user_id !== userId) {
      return res.status(403).json({ error: "You are not the post owner" });
    }
    next();
  } catch (err) {
    return res.status(500).json({ error: "Internal server erro" });
  }
};

const searchQueryCheck = (req, res, next) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({
      error: "Query parameter 'q' is required",
    });
  }

  const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  req.searchRegex = new RegExp(escapeRegex(q), "i");

  next();
};

module.exports = { authToken, authTeacher, canEditPost, searchQueryCheck };
