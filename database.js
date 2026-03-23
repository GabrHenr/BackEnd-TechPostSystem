const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

async function mongoConnect() {
  await mongoose.connect(process.env.MONGO_URI);
}

module.exports = { mongoConnect };
