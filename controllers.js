const { Post } = require("./model");

const allPosts = async (req, res) => {
  const query = await Post.find({}, [
    "post_title",
    "teacher_name",
    "post_creation_date",
  ]);
  res.send(query);
};

const searchPosts = async (req, res) => {
  const regex = new RegExp(req.params.q, "i");

  const searchRegexQuery = await Post.find({
    $or: [{ post_title: regex }, { post_description: regex }],
  }).catch((err) => res.send(err));
  res.send(searchRegexQuery);
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

  await postToCreate
    .save()
    .then(res.send("New post Created"))
    .catch((err) => console.log(err));
};

const readPost = async (req, res) => {
  const query = await Post.findById(req.params.id, ["-teacher_id"]);
  res.send(query.errors);
};

const editPost = async (req, res) => {
  req.body.post_last_modify_date = new Date();
  await Post.findByIdAndUpdate(req.params.id, req.body)
    .then(res.send("Success"))
    .catch((err) => res.send(err));
};

const deletePost = async (req, res) => {
  await Post.findByIdAndDelete(req.params.id)
    .then(res.send("Deletado"))
    .catch((err) => res.send(err));
};

module.exports = {
  allPosts,
  searchPosts,
  createPosts,
  readPost,
  editPost,
  deletePost,
};
