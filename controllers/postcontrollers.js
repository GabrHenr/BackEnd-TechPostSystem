const { Post, User } = require("../models/model");

const allPosts = async (req, res) => {
  try {
    const posts = await Post.find({}).select(
      "post_title user_name post_creation_date"
    );

    return res.status(200).json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    return res.status(500).json({
      error: "Error retrieving posts from server",
    });
  }
};

const searchPosts = async (req, res) => {
  try {
    const posts = await Post.find(
      {
        $or: [
          { post_title: req.searchRegex },
          { post_description: req.searchRegex },
        ],
      },
      ["post_title", "user_name", "post_creation_date"]
    );
    return res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json({
      error: "Server error while searching posts",
    });
  }
};

const createPosts = async (req, res) => {
  const { user_name, post_title, post_description, post_video_url } = req.body;

  const postToCreate = new Post({
    user_name: user_name,
    user_id: req.user.id,
    post_title: post_title,
    post_description: post_description,
    post_creation_date: new Date(),
    post_video_url: post_video_url,
  });
  try {
    const postCreated = await postToCreate.save();
    res.status(201).json({ success: "Post created with success", postCreated });
  } catch {
    res.status(500).json({ error: "Internal server erro" });
  }
};

const readPost = async (req, res) => {
  try {
    const postToRead = await Post.findById(req.params.id, ["-user_id"]);
    if (!postToRead) {
      return res.status(404).json({ error: "Post not found" });
    }
    return res.status(200).json(postToRead);
  } catch {
    res.status(500).json({ error: "Internal server erro" });
  }
};

const editPost = async (req, res) => {
  req.body.post_last_modify_date = new Date();
  try {
    await Post.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json({ success: "Edited with success" });
  } catch {
    res.status(500).json({ error: "Internal server erro" });
  }
};

const deletePost = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.sendStatus(200);
  } catch {
    res.status(500).json({ error: "Internal server erro" });
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
