const createPostCheck = (req, res, next) => {
  if (!req.body.teacher_name)
    return res.status(400).json({ error: "title is required" });
  if (!req.body.teacher_id)
    return res.status(400).json({ error: "teacher id is required" });
  if (!req.body.post_title)
    return res.status(400).json({ error: "post title is required" });
  if (!req.body.post_description)
    return res.status(400).json({ error: "post description is required" });
  next();
};

const searchPostCheck = (req, res, next) => {
  if (req.params.q) {
    console.log("true");
    next();
  } else {
    console.log("false");
    res.status(400).json({ error: "Query string is required" });
  }
};

module.exports = { createPostCheck, searchPostCheck };
