const Sub = require("../models/sub");
const slugify = require("slugify");

exports.create = async (req, res) => {
  try {
    const { name, parent } = req.body;
    const sub = await new Sub({ name, parent, slug: slugify(name) }).save();
    res.json(sub);
  } catch (error) {
    res.status(400).json("Cant create sub");
  }
};

exports.list = async (req, res) => {
  const subs = await Sub.find({}).sort({ createdAt: -1 }).exec();
  res.json(subs);
};

exports.read = async (req, res) => {
  let sub = await Sub.findOne({ slug: req.params.slug }).exec();
  const posts = await Post.find({ subs: sub }).populate("sub").exec();
  res.json(sub, posts);
};

exports.update = async (req, res) => {
  const { name, parent } = req.body;
  try {
    const updated = await Sub.findOneAndUpdate(
      { slug: req.params.slug },
      {
        name,
        parent,
        slug: slugify(name),
      },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(400).json("Cant create sub sub");
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await Sub.findOneAndDelete({ slug: req.params.slug });
    res.json(deleted);
  } catch (error) {
    res.status(400).json("Cant delete sub");
  }
};
