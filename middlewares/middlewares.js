const jwt = require("jsonwebtoken");
const { Post, User } = require("../models/model");

const authToken = (req, res, next) => {
  const accessToken = req.cookies?.accessToken;

  if (!accessToken) {
    return res.status(401).json({ error: "Token de acesso não fornecido" });
  }
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expirado" });
      }
      return res.status(401).json({ error: "Token inválido" });
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

const authDeletePermission = (req, res, next) => {
  if (req.user.role == "readWrite" || req.user.role == "userAdm") {
    return next();
  }
  return res.sendStatus(403);
};

const authAdminOnly = (req, res, next) => {
  if (req.user.role === "userAdm") {
    return next();
  }
  return res.status(403).json({ error: "Não autorizado" });
};
const canEditDeletePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post não encontrado" });
    }

    const isOwner = post.user_id.toString() === userId;
    const isAdmin = userRole === "userAdm";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: "Você não tem permissão para modificar este post",
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
};

const searchQueryCheck = (req, res, next) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({
      error: "O parâmetro 'q' é obrigatório",
    });
  }

  const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  req.searchRegex = new RegExp(escapeRegex(q), "i");

  next();
};

module.exports = {
  authToken,
  authTeacher,
  canEditDeletePost,
  searchQueryCheck,
  authDeletePermission,
  authAdminOnly,
};
