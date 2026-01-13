const express = require("express");
const routes = require("../routes/routes");
const cookieParser = require("cookie-parser");
const app = express();


app.use(express.json());
app.use(cookieParser());
routes.registerRoutes(app);

module.exports = app;
