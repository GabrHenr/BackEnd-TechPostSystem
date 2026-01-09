const { Post } = require("./model");

const allPosts = async (req, res) => {
  try {
    const query = await Post.find({}, [
      "post_title",
      "teacher_name",
      "post_creation_date",
    ]);
    res.send(query);
  } catch {
    res
      .status(500)
      .json({ error: `Error connecting with server to retrieve posts` });
  }
};

const searchPosts = async (req, res) => {
  try {
    const regex = new RegExp(req.query.q, "i");

    const searchRegexQuery = await Post.find({
      $or: [{ post_title: regex }, { post_description: regex }],
    });
    if (searchRegexQuery.length === 0) {
      return res.status(404).json({ success: "No post found" });
    }
    res.send(searchRegexQuery);
  } catch {
    res
      .status(500)
      .json({ erro: "Server error could not connect to the search" });
  }
};

const createPosts = async (req, res) => {
  const {
    teacher_name,
    teacher_id,
    post_title,
    post_description,
    post_video_url,
  } = req.body;

  const postToCreate = new Post({
    teacher_name: teacher_name,
    teacher_id: teacher_id,
    post_title: post_title,
    post_description: post_description,
    post_creation_date: new Date(),
    post_video_url: post_video_url,
  });
  try {
    await postToCreate.save();
    res.status(201).json({ success: "Post created with success" });
  } catch {
    res
      .status(500)
      .json({ error: "Server error could not connect to create post" });
  }
};

const readPost = async (req, res) => {
  try {
    const postToRead = await Post.findById(req.params.id, ["-teacher_id"]);
    res.send(postToRead);
  } catch {
    res
      .status(500)
      .json({ error: "Server error could not connect to retrieve the post" });
  }
};

const editPost = async (req, res) => {
  req.body.post_last_modify_date = new Date();
  try {
    await Post.findByIdAndUpdate(req.params.id, req.body);
    res.status(201).json({ success: "Edited with success" });
  } catch {
    res.status(500).json({ error: "Could not edit post due to server error" });
  }
};

const deletePost = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.status(201).json({ success: "deleted with success" });
  } catch {
    res.status(500).json({ error: "Could not delete due to server error" });
  }
};

module.exports = {
  allPosts,
  searchPosts,
  createPosts,
  readPost,
  editPost,
  deletePost,
};
