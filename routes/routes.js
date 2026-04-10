const postControllers = require("../controllers/postControllers");
const userControllers = require("../controllers/userControllers");
const middlewares = require("../middlewares/middlewares");

const registerRoutes = (app) => {
  app.post("/users/login", userControllers.loginUserHandler);
  app.post("/users/register", middlewares.authToken, middlewares.authAdminOnly, userControllers.registerUserHandler);
  app.get("/users/logout", userControllers.logoutUserHandler);
  app.use(middlewares.authToken);

  app.get("/users", middlewares.authAdminOnly, userControllers.getAllUsersHandler);
  app.get("/users/search", middlewares.authAdminOnly, userControllers.searchUserByEmailHandler);
  app.delete("/users/:id", middlewares.authAdminOnly, userControllers.deleteUserHandler);

  app.get("/posts",postControllers.allPosts);
  app.get("/posts/search", middlewares.searchQueryCheck, postControllers.searchPosts);
  app.post("/posts", middlewares.authTeacher, postControllers.createPosts);
  app.get("/posts/:id", postControllers.readPost);
  app.put("/posts/:id", middlewares.authTeacher,middlewares.canEditDeletePost, postControllers.editPost);
  app.delete("/posts/:id", middlewares.authDeletePermission, middlewares.canEditDeletePost, postControllers.deletePost);
};

module.exports = { registerRoutes };
