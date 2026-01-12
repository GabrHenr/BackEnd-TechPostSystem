const { mongoConnect } = require("./database");

const app = require("./src/app");
require("dotenv").config();

const port = process.env.PORT || 3000;

mongoConnect()
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error(err));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
