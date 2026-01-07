const middlewares = require("./middlewares");
const controllers = require("./controllers")

const registerRoutes = (app) => {
  app.get("/posts",controllers.allPosts);

  app.get("/posts/search", middlewares.searchPostCheck ,controllers.searchPosts);

  app.post("/posts",middlewares.createPostCheck,controllers.createPosts);

  app.get("/posts/:id",controllers.readPost);

  app.put("/posts/:id", controllers.editPost);

  app.delete("/posts/:id", controllers.deletePost);
};

module.exports = { registerRoutes };
