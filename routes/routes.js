const postControllers = require("../controllers/postControllers");
const userControllers = require("../controllers/userControllers");
const tokenControllers = require("../controllers/tokenControllers");
const middlewares = require("../middlewares/middlewares");
const registerRoutes = (app) => {
  app.get("/users/login", userControllers.loginUserHandler);
  app.get("/users/refresh", tokenControllers.refreshTokenHandler);
  app.post("/users/register", userControllers.registerUserHandler);
  app.get("/users/logout", userControllers.logoutUserHandler);
  app.use(middlewares.authToken);
  //Below here only when token veryfied
  app.get("/posts", postControllers.allPosts);
  app.get("/posts/search", postControllers.searchPosts);
  app.post("/posts", middlewares.authTeacher,postControllers.createPosts);
  app.get("/posts/:id", postControllers.readPost);
  app.put("/posts/:id", postControllers.editPost);
  app.delete("/posts/:id", postControllers.deletePost);
};

module.exports = { registerRoutes };
