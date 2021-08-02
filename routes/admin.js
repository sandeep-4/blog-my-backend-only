const express = require("express");
const router = express.Router();

//controllers
const {
  getAllUSers,
  getUser,
  updateUser,
  deleteUser,
} = require("../controller/auth");
const { isAuthenticated, isAdmin } = require("../middlewares/auth");

//routes
router.get("/admin/users", isAuthenticated, isAdmin, getAllUSers);
router
  .route("/admin/user/:id")
  .get(isAuthenticated, isAdmin, getUser)
  .put(isAuthenticated, isAdmin, updateUser)
  .delete(isAuthenticated, isAdmin, deleteUser);

//routes ends
module.exports = router;
