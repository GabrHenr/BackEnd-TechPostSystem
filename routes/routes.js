
const controllers = require("../controllers/postcontrollers");
const userControllers = require("../controllers/userontroller")
const middlewares = require("../middlewares/middlewares")
const registerRoutes = (app) => {
  app.get("/users/login", userControllers.loginUserHandler);

  app.post("/users/register", userControllers.registerUserHandler);

  app.get("/posts", controllers.allPosts);

  app.get("/posts/search", controllers.searchPosts);

  app.post("/posts", controllers.createPosts);

  app.get("/posts/:id", controllers.readPost);

  app.put("/posts/:id", controllers.editPost);

  app.delete("/posts/:id", controllers.deletePost);
};

module.exports = { registerRoutes };
