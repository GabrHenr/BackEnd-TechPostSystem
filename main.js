const express = require("express");
const routes = require("./routes");
const { mongoConnect } = require("./database");
const app = express();
app.use(express.json())
require('dotenv').config();

mongoConnect().then(console.log("Success")).catch((err) => console.log(err));

routes.registerRoutes(app);
app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});
