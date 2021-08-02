const express = require("express");
const { like, comment, unlike } = require("../controller/likes");
const router = express.Router();
//controllers
const {
  list,
  createPost,
  listAll,
  listRelated,
  remove,
  read,
  update,
  filter,
  removePost,
  postCount,
} = require("../controller/post");
const { isAuthenticated, isAdmin } = require("../middlewares/auth");

router.post("/post", isAuthenticated, isAdmin, createPost);
router.get("/post/total", postCount);
router.get("/post/:count", listAll);
router.get("/post/related/:postId", listRelated);

router.delete("/post/:slug", isAuthenticated, isAdmin, remove);
router.get("/post/:slug", read);
router.put("/post/:slug", isAuthenticated, isAdmin, update);
router.delete("/user/post/:slug", isAuthenticated, removePost);

router.post("/posts", list);

router.post("/post/search", filter);

//like and comment
router.put("/post/like", isAuthenticated, like);
router.put("/post/unlike", isAuthenticated, unlike);
router.put("/post/comment", isAuthenticated, comment);

module.exports = router;
