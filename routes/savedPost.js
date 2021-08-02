const express = require("express");
const {
  savedPost,
  addToSavePost,
  removeFromSavePost,
} = require("../controller/savePost");
const router = express.Router();
//controllers
const { isAuthenticated } = require("../middlewares/auth");

router.post("/user/saved", isAuthenticated, addToSavePost);
router.get("/user/saved", isAuthenticated, savedPost);
router.put("/user/saved/:postId", isAuthenticated, removeFromSavePost);

module.exports = router;
