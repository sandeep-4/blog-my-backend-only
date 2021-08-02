const Post = require("../models/post");

exports.like = async (req, res) => {
  await Post.findOneAndUpdate(
    req.body.id,
    {
      $push: { likes: req.user.id },
    },
    { new: true }
  ).exec((err, result) => {
    if (err) {
      res.status(400).json("cant like");
    }
    res.json(result);
  });
};

exports.unlike = async (req, res) => {
  await Post.findOneAndUpdate(
    req.body.id,
    {
      $pull: { likes: req.user.id },
    },
    { new: true }
  ).exec((err, result) => {
    if (err) {
      res.status(400).json({ err: "cant unlike" });
    }
    res.json(result);
  });
};

exports.comment = async (req, res) => {
  const comment = {
    text: req.body.text,
    postedBy: req.user._id,
  };
  await Post.findOneAndUpdate(
    req.body.id,
    {
      $push: { comments: comment },
    },
    { new: true }
  )
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name")
    .exec((err, result) => {
      if (err) {
        return res.json({ err: "cant comment" });
      }
    });
};
