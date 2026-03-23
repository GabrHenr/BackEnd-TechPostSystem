const { mongoConnect } = require("./database");

const app = require("./src/app");

const port = process.env.PORT || 3000;

mongoConnect()
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error(err));

require("dotenv").config();
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
