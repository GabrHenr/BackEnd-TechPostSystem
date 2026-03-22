const { Post, User } = require("../models/model");

const allPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const amountOfPosts = parseInt(req.query.amountOfPosts) || 5;

  try {
    const posts = await Post.aggregate([
      {
        $facet: {
          metadata: [{ $count: "totalCount" }],
          data: [
            { $skip: (page - 1) * amountOfPosts },
            { $limit: amountOfPosts },
            {
              $project: {
                user_id: 1,
                post_title: 1,
                user_name: 1,
                post_creation_date: 1,
                post_description: 1,
              },
            },
          ],
        },
      },
    ]);

    const totalCount = posts[0]?.metadata[0]?.totalCount || 0;
    const totalPages = Math.ceil(totalCount / amountOfPosts);

    return res.status(200).json({
      metadata: {
        totalCount,
        totalPages,
        page,
        amountOfPosts,
      },
      data: posts[0].data || [],
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error retrieving posts from server",
    });
  }
};
const searchPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const amountOfPosts = parseInt(req.query.amountOfPosts) || 5;
  const query = req.query.q || "";

  try {
    const regex = new RegExp(query, "i");

    const posts = await Post.aggregate([
      {
        $match: {
          $or: [{ post_title: regex }, { post_description: regex }],
        },
      },
      {
        $facet: {
          metadata: [{ $count: "totalCount" }],
          data: [
            { $skip: (page - 1) * amountOfPosts },
            { $limit: amountOfPosts },
            {
              $project: {
                post_title: 1,
                user_name: 1,
                post_creation_date: 1,
                post_description: 1,
              },
            },
          ],
        },
      },
    ]);

    const totalCount = posts[0]?.metadata[0]?.totalCount || 0;
    const totalPages = Math.ceil(totalCount / amountOfPosts);

    return res.status(200).json({
      metadata: {
        totalCount,
        totalPages,
        page,
        amountOfPosts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      data: posts[0].data || [],
    });
  } catch (err) {
    return res.status(500).json({
      error: "Server error while searching posts",
    });
  }
};

const createPosts = async (req, res) => {
  const {
    user_name,
    post_title,
    post_short_description,
    post_description,
    post_video_url,
  } = req.body;

  const postToCreate = new Post({
    user_name: user_name,
    user_id: req.user.id,
    post_title: post_title,
    post_short_description: post_short_description,
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
    const postToRead = await Post.findById(req.params.id);
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
