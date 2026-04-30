const { Post, User } = require("../models/model");

const allPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const amountOfPosts =
    parseInt(req.query.limit) || parseInt(req.query.amountOfPosts) || 5;
  const userId = req.query.userId;

  try {
    const pipeline = [];


    if (userId) {
      pipeline.push({
        $match: {
          user_id: userId,
        },
      });
    }


    pipeline.push({
      $facet: {
        metadata: [{ $count: "totalCount" }],
        data: [
          {
            $sort: {
              post_creation_date: -1,
            },
          },
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
    });

    const posts = await Post.aggregate(pipeline);

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
      error: "Erro ao recuperar posts do servidor",
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
      error: "Erro do servidor ao buscar posts",
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
    res.status(201).json({ success: "Post criado com sucesso", postCreated });
  } catch {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

const readPost = async (req, res) => {
  try {
    const postToRead = await Post.findById(req.params.id);
    if (!postToRead) {
      return res.status(404).json({ error: "Post não encontrado" });
    }
    return res.status(200).json(postToRead);
  } catch {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

const editPost = async (req, res) => {
  req.body.post_last_modify_date = new Date();
  try {
    await Post.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json({ success: "Editado com sucesso" });
  } catch {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

const deletePost = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.sendStatus(200);
  } catch {
    res.status(500).json({ error: "Erro interno do servidor" });
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
