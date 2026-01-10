const mongoose = require("mongoose");

async function mongoConnect() {
  await mongoose.connect(process.env.MONGO_URI);
}

module.exports = { mongoConnect };
