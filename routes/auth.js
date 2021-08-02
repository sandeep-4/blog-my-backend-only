const express = require("express");
const router = express.Router();

//controllers
const {
  createUser,
  login,
  forgotPassword,
  resetPassword,
  logout,
  currentUser,
  updatePassword,
  updateProfile,
  follow,
  unfollow,
  userStar,
  searchUser,
} = require("../controller/auth");
const { isAuthenticated, isAdmin } = require("../middlewares/auth");

//routes
router.post("/register", createUser);
router.post("/login", login);
router.post("/password/forgot-password", forgotPassword);
router.post("/password/reset/:token", resetPassword);
router.post("/logout", logout);

router.post("/current-user", isAuthenticated, currentUser);
router.post("/current-admin", isAuthenticated, isAdmin, currentUser);
router.put("/password/update", isAuthenticated, updatePassword);
router.put("/me/update", isAuthenticated, updateProfile);
//follow
router.put("/follow", isAuthenticated, follow);
router.put("/unfollow", isAuthenticated, unfollow);
//review
router.put("/user/star/:id", isAuthenticated, userStar);

router.get("/user/search", searchUser);

//routes ends
module.exports = router;
