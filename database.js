const mongoose = require("mongoose");

async function mongoConnect(params) {
  await mongoose.connect("mongodb://localhost:27017/postsDB");
}

module.exports = { mongoConnect };
