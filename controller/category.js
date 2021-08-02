const Category = require("../models/category");
const Post = require("../models/post");
const slugify = require("slugify");
const Sub = require("../models/sub");

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await new Category({ name, slug: slugify(name) }).save();
    res.json(category);
  } catch (error) {
    res.status(400).json("Cant create category");
  }
};

exports.list = async (req, res) => {
  const categories = await Category.find({}).sort({ createdAt: -1 }).exec();
  res.json(categories);
};

exports.read = async (req, res) => {
  let category = await Category.findOne({ slug: req.params.slug }).exec();
  const posts = await Post.find({ category }).populate("category").exec();
  res.json(category, posts);
};

exports.update = async (req, res) => {
  const { name } = req.body;
  try {
    const updated = await Category.findOneAndUpdate(
      { slug: req.params.slug },
      { name, slug: slugify(name) },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(400).json("Cant create sub category");
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await Category.findOneAndDelete({ slug: req.params.slug });
    res.json(deleted);
  } catch (error) {
    res.status(400).json("Cant delete category");
  }
};

exports.getSubs = async (req, res) => {
  await Sub.find({ parent: req.params._id }).exec((err, subs) => {
    if (err) console.log(err);
    res.json(subs);
  });
};
