const Post = require("../models/post");
const slugify = require("slugify");

exports.createPost = async (req, res) => {
  const { title, description, address, images } = req.body;
  try {
    const slug = slugify(req.body.title);
    //or do only req.user
    const postedBy = req.user._id;

    const dublicate = await Post.findOne({ slug }).exec();
    if (dublicate) {
      res.status(400).json({ message: "Dublicate title" });
    }
    const post = await new Post({
      title,
      slug,
      description,
      address,
      images,
      postedBy,
    }).save();
    res.json(post);
  } catch (error) {
    res.status(400).json({
      err: err.message,
    });
  }
};

exports.listAll = async (req, res) => {
  let posts = await Post.find({})
    .limit(parseInt(req.params.count))
    .populate("category")
    .populate("subs")
    .sort([["createdAt", "desc"]])
    .exec();
  res.json(posts);
};

exports.read = async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug })
    .populate("category")
    .populate("subs")
    .exec();
  res.json(post);
};

exports.remove = async (req, res) => {
  try {
    const deleted = await Post.findByOneAndRemove({
      slug: req.params.slug,
    }).exec();
    res.json(deleted);
  } catch (error) {
    res.status(400).json("Cant delete");
  }
};

exports.update = async (req, res) => {
  try {
    const { title, description, address, images } = req.body;
    if (title) {
      updateSlug = slugify(title);
    }

    const updated = await Post.findOneAndUpdate(
      { slug: req.params.slug },
      { title, description, address, images, slug: updateSlug },
      { new: true }
    )
      .populate("category")
      .populate("subs")
      .exec();
    res.json(updated);
  } catch (error) {
    res.status(400).json("Cant update");
  }
};

exports.list = async (req, res) => {
  try {
    const { sort, order, page } = req.body;
    const currentPage = page || 1;
    const perPage = 3;

    const posts = await Post.find({})
      .skip((currentPage - 1) * 3)
      .populate("category")
      .populate("subs")
      .sort([sort, order])
      .limit(perPage)
      .exec();

    res.json(posts);
  } catch (error) {
    console.log(error);
  }
};

exports.postCount = async (req, res) => {
  let total = await Post.find({}).estimatedDocumentCount.exec();
  res.json(total);
};

const queryFilter = async (req, res, query) => {
  const posts = await Post.find({ $text: { $search: query } })
    .populate("category", "_id name")
    .populate("subs", "_id name")
    .populate("postedBy", "_id name")
    .exec();
  res.json(posts);
};

const categoryFilter = async (req, res, category) => {
  try {
    const posts = await Post.find({ category })
      .populate("category", "_id name")
      .populate("subs", "_id name")
      .populate("postedBy", "_id name")
      .exec();
    res.json(posts);
  } catch (error) {
    console.log(error);
  }
};

const subsFilter = async (req, res, sub) => {
  try {
    const posts = await Post.find({ sub })
      .populate("category", "_id name")
      .populate("subs", "_id name")
      .populate("postedBy", "_id name")
      .exec();
    res.json(posts);
  } catch (error) {
    console.log(error);
  }
};

exports.filter = async (req, res) => {
  const { query, category, sub } = req.body;
  if (query) {
    await queryFilter(req, res, query);
  }
  if (category) {
    await categoryFilter(req, res, category);
  }
  if (sub) {
    await subsFilter(req, res, sub);
  }
};

//related posts
exports.listRelated = async (req, res) => {
  const post = await Post.findById(req.params.postId).exec();
  const related = await Post.find({
    _id: { $ne: post._id },
    category: post.category,
  })
    .limit(3)
    .populate("category", "_id name")
    .populate("sub", "_id name")
    .populate("postedBy", "_id name")
    .exec();

  res.json(related);
};

exports.removePost = async (req, res) => {
  const postUser = await Post.findOne({ slug: req.params.slug })
    .select("postedBy")
    .populate("postedBy")
    .exec();
  if (req.user._id.toString() === postedUser.postedBy.toString()) {
    await Post.findOneAndDelete({ slug: req.params.slug }).exec();
    res.json({ ok: true });
  } else {
    res.json("Acess denied");
  }
};
