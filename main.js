const { mongoConnect } = require("./database");
const seedAdminUser = require("./services/seed");

const app = require("./src/app");

const port = process.env.PORT || 3000;

mongoConnect()
  .then(async () => {
    console.log("MongoDB conectado");
    await seedAdminUser();
  })
  .catch((err) => console.error(err));

require("dotenv").config();
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
