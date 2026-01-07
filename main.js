const express = require("express");
const routes = require("./routes");
const { mongoConnect } = require("./database");
const {authToken} = require("./middlewares");
const app = express();
app.use(express.json())
require('dotenv').config();
const port = process.env.PORT||3000

mongoConnect().then(console.log("Success")).catch((err) => console.log(err));

app.use(authToken)
routes.registerRoutes(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
