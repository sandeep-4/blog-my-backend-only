const Post = require("../models/post");
const User = require("../models/user");

exports.addToSavePost = async (req, res) => {
  const { postId } = req.body;
  const user = await User.findOneAndUpdate(
    { email: req.user.email },
    {
      $addToSet: { savePost: postId },
    }
  ).exec();
  res.json({ ok: true });
};

exports.savedPost = async (req, res) => {
  const list = await User.findOne({ email: req.user.email })
    .select("savePost")
    .populate("savePost")
    .exec();
  res.json(list);
};

exports.removeFromSavePost = async (req, res) => {
  const { postId } = req.params;
  const user = await User.findOneAndUpdate(
    { email: req.user.email },
    {
      $pull: { savePost: postId },
    }
  ).exec();
  res.json({ ok: true });
};
