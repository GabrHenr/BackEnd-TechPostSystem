const express = require("express");
const cors = require("cors");
const routes = require("../routes/routes");
const cookieParser = require("cookie-parser");
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://frontend:5173"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
routes.registerRoutes(app);

module.exports = app;
