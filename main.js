const express = require("express");
const routes = require("./routes/routes");
const { mongoConnect } = require("./database");
const { authToken } = require("./middlewares/middlewares");
const cookieParser = require("cookie-parser");
const app = express();

app.use(express.json());
app.use(cookieParser());
require("dotenv").config();
const port = process.env.PORT || 3000;

mongoConnect()
  .then(console.log("Success"))
  .catch((err) => console.log(err));

routes.registerRoutes(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
