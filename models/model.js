const mongoose = require("mongoose");

const Post = mongoose.model(
  "Post",
  new mongoose.Schema({
    teacher_name: { type: "String" },
    teacher_id: { type: "UUID" },
    post_title: { type: "String" },
    post_description: { type: "String" },
    post_creation_date: { type: "Date" },
    post_last_modify_date: { type: "Date" },
    post_video_url: { type: "String" },
  })
);

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    user_name: { type: "String" },
    user_email: { type: "String" },
    user_pass: { type: "String" },
    role: { type: "String" },
  })
);
module.exports = { Post, User };
